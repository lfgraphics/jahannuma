#!/usr/bin/env node

/**
 * Route Analysis Utility for Multilingual Route Completion
 *
 * This script analyzes the app directory structure and identifies missing routes
 * in EN and HI language directories compared to the default structure.
 */

const fs = require("fs");
const path = require("path");

class RouteAnalyzer {
  constructor() {
    this.appDir = path.join(process.cwd(), "app");
    this.defaultRoutes = new Map();
    this.enRoutes = new Map();
    this.hiRoutes = new Map();
    this.missingRoutes = {
      EN: [],
      HI: [],
    };
    this.routePatterns = {
      dynamic: [],
      static: [],
      nested: [],
    };
  }

  /**
   * Recursively scan directory and build route structure
   */
  scanDirectory(dirPath, routeMap, prefix = "") {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const routePath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.isDirectory()) {
        // Skip certain directories
        if (["api", "Components", "types"].includes(item.name)) {
          continue;
        }

        // Record directory as route
        routeMap.set(routePath, {
          type: "directory",
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: false,
          children: new Map(),
        });

        // Recursively scan subdirectories
        this.scanDirectory(
          itemPath,
          routeMap.get(routePath).children,
          routePath
        );
      } else if (item.name === "page.tsx") {
        // Mark parent directory as having a page file
        if (routeMap.has(prefix)) {
          routeMap.get(prefix).hasPageFile = true;
        } else if (prefix === "") {
          // Root page
          routeMap.set("/", {
            type: "page",
            path: itemPath,
            isDynamic: false,
            hasPageFile: true,
            children: new Map(),
          });
        }
      }
    }
  }

  /**
   * Check if route name indicates dynamic routing
   */
  isDynamicRoute(routeName) {
    return routeName.startsWith("[") && routeName.endsWith("]");
  }

  /**
   * Get dynamic route pattern type
   */
  getDynamicPattern(routeName) {
    if (routeName.includes("[slug]")) return "slug";
    if (routeName.includes("[id]")) return "id";
    if (routeName.includes("[name]")) return "name";
    if (routeName.includes("[unwan]")) return "unwan";
    if (routeName.includes("[...")) return "catch-all";
    if (routeName.startsWith("[") && routeName.endsWith("]"))
      return "single-param";
    return "unknown";
  }

  /**
   * Analyze route structures and identify missing routes
   */
  analyzeRoutes() {
    console.log("🔍 Analyzing route structures...\n");

    // Scan default app structure (excluding EN and HI)
    this.scanDefaultRoutes();

    // Scan EN directory
    const enDir = path.join(this.appDir, "EN");
    if (fs.existsSync(enDir)) {
      this.scanDirectory(enDir, this.enRoutes);
    }

    // Scan HI directory
    const hiDir = path.join(this.appDir, "HI");
    if (fs.existsSync(hiDir)) {
      this.scanDirectory(hiDir, this.hiRoutes);
    }

    // Compare and identify missing routes
    this.identifyMissingRoutes();
    this.categorizeRoutePatterns();
  }

  /**
   * Scan default app structure (excluding language directories)
   */
  scanDefaultRoutes() {
    const items = fs.readdirSync(this.appDir, { withFileTypes: true });

    for (const item of items) {
      // Skip language directories and certain system directories
      if (["EN", "HI", "api", "Components", "types"].includes(item.name)) {
        continue;
      }

      if (item.isDirectory()) {
        const itemPath = path.join(this.appDir, item.name);
        this.defaultRoutes.set(item.name, {
          type: "directory",
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: false,
          children: new Map(),
        });

        this.scanDirectory(
          itemPath,
          this.defaultRoutes.get(item.name).children,
          item.name
        );
      }
    }

    // Check for root page
    const rootPagePath = path.join(this.appDir, "page.tsx");
    if (fs.existsSync(rootPagePath)) {
      this.defaultRoutes.set("/", {
        type: "page",
        path: rootPagePath,
        isDynamic: false,
        hasPageFile: true,
        children: new Map(),
      });
    }
  }

  /**
   * Compare default routes with language directories to find missing routes
   */
  identifyMissingRoutes() {
    // Check missing routes in EN
    this.findMissingInLanguage(this.defaultRoutes, this.enRoutes, "EN");

    // Check missing routes in HI
    this.findMissingInLanguage(this.defaultRoutes, this.hiRoutes, "HI");
  }

  /**
   * Find missing routes in a specific language directory
   */
  findMissingInLanguage(defaultRoutes, langRoutes, language, prefix = "") {
    for (const [routeName, routeInfo] of defaultRoutes) {
      const fullRoutePath = prefix ? `${prefix}/${routeName}` : routeName;

      // Skip root page for language directories
      if (routeName === "/") continue;

      if (!langRoutes.has(routeName)) {
        this.missingRoutes[language].push({
          route: fullRoutePath,
          type: routeInfo.type,
          isDynamic: routeInfo.isDynamic,
          hasPageFile: routeInfo.hasPageFile,
          pattern: routeInfo.isDynamic
            ? this.getDynamicPattern(routeName)
            : "static",
          priority: this.getRoutePriority(routeName, routeInfo),
        });
      } else {
        // Check nested routes
        const langRouteInfo = langRoutes.get(routeName);
        if (routeInfo.children && routeInfo.children.size > 0) {
          this.findMissingInLanguage(
            routeInfo.children,
            langRouteInfo.children || new Map(),
            language,
            fullRoutePath
          );
        }
      }
    }
  }

  /**
   * Determine route priority based on importance
   */
  getRoutePriority(routeName, routeInfo) {
    // High priority routes
    const highPriorityRoutes = [
      "E-Books",
      "Ashaar",
      "Ghazlen",
      "Nazmen",
      "Rubai",
      "Shaer",
      "Favorites",
      "sign-in",
      "sign-up",
    ];

    // Medium priority routes
    const mediumPriorityRoutes = [
      "Founders",
      "Interview",
      "privacypolicy",
      "terms&conditions",
      "cancellation&refund",
      "shipping&delivery",
    ];

    if (highPriorityRoutes.includes(routeName)) return "high";
    if (mediumPriorityRoutes.includes(routeName)) return "medium";
    if (routeInfo.isDynamic) return "high"; // Dynamic routes are generally high priority

    return "low";
  }

  /**
   * Categorize route patterns for documentation
   */
  categorizeRoutePatterns() {
    const allRoutes = [...this.missingRoutes.EN, ...this.missingRoutes.HI];

    for (const route of allRoutes) {
      if (route.isDynamic) {
        if (
          !this.routePatterns.dynamic.find((p) => p.pattern === route.pattern)
        ) {
          this.routePatterns.dynamic.push({
            pattern: route.pattern,
            examples: [route.route],
            description: this.getPatternDescription(route.pattern),
          });
        } else {
          const existing = this.routePatterns.dynamic.find(
            (p) => p.pattern === route.pattern
          );
          if (!existing.examples.includes(route.route)) {
            existing.examples.push(route.route);
          }
        }
      } else {
        this.routePatterns.static.push({
          route: route.route,
          priority: route.priority,
        });
      }

      // Check for nested routes
      if (route.route.includes("/")) {
        this.routePatterns.nested.push({
          route: route.route,
          depth: route.route.split("/").length - 1,
          isDynamic: route.isDynamic,
        });
      }
    }

    // Remove duplicates from static routes
    this.routePatterns.static = this.routePatterns.static.filter(
      (route, index, self) =>
        index === self.findIndex((r) => r.route === route.route)
    );

    // Remove duplicates from nested routes
    this.routePatterns.nested = this.routePatterns.nested.filter(
      (route, index, self) =>
        index === self.findIndex((r) => r.route === route.route)
    );
  }

  /**
   * Get description for dynamic route patterns
   */
  getPatternDescription(pattern) {
    const descriptions = {
      slug: "URL-friendly identifier for content items",
      id: "Unique identifier for specific records",
      name: "Name-based routing for poets/authors",
      unwan: "Title-based routing for content categories",
      "catch-all": "Catch-all routes for flexible routing",
      "single-param": "Single parameter dynamic routes",
    };

    return descriptions[pattern] || "Dynamic route parameter";
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMissingEN: this.missingRoutes.EN.length,
        totalMissingHI: this.missingRoutes.HI.length,
        highPriorityEN: this.missingRoutes.EN.filter(
          (r) => r.priority === "high"
        ).length,
        highPriorityHI: this.missingRoutes.HI.filter(
          (r) => r.priority === "high"
        ).length,
      },
      missingRoutes: this.missingRoutes,
      routePatterns: this.routePatterns,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  /**
   * Generate implementation recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // High priority missing routes
    const highPriorityEN = this.missingRoutes.EN.filter(
      (r) => r.priority === "high"
    );
    const highPriorityHI = this.missingRoutes.HI.filter(
      (r) => r.priority === "high"
    );

    if (highPriorityEN.length > 0) {
      recommendations.push({
        type: "critical",
        message: `${highPriorityEN.length} high-priority routes missing in EN directory`,
        routes: highPriorityEN.map((r) => r.route),
      });
    }

    if (highPriorityHI.length > 0) {
      recommendations.push({
        type: "critical",
        message: `${highPriorityHI.length} high-priority routes missing in HI directory`,
        routes: highPriorityHI.map((r) => r.route),
      });
    }

    // Dynamic route patterns
    if (this.routePatterns.dynamic.length > 0) {
      recommendations.push({
        type: "implementation",
        message:
          "Implement dynamic route patterns consistently across languages",
        patterns: this.routePatterns.dynamic,
      });
    }

    // Nested route complexity
    const deepNested = this.routePatterns.nested.filter((r) => r.depth > 2);
    if (deepNested.length > 0) {
      recommendations.push({
        type: "complexity",
        message:
          "Complex nested routes require careful component dependency management",
        routes: deepNested.map((r) => r.route),
      });
    }

    return recommendations;
  }

  /**
   * Print formatted report to console
   */
  printReport() {
    const report = this.generateReport();

    console.log("📊 MULTILINGUAL ROUTE ANALYSIS REPORT");
    console.log("=====================================\n");

    // Summary
    console.log("📈 SUMMARY");
    console.log(
      `• Total missing routes in EN: ${report.summary.totalMissingEN}`
    );
    console.log(
      `• Total missing routes in HI: ${report.summary.totalMissingHI}`
    );
    console.log(
      `• High priority missing in EN: ${report.summary.highPriorityEN}`
    );
    console.log(
      `• High priority missing in HI: ${report.summary.highPriorityHI}\n`
    );

    // Missing routes by priority
    this.printMissingRoutesByPriority("EN", report.missingRoutes.EN);
    this.printMissingRoutesByPriority("HI", report.missingRoutes.HI);

    // Route patterns
    console.log("🔄 DYNAMIC ROUTE PATTERNS");
    console.log("-------------------------");
    for (const pattern of report.routePatterns.dynamic) {
      console.log(`• ${pattern.pattern}: ${pattern.description}`);
      console.log(`  Examples: ${pattern.examples.slice(0, 3).join(", ")}`);
      if (pattern.examples.length > 3) {
        console.log(`  ... and ${pattern.examples.length - 3} more`);
      }
      console.log();
    }

    // Recommendations
    console.log("💡 RECOMMENDATIONS");
    console.log("------------------");
    for (const rec of report.recommendations) {
      console.log(`${this.getRecommendationIcon(rec.type)} ${rec.message}`);
      if (rec.routes) {
        console.log(`   Routes: ${rec.routes.slice(0, 5).join(", ")}`);
        if (rec.routes.length > 5) {
          console.log(`   ... and ${rec.routes.length - 5} more`);
        }
      }
      console.log();
    }

    return report;
  }

  /**
   * Print missing routes grouped by priority
   */
  printMissingRoutesByPriority(language, routes) {
    console.log(`🚨 MISSING ROUTES IN ${language}`);
    console.log("------------------------");

    const byPriority = {
      high: routes.filter((r) => r.priority === "high"),
      medium: routes.filter((r) => r.priority === "medium"),
      low: routes.filter((r) => r.priority === "low"),
    };

    for (const [priority, routeList] of Object.entries(byPriority)) {
      if (routeList.length > 0) {
        console.log(
          `\n${priority.toUpperCase()} PRIORITY (${routeList.length} routes):`
        );
        for (const route of routeList) {
          const icon = route.isDynamic ? "🔄" : "📄";
          const type = route.isDynamic ? `[${route.pattern}]` : "[static]";
          console.log(`  ${icon} ${route.route} ${type}`);
        }
      }
    }
    console.log();
  }

  /**
   * Get icon for recommendation type
   */
  getRecommendationIcon(type) {
    const icons = {
      critical: "🔴",
      implementation: "🔧",
      complexity: "⚠️",
      optimization: "⚡",
    };
    return icons[type] || "💡";
  }

  /**
   * Save report to JSON file
   */
  saveReport(filename = "route-analysis-report.json") {
    const report = this.generateReport();
    const reportPath = path.join(process.cwd(), filename);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    return reportPath;
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new RouteAnalyzer();

  try {
    analyzer.analyzeRoutes();
    const report = analyzer.printReport();

    // Save detailed report
    analyzer.saveReport();

    // Exit with error code if critical issues found
    const criticalIssues = report.recommendations.filter(
      (r) => r.type === "critical"
    );
    if (criticalIssues.length > 0) {
      console.log(
        `\n❌ Found ${criticalIssues.length} critical issues that need immediate attention.`
      );
      process.exit(1);
    } else {
      console.log(
        "\n✅ Analysis complete. Review the report for implementation guidance."
      );
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error during route analysis:", error.message);
    process.exit(1);
  }
}

module.exports = RouteAnalyzer;
