#!/usr/bin/env node

/**
 * Component Dependency Mapper
 *
 * This script analyzes component dependencies across route patterns
 * to understand what needs to be replicated for missing routes.
 */

const fs = require("fs");
const path = require("path");

class ComponentDependencyMapper {
  constructor() {
    this.appDir = path.join(process.cwd(), "app");
    this.dependencies = new Map();
    this.routePatterns = new Map();
    this.componentUsage = new Map();
  }

  /**
   * Analyze a TypeScript/React file for dependencies
   */
  analyzeFileDependencies(filePath) {
    if (!fs.existsSync(filePath) || !filePath.endsWith(".tsx")) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const dependencies = [];

      // Extract import statements
      const importRegex =
        /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*(?:,\s*{[^}]*})?\s*from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Categorize imports
        const category = this.categorizeImport(importPath);
        dependencies.push({
          path: importPath,
          category,
          isLocal: importPath.startsWith(".") || importPath.startsWith("@/"),
          isHook: importPath.includes("hooks") || importPath.includes("use"),
          isComponent:
            importPath.includes("Components") ||
            importPath.includes("components"),
          isLib: importPath.includes("lib"),
          isUI: importPath.includes("ui"),
        });
      }

      // Extract hook usage
      const hookUsageRegex = /const\s+(?:{[^}]*}|\w+)\s*=\s*(use\w+)/g;
      while ((match = hookUsageRegex.exec(content)) !== null) {
        dependencies.push({
          path: match[1],
          category: "hook-usage",
          isLocal: true,
          isHook: true,
        });
      }

      // Extract component usage in JSX
      const componentUsageRegex = /<(\w+)(?:\s|>)/g;
      const components = [];
      while ((match = componentUsageRegex.exec(content)) !== null) {
        const componentName = match[1];
        if (
          componentName[0] === componentName[0].toUpperCase() &&
          ![
            "div",
            "span",
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "button",
            "a",
            "img",
            "input",
            "form",
          ].includes(componentName.toLowerCase())
        ) {
          components.push(componentName);
        }
      }

      return {
        imports: dependencies,
        components: [...new Set(components)],
      };
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return { imports: [], components: [] };
    }
  }

  /**
   * Categorize import based on path
   */
  categorizeImport(importPath) {
    if (importPath.startsWith("next/")) return "next-framework";
    if (importPath.startsWith("react")) return "react";
    if (importPath.includes("hooks")) return "custom-hook";
    if (importPath.includes("Components") || importPath.includes("components"))
      return "component";
    if (importPath.includes("lib")) return "utility";
    if (importPath.includes("ui")) return "ui-component";
    if (importPath.startsWith("@/")) return "internal";
    if (importPath.startsWith(".")) return "relative";
    return "external-package";
  }

  /**
   * Scan route patterns and analyze their dependencies
   */
  scanRoutePatterns() {
    console.log("🔍 Analyzing route patterns and dependencies...\n");

    const patterns = [
      // Dynamic patterns
      {
        pattern: "[slug]/[id]",
        sections: ["E-Books", "Ashaar", "Ghazlen", "Nazmen", "Rubai"],
      },
      { pattern: "[name]", sections: ["Shaer"] },
      {
        pattern: "shaer/[name]",
        sections: ["Ashaar", "Ghazlen", "Nazmen", "Rubai"],
      },
      { pattern: "mozu/[unwan]", sections: ["Ashaar", "Ghazlen"] },
      {
        pattern: "[id]",
        sections: ["bazmehindi", "bazmeurdu", "Blogs", "Interview"],
      },
      { pattern: "[[...params]]", sections: ["sign-in", "sign-up"] },

      // Static patterns
      {
        pattern: "static",
        sections: [
          "Favorites",
          "Founders",
          "privacypolicy",
          "terms&conditions",
          "cancellation&refund",
          "shipping&delivery",
        ],
      },
    ];

    for (const patternInfo of patterns) {
      for (const section of patternInfo.sections) {
        this.analyzeRoutePattern(section, patternInfo.pattern);
      }
    }
  }

  /**
   * Analyze a specific route pattern
   */
  analyzeRoutePattern(section, pattern) {
    let routePath;

    if (pattern === "static") {
      routePath = path.join(this.appDir, section, "page.tsx");
    } else if (pattern === "[slug]/[id]") {
      routePath = path.join(this.appDir, section, "[slug]", "[id]", "page.tsx");
    } else if (pattern === "[name]") {
      routePath = path.join(this.appDir, section, "[name]", "page.tsx");
    } else if (pattern === "shaer/[name]") {
      routePath = path.join(
        this.appDir,
        section,
        "shaer",
        "[name]",
        "page.tsx"
      );
    } else if (pattern === "mozu/[unwan]") {
      routePath = path.join(
        this.appDir,
        section,
        "mozu",
        "[unwan]",
        "page.tsx"
      );
    } else if (pattern === "[id]") {
      routePath = path.join(this.appDir, section, "[id]", "page.tsx");
    } else if (pattern === "[[...params]]") {
      routePath = path.join(this.appDir, section, "[[...sign-in]]", "page.tsx");
      if (!fs.existsSync(routePath)) {
        routePath = path.join(
          this.appDir,
          section,
          "[[...sign-up]]",
          "page.tsx"
        );
      }
    }

    if (!routePath || !fs.existsSync(routePath)) {
      return;
    }

    const analysis = this.analyzeFileDependencies(routePath);
    const routeKey = `${section}/${pattern}`;

    this.routePatterns.set(routeKey, {
      section,
      pattern,
      filePath: routePath,
      dependencies: analysis.imports,
      components: analysis.components,
      complexity: this.calculateComplexity(analysis),
    });

    // Track component usage
    for (const component of analysis.components) {
      if (!this.componentUsage.has(component)) {
        this.componentUsage.set(component, []);
      }
      this.componentUsage.get(component).push(routeKey);
    }
  }

  /**
   * Calculate complexity score for a route
   */
  calculateComplexity(analysis) {
    let score = 0;

    // Base complexity
    score += analysis.imports.length * 0.5;
    score += analysis.components.length * 1;

    // Additional complexity for specific types
    const hooks = analysis.imports.filter((imp) => imp.isHook).length;
    const localComponents = analysis.imports.filter(
      (imp) => imp.isComponent && imp.isLocal
    ).length;
    const externalPackages = analysis.imports.filter(
      (imp) => imp.category === "external-package"
    ).length;

    score += hooks * 2; // Hooks add complexity
    score += localComponents * 1.5; // Local components add moderate complexity
    score += externalPackages * 0.5; // External packages add some complexity

    return Math.round(score);
  }

  /**
   * Generate dependency report
   */
  generateDependencyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRoutePatterns: this.routePatterns.size,
        totalUniqueComponents: this.componentUsage.size,
        averageComplexity: this.calculateAverageComplexity(),
      },
      routePatterns: this.convertMapToObject(this.routePatterns),
      componentUsage: this.convertMapToObject(this.componentUsage),
      dependencyCategories: this.categorizeDependencies(),
      implementationGuide: this.generateImplementationGuide(),
    };

    return report;
  }

  /**
   * Calculate average complexity across all routes
   */
  calculateAverageComplexity() {
    const complexities = Array.from(this.routePatterns.values()).map(
      (route) => route.complexity
    );
    return complexities.length > 0
      ? Math.round(
          complexities.reduce((a, b) => a + b, 0) / complexities.length
        )
      : 0;
  }

  /**
   * Categorize all dependencies
   */
  categorizeDependencies() {
    const categories = {};

    for (const route of this.routePatterns.values()) {
      for (const dep of route.dependencies) {
        if (!categories[dep.category]) {
          categories[dep.category] = new Set();
        }
        categories[dep.category].add(dep.path);
      }
    }

    // Convert Sets to Arrays for JSON serialization
    for (const category in categories) {
      categories[category] = Array.from(categories[category]);
    }

    return categories;
  }

  /**
   * Generate implementation guide based on analysis
   */
  generateImplementationGuide() {
    const guide = {
      criticalDependencies: this.identifyCriticalDependencies(),
      reusableComponents: this.identifyReusableComponents(),
      complexityAnalysis: this.analyzeComplexityByPattern(),
      implementationOrder: this.suggestImplementationOrder(),
    };

    return guide;
  }

  /**
   * Identify critical dependencies that appear across multiple routes
   */
  identifyCriticalDependencies() {
    const dependencyCount = new Map();

    for (const route of this.routePatterns.values()) {
      for (const dep of route.dependencies) {
        if (dep.isLocal) {
          const key = dep.path;
          dependencyCount.set(key, (dependencyCount.get(key) || 0) + 1);
        }
      }
    }

    return Array.from(dependencyCount.entries())
      .filter(([_, count]) => count >= 3) // Used in 3+ routes
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, usageCount: count }));
  }

  /**
   * Identify components that can be reused across language directories
   */
  identifyReusableComponents() {
    return Array.from(this.componentUsage.entries())
      .filter(([_, routes]) => routes.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 15)
      .map(([component, routes]) => ({
        component,
        routes,
        usageCount: routes.length,
      }));
  }

  /**
   * Analyze complexity by pattern type
   */
  analyzeComplexityByPattern() {
    const patternComplexity = {};

    for (const route of this.routePatterns.values()) {
      if (!patternComplexity[route.pattern]) {
        patternComplexity[route.pattern] = [];
      }
      patternComplexity[route.pattern].push(route.complexity);
    }

    for (const pattern in patternComplexity) {
      const complexities = patternComplexity[pattern];
      patternComplexity[pattern] = {
        average: Math.round(
          complexities.reduce((a, b) => a + b, 0) / complexities.length
        ),
        min: Math.min(...complexities),
        max: Math.max(...complexities),
        count: complexities.length,
      };
    }

    return patternComplexity;
  }

  /**
   * Suggest implementation order based on complexity and dependencies
   */
  suggestImplementationOrder() {
    const routes = Array.from(this.routePatterns.values());

    // Sort by complexity (ascending) and dependency count
    routes.sort((a, b) => {
      const complexityDiff = a.complexity - b.complexity;
      if (complexityDiff !== 0) return complexityDiff;
      return a.dependencies.length - b.dependencies.length;
    });

    return routes.map((route) => ({
      route: `${route.section}/${route.pattern}`,
      complexity: route.complexity,
      dependencyCount: route.dependencies.length,
      priority: this.calculatePriority(route),
    }));
  }

  /**
   * Calculate implementation priority
   */
  calculatePriority(route) {
    const highPrioritySections = [
      "E-Books",
      "Ashaar",
      "Ghazlen",
      "Nazmen",
      "Rubai",
      "Favorites",
      "sign-in",
      "sign-up",
    ];
    const mediumPrioritySections = [
      "Founders",
      "Interview",
      "privacypolicy",
      "terms&conditions",
    ];

    if (highPrioritySections.includes(route.section)) return "high";
    if (mediumPrioritySections.includes(route.section)) return "medium";
    return "low";
  }

  /**
   * Convert Map to plain object for JSON serialization
   */
  convertMapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Print formatted report
   */
  printReport() {
    const report = this.generateDependencyReport();

    console.log("📊 COMPONENT DEPENDENCY ANALYSIS REPORT");
    console.log("======================================\n");

    // Summary
    console.log("📈 SUMMARY");
    console.log(
      `• Total route patterns analyzed: ${report.summary.totalRoutePatterns}`
    );
    console.log(
      `• Unique components identified: ${report.summary.totalUniqueComponents}`
    );
    console.log(
      `• Average complexity score: ${report.summary.averageComplexity}\n`
    );

    // Critical Dependencies
    console.log("🔧 CRITICAL DEPENDENCIES (Used in 3+ routes)");
    console.log("--------------------------------------------");
    for (const dep of report.implementationGuide.criticalDependencies) {
      console.log(`• ${dep.path} (used in ${dep.usageCount} routes)`);
    }
    console.log();

    // Reusable Components
    console.log("♻️  REUSABLE COMPONENTS");
    console.log("----------------------");
    for (const comp of report.implementationGuide.reusableComponents.slice(
      0,
      10
    )) {
      console.log(`• ${comp.component} (used in ${comp.usageCount} routes)`);
    }
    console.log();

    // Complexity by Pattern
    console.log("📊 COMPLEXITY BY PATTERN");
    console.log("------------------------");
    for (const [pattern, stats] of Object.entries(
      report.implementationGuide.complexityAnalysis
    )) {
      console.log(
        `• ${pattern}: avg=${stats.average}, range=${stats.min}-${stats.max} (${stats.count} routes)`
      );
    }
    console.log();

    // Implementation Order
    console.log("🎯 SUGGESTED IMPLEMENTATION ORDER");
    console.log("---------------------------------");
    const priorityGroups = {
      high: report.implementationGuide.implementationOrder.filter(
        (r) => r.priority === "high"
      ),
      medium: report.implementationGuide.implementationOrder.filter(
        (r) => r.priority === "medium"
      ),
      low: report.implementationGuide.implementationOrder.filter(
        (r) => r.priority === "low"
      ),
    };

    for (const [priority, routes] of Object.entries(priorityGroups)) {
      if (routes.length > 0) {
        console.log(`\n${priority.toUpperCase()} PRIORITY:`);
        for (const route of routes.slice(0, 8)) {
          console.log(
            `  ${route.route} (complexity: ${route.complexity}, deps: ${route.dependencyCount})`
          );
        }
      }
    }

    return report;
  }

  /**
   * Save report to file
   */
  saveReport(filename = "component-dependency-report.json") {
    const report = this.generateDependencyReport();
    const reportPath = path.join(process.cwd(), filename);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return reportPath;
  }
}

// Main execution
if (require.main === module) {
  const mapper = new ComponentDependencyMapper();

  try {
    mapper.scanRoutePatterns();
    const report = mapper.printReport();

    // Save detailed report
    mapper.saveReport();

    console.log("\n✅ Component dependency analysis complete.");
    console.log(
      "💡 Use this analysis to prioritize route implementation and identify reusable components."
    );
  } catch (error) {
    console.error("❌ Error during dependency analysis:", error.message);
    process.exit(1);
  }
}

module.exports = ComponentDependencyMapper;
