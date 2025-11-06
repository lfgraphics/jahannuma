#!/usr/bin/env node

/**
 * Route Completeness Validation CLI
 *
 * Command-line utility to validate route parity across languages
 * and detect missing routes automatically.
 */

const { RouteCompletenessValidator } = require("../lib/route-validator-cli.js");
const path = require("path");

class ValidationCLI {
  constructor() {
    this.validator = new RouteCompletenessValidator();
  }

  /**
   * Parse command line arguments
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      command: "validate",
      output: null,
      language: null,
      route: null,
      quiet: false,
      json: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--help":
        case "-h":
          this.showHelp();
          process.exit(0);
          break;

        case "--output":
        case "-o":
          options.output = args[++i];
          break;

        case "--language":
        case "-l":
          options.language = args[++i];
          if (!["EN", "HI"].includes(options.language)) {
            console.error("❌ Invalid language. Use EN or HI");
            process.exit(1);
          }
          break;

        case "--route":
        case "-r":
          options.route = args[++i];
          break;

        case "--quiet":
        case "-q":
          options.quiet = true;
          break;

        case "--json":
        case "-j":
          options.json = true;
          break;

        case "validate":
          options.command = "validate";
          break;

        case "check":
          options.command = "check";
          break;

        case "missing":
          options.command = "missing";
          break;

        case "route":
          options.command = "route";
          break;

        default:
          if (arg.startsWith("-")) {
            console.error(`❌ Unknown option: ${arg}`);
            process.exit(1);
          }
      }
    }

    return options;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🔍 Route Completeness Validation CLI

USAGE:
  node scripts/validate-route-completeness.js [COMMAND] [OPTIONS]

COMMANDS:
  validate    Perform full route completeness validation (default)
  check       Quick validation check (returns exit code only)
  missing     List missing routes for specific language
  route       Check if specific route exists in both languages

OPTIONS:
  -l, --language <EN|HI>    Target language for missing/route commands
  -r, --route <path>        Specific route path for route command
  -o, --output <file>       Save report to JSON file
  -q, --quiet              Suppress console output
  -j, --json               Output results in JSON format
  -h, --help               Show this help message

EXAMPLES:
  # Full validation with report
  node scripts/validate-route-completeness.js validate

  # Quick check (CI/CD friendly)
  node scripts/validate-route-completeness.js check

  # List missing routes in EN directory
  node scripts/validate-route-completeness.js missing --language EN

  # Check specific route
  node scripts/validate-route-completeness.js route --route "E-Books/[slug]/[id]"

  # Save detailed report to file
  node scripts/validate-route-completeness.js validate --output validation-report.json

  # JSON output for programmatic use
  node scripts/validate-route-completeness.js validate --json --quiet
`);
  }

  /**
   * Execute the specified command
   */
  async execute() {
    const options = this.parseArgs();

    try {
      switch (options.command) {
        case "validate":
          await this.runFullValidation(options);
          break;

        case "check":
          await this.runQuickCheck(options);
          break;

        case "missing":
          await this.runMissingRoutes(options);
          break;

        case "route":
          await this.runRouteCheck(options);
          break;

        default:
          console.error(`❌ Unknown command: ${options.command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error("❌ Validation failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Run full validation
   */
  async runFullValidation(options) {
    if (!options.quiet) {
      console.log("🔍 Running full route completeness validation...\n");
    }

    const result = await this.validator.validateRouteCompleteness();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (!options.quiet) {
      this.validator.printValidationReport(result);
    }

    if (options.output) {
      this.validator.saveValidationReport(result, options.output);
    }

    // Exit with error code if validation failed
    if (!result.isValid) {
      const criticalErrors = result.validationErrors.filter(
        (e) => e.severity === "critical"
      ).length;
      if (!options.quiet) {
        console.log(
          `\n❌ Validation failed with ${criticalErrors} critical errors`
        );
      }
      process.exit(1);
    } else {
      if (!options.quiet) {
        console.log("\n✅ All route completeness checks passed");
      }
      process.exit(0);
    }
  }

  /**
   * Run quick validation check
   */
  async runQuickCheck(options) {
    if (!options.quiet) {
      console.log("⚡ Running quick validation check...");
    }

    const isValid = await this.validator.quickValidation();

    if (options.json) {
      console.log(
        JSON.stringify({ isValid, timestamp: new Date().toISOString() })
      );
    } else if (!options.quiet) {
      const status = isValid ? "✅ PASSED" : "❌ FAILED";
      console.log(`Route validation: ${status}`);
    }

    process.exit(isValid ? 0 : 1);
  }

  /**
   * Run missing routes check
   */
  async runMissingRoutes(options) {
    if (!options.language) {
      console.error(
        "❌ Language is required for missing routes command. Use --language EN or --language HI"
      );
      process.exit(1);
    }

    if (!options.quiet) {
      console.log(
        `🔍 Checking missing routes in ${options.language} directory...\n`
      );
    }

    const missingRoutes = await this.validator.getMissingRoutesForLanguage(
      options.language
    );

    if (options.json) {
      console.log(
        JSON.stringify({ language: options.language, missingRoutes }, null, 2)
      );
    } else {
      if (missingRoutes.length === 0) {
        console.log(
          `✅ No missing routes found in ${options.language} directory`
        );
      } else {
        console.log(
          `📋 Missing routes in ${options.language} directory (${missingRoutes.length} total):\n`
        );

        // Group by priority
        const byPriority = {
          high: missingRoutes.filter((r) => r.priority === "high"),
          medium: missingRoutes.filter((r) => r.priority === "medium"),
          low: missingRoutes.filter((r) => r.priority === "low"),
        };

        for (const [priority, routes] of Object.entries(byPriority)) {
          if (routes.length > 0) {
            const icon =
              priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "🟢";
            console.log(
              `${icon} ${priority.toUpperCase()} PRIORITY (${
                routes.length
              } routes):`
            );

            routes.forEach((route) => {
              const typeIcon = route.isDynamic ? "🔄" : "📄";
              const pattern = route.isDynamic
                ? `[${route.pattern}]`
                : "[static]";
              console.log(
                `  ${typeIcon} ${route.route} ${pattern} (${route.section})`
              );
            });
            console.log();
          }
        }
      }
    }

    process.exit(missingRoutes.length > 0 ? 1 : 0);
  }

  /**
   * Run specific route check
   */
  async runRouteCheck(options) {
    if (!options.route) {
      console.error(
        '❌ Route path is required for route command. Use --route "path/to/route"'
      );
      process.exit(1);
    }

    if (!options.quiet) {
      console.log(`🔍 Checking route: ${options.route}\n`);
    }

    const result = this.validator.validateSpecificRoute(options.route);

    if (options.json) {
      console.log(
        JSON.stringify({ route: options.route, exists: result }, null, 2)
      );
    } else {
      console.log(`Route: ${options.route}`);
      console.log(`  EN: ${result.EN ? "✅ EXISTS" : "❌ MISSING"}`);
      console.log(`  HI: ${result.HI ? "✅ EXISTS" : "❌ MISSING"}`);

      const allExist = result.EN && result.HI;
      console.log(`\nStatus: ${allExist ? "✅ COMPLETE" : "❌ INCOMPLETE"}`);
    }

    const allExist = result.EN && result.HI;
    process.exit(allExist ? 0 : 1);
  }
}

// Execute CLI if run directly
if (require.main === module) {
  const cli = new ValidationCLI();
  cli.execute().catch((error) => {
    console.error("❌ CLI execution failed:", error.message);
    process.exit(1);
  });
}

module.exports = ValidationCLI;
