#!/usr/bin/env node

/**
 * Route Completeness Validator CLI (JavaScript version)
 *
 * JavaScript wrapper for the TypeScript validator to ensure compatibility
 */

const fs = require("fs");
const path = require("path");

/**
 * JavaScript implementation of the Route Completeness Validator
 * This is a simplified version that works without TypeScript compilation
 */
class RouteCompletenessValidator {
  constructor(appDir) {
    this.appDir = appDir || path.join(process.cwd(), "app");
    this.defaultRoutes = new Map();
    this.enRoutes = new Map();
    this.hiRoutes = new Map();
    this.validationErrors = [];
    this.recommendations = [];
  }

  /**
   * Main validation method
   */
  async validateRouteCompleteness() {
    console.log("🔍 Starting route completeness validation...\n");

    try {
      this.resetValidationState();
      await this.scanRouteStructures();
      const missingRoutes = this.identifyMissingRoutes();
      this.validateRouteStructure();
      this.generateRecommendations(missingRoutes);
      const summary = this.calculateCompletenessSummary(missingRoutes);

      const result = {
        isValid:
          this.validationErrors.filter((e) => e.severity === "critical")
            .length === 0,
        timestamp: new Date().toISOString(),
        summary,
        missingRoutes,
        validationErrors: this.validationErrors,
        recommendations: this.recommendations,
      };

      console.log("✅ Route completeness validation completed\n");
      return result;
    } catch (error) {
      console.error("❌ Validation failed:", error);
      throw new Error(`Route validation failed: ${error.message}`);
    }
  }

  resetValidationState() {
    this.defaultRoutes.clear();
    this.enRoutes.clear();
    this.hiRoutes.clear();
    this.validationErrors = [];
    this.recommendations = [];
  }

  async scanRouteStructures() {
    this.scanDefaultRoutes();

    const enDir = path.join(this.appDir, "EN");
    const hiDir = path.join(this.appDir, "HI");

    if (fs.existsSync(enDir)) {
      this.scanDirectory(enDir, this.enRoutes);
    } else {
      this.addValidationError(
        "critical",
        "EN directory does not exist",
        undefined,
        "EN"
      );
    }

    if (fs.existsSync(hiDir)) {
      this.scanDirectory(hiDir, this.hiRoutes);
    } else {
      this.addValidationError(
        "critical",
        "HI directory does not exist",
        undefined,
        "HI"
      );
    }
  }

  scanDefaultRoutes() {
    if (!fs.existsSync(this.appDir)) {
      throw new Error(`App directory does not exist: ${this.appDir}`);
    }

    const items = fs.readdirSync(this.appDir, { withFileTypes: true });

    for (const item of items) {
      if (["EN", "HI", "api", "Components", "types"].includes(item.name)) {
        continue;
      }

      if (item.isDirectory()) {
        const itemPath = path.join(this.appDir, item.name);
        this.defaultRoutes.set(item.name, {
          type: "directory",
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: this.hasPageFile(itemPath),
          children: new Map(),
        });

        this.scanDirectory(
          itemPath,
          this.defaultRoutes.get(item.name).children,
          item.name
        );
      }
    }

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

  scanDirectory(dirPath, routeMap, prefix = "") {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const routePath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.isDirectory()) {
        if (["api", "Components", "types"].includes(item.name)) {
          continue;
        }

        routeMap.set(item.name, {
          type: "directory",
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: this.hasPageFile(itemPath),
          children: new Map(),
        });

        this.scanDirectory(
          itemPath,
          routeMap.get(item.name).children,
          routePath
        );
      }
    }
  }

  isDynamicRoute(routeName) {
    return routeName.startsWith("[") && routeName.endsWith("]");
  }

  hasPageFile(dirPath) {
    const pageFile = path.join(dirPath, "page.tsx");
    return fs.existsSync(pageFile);
  }

  getDynamicPattern(routeName) {
    if (routeName.includes("[slug]")) return "slug";
    if (routeName.includes("[id]")) return "id";
    if (routeName.includes("[name]")) return "name";
    if (routeName.includes("[unwan]")) return "unwan";
    if (routeName.includes("[...")) return "catch-all";
    if (routeName.startsWith("[") && routeName.endsWith("]"))
      return "single-param";
    return "static";
  }

  identifyMissingRoutes() {
    const missingRoutes = {
      EN: [],
      HI: [],
    };

    this.findMissingInLanguage(
      this.defaultRoutes,
      this.enRoutes,
      "EN",
      missingRoutes.EN
    );
    this.findMissingInLanguage(
      this.defaultRoutes,
      this.hiRoutes,
      "HI",
      missingRoutes.HI
    );

    return missingRoutes;
  }

  findMissingInLanguage(
    defaultRoutes,
    langRoutes,
    language,
    missingList,
    prefix = ""
  ) {
    for (const [routeName, routeInfo] of defaultRoutes) {
      const fullRoutePath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeName === "/") continue;

      if (!langRoutes.has(routeName)) {
        const missingRoute = {
          route: fullRoutePath,
          type: routeInfo.type,
          isDynamic: routeInfo.isDynamic,
          hasPageFile: routeInfo.hasPageFile,
          pattern: routeInfo.isDynamic
            ? this.getDynamicPattern(routeName)
            : "static",
          priority: this.getRoutePriority(routeName, routeInfo),
          section: this.getRouteSection(fullRoutePath),
        };

        missingList.push(missingRoute);

        this.addValidationError(
          missingRoute.priority === "high" ? "critical" : "warning",
          `Missing route: ${fullRoutePath}`,
          fullRoutePath,
          language
        );
      } else {
        const langRouteInfo = langRoutes.get(routeName);
        if (
          routeInfo.children &&
          routeInfo.children.size > 0 &&
          langRouteInfo
        ) {
          this.findMissingInLanguage(
            routeInfo.children,
            langRouteInfo.children || new Map(),
            language,
            missingList,
            fullRoutePath
          );
        }
      }
    }
  }

  getRoutePriority(routeName, routeInfo) {
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
    if (routeInfo.isDynamic) return "high";

    return "low";
  }

  getRouteSection(routePath) {
    const parts = routePath.split("/");
    return parts[0] || "root";
  }

  validateRouteStructure() {
    this.validateOrphanedDirectories(this.enRoutes, "EN");
    this.validateOrphanedDirectories(this.hiRoutes, "HI");
    this.validateDynamicRouteConsistency();
    this.validateEssentialFiles();
  }

  validateOrphanedDirectories(routes, language, prefix = "") {
    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (
        routeInfo.type === "directory" &&
        !routeInfo.isDynamic &&
        !routeInfo.hasPageFile
      ) {
        this.addValidationError(
          "warning",
          `Directory without page.tsx: ${fullPath}`,
          fullPath,
          language
        );
      }

      if (routeInfo.children && routeInfo.children.size > 0) {
        this.validateOrphanedDirectories(
          routeInfo.children,
          language,
          fullPath
        );
      }
    }
  }

  validateDynamicRouteConsistency() {
    const enDynamicRoutes = this.extractDynamicRoutes(this.enRoutes);
    const hiDynamicRoutes = this.extractDynamicRoutes(this.hiRoutes);
    const defaultDynamicRoutes = this.extractDynamicRoutes(this.defaultRoutes);

    for (const defaultRoute of defaultDynamicRoutes) {
      const enHasRoute = enDynamicRoutes.some(
        (r) =>
          r.pattern === defaultRoute.pattern &&
          r.section === defaultRoute.section
      );
      const hiHasRoute = hiDynamicRoutes.some(
        (r) =>
          r.pattern === defaultRoute.pattern &&
          r.section === defaultRoute.section
      );

      if (!enHasRoute) {
        this.addValidationError(
          "critical",
          `Missing dynamic route pattern ${defaultRoute.pattern} in section ${defaultRoute.section}`,
          defaultRoute.route,
          "EN"
        );
      }

      if (!hiHasRoute) {
        this.addValidationError(
          "critical",
          `Missing dynamic route pattern ${defaultRoute.pattern} in section ${defaultRoute.section}`,
          defaultRoute.route,
          "HI"
        );
      }
    }
  }

  extractDynamicRoutes(routes, prefix = "") {
    const dynamicRoutes = [];

    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeInfo.isDynamic) {
        dynamicRoutes.push({
          route: fullPath,
          pattern: this.getDynamicPattern(routeName),
          section: this.getRouteSection(fullPath),
        });
      }

      if (routeInfo.children && routeInfo.children.size > 0) {
        dynamicRoutes.push(
          ...this.extractDynamicRoutes(routeInfo.children, fullPath)
        );
      }
    }

    return dynamicRoutes;
  }

  validateEssentialFiles() {
    this.checkEssentialFilesInLanguage("EN", this.enRoutes);
    this.checkEssentialFilesInLanguage("HI", this.hiRoutes);
  }

  checkEssentialFilesInLanguage(language, routes, prefix = "") {
    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeInfo.isDynamic && routeInfo.hasPageFile) {
        const routeDir = path.join(this.appDir, language, fullPath);

        const loadingFile = path.join(routeDir, "loading.tsx");
        if (!fs.existsSync(loadingFile)) {
          this.addValidationError(
            "info",
            `Missing loading.tsx for dynamic route: ${fullPath}`,
            fullPath,
            language
          );
        }

        const errorFile = path.join(routeDir, "error.tsx");
        if (!fs.existsSync(errorFile)) {
          this.addValidationError(
            "info",
            `Missing error.tsx for dynamic route: ${fullPath}`,
            fullPath,
            language
          );
        }
      }

      if (routeInfo.children && routeInfo.children.size > 0) {
        this.checkEssentialFilesInLanguage(
          language,
          routeInfo.children,
          fullPath
        );
      }
    }
  }

  calculateCompletenessSummary(missingRoutes) {
    const totalDefaultRoutes = this.countTotalRoutes(this.defaultRoutes);
    const totalENRoutes = this.countTotalRoutes(this.enRoutes);
    const totalHIRoutes = this.countTotalRoutes(this.hiRoutes);

    const completenessPercentageEN =
      totalDefaultRoutes > 0
        ? Math.round(
            ((totalDefaultRoutes - missingRoutes.EN.length) /
              totalDefaultRoutes) *
              100
          )
        : 0;

    const completenessPercentageHI =
      totalDefaultRoutes > 0
        ? Math.round(
            ((totalDefaultRoutes - missingRoutes.HI.length) /
              totalDefaultRoutes) *
              100
          )
        : 0;

    return {
      totalMissingEN: missingRoutes.EN.length,
      totalMissingHI: missingRoutes.HI.length,
      highPriorityEN: missingRoutes.EN.filter((r) => r.priority === "high")
        .length,
      highPriorityHI: missingRoutes.HI.filter((r) => r.priority === "high")
        .length,
      completenessPercentageEN,
      completenessPercentageHI,
    };
  }

  countTotalRoutes(routes) {
    let count = 0;

    for (const [, routeInfo] of routes) {
      if (routeInfo.type === "directory" || routeInfo.hasPageFile) {
        count++;
      }

      if (routeInfo.children && routeInfo.children.size > 0) {
        count += this.countTotalRoutes(routeInfo.children);
      }
    }

    return count;
  }

  generateRecommendations(missingRoutes) {
    const highPriorityEN = missingRoutes.EN.filter(
      (r) => r.priority === "high"
    );
    const highPriorityHI = missingRoutes.HI.filter(
      (r) => r.priority === "high"
    );

    if (highPriorityEN.length > 0) {
      this.recommendations.push({
        type: "implementation",
        priority: "high",
        message: `Implement ${highPriorityEN.length} high-priority missing routes in EN directory`,
        routes: highPriorityEN.map((r) => r.route),
        action: "Create missing route files and components",
      });
    }

    if (highPriorityHI.length > 0) {
      this.recommendations.push({
        type: "implementation",
        priority: "high",
        message: `Implement ${highPriorityHI.length} high-priority missing routes in HI directory`,
        routes: highPriorityHI.map((r) => r.route),
        action: "Create missing route files and components",
      });
    }

    const criticalErrors = this.validationErrors.filter(
      (e) => e.severity === "critical"
    );
    if (criticalErrors.length > 0) {
      this.recommendations.push({
        type: "implementation",
        priority: "high",
        message: "Fix critical route structure issues",
        action: "Address missing dynamic routes and structural inconsistencies",
      });
    }

    const missingEssentialFiles = this.validationErrors.filter(
      (e) =>
        e.message.includes("loading.tsx") || e.message.includes("error.tsx")
    );

    if (missingEssentialFiles.length > 0) {
      this.recommendations.push({
        type: "optimization",
        priority: "medium",
        message: "Add missing loading and error components for better UX",
        action: "Create loading.tsx and error.tsx files for dynamic routes",
      });
    }

    if (missingRoutes.EN.length > 0 || missingRoutes.HI.length > 0) {
      this.recommendations.push({
        type: "maintenance",
        priority: "medium",
        message: "Set up automated route validation in CI/CD pipeline",
        action: "Integrate route completeness validation into build process",
      });
    }
  }

  addValidationError(severity, message, route, language) {
    this.validationErrors.push({
      type: route ? "missing_route" : "invalid_structure",
      severity,
      message,
      route,
      language,
    });
  }

  printValidationReport(result) {
    console.log("📊 ROUTE COMPLETENESS VALIDATION REPORT");
    console.log("======================================\n");

    console.log("📈 SUMMARY");
    console.log(
      `• EN Directory Completeness: ${result.summary.completenessPercentageEN}%`
    );
    console.log(
      `• HI Directory Completeness: ${result.summary.completenessPercentageHI}%`
    );
    console.log(`• Missing routes in EN: ${result.summary.totalMissingEN}`);
    console.log(`• Missing routes in HI: ${result.summary.totalMissingHI}`);
    console.log(
      `• High priority missing in EN: ${result.summary.highPriorityEN}`
    );
    console.log(
      `• High priority missing in HI: ${result.summary.highPriorityHI}\n`
    );

    const statusIcon = result.isValid ? "✅" : "❌";
    const statusText = result.isValid ? "PASSED" : "FAILED";
    console.log(`${statusIcon} VALIDATION STATUS: ${statusText}\n`);

    if (result.validationErrors.length > 0) {
      console.log("🚨 VALIDATION ERRORS");
      console.log("-------------------");

      const errorsBySeverity = {
        critical: result.validationErrors.filter(
          (e) => e.severity === "critical"
        ),
        warning: result.validationErrors.filter(
          (e) => e.severity === "warning"
        ),
        info: result.validationErrors.filter((e) => e.severity === "info"),
      };

      for (const [severity, errors] of Object.entries(errorsBySeverity)) {
        if (errors.length > 0) {
          const icon =
            severity === "critical"
              ? "🔴"
              : severity === "warning"
              ? "🟡"
              : "🔵";
          console.log(
            `\n${icon} ${severity.toUpperCase()} (${errors.length}):`
          );

          errors.slice(0, 10).forEach((error) => {
            const langPrefix = error.language ? `[${error.language}] ` : "";
            console.log(`  • ${langPrefix}${error.message}`);
          });

          if (errors.length > 10) {
            console.log(`  ... and ${errors.length - 10} more`);
          }
        }
      }
      console.log();
    }

    if (result.recommendations.length > 0) {
      console.log("💡 RECOMMENDATIONS");
      console.log("------------------");

      result.recommendations.forEach((rec) => {
        const priorityIcon =
          rec.priority === "high"
            ? "🔴"
            : rec.priority === "medium"
            ? "🟡"
            : "🟢";
        console.log(
          `${priorityIcon} [${rec.type.toUpperCase()}] ${rec.message}`
        );
        console.log(`   Action: ${rec.action}`);
        if (rec.routes && rec.routes.length > 0) {
          console.log(
            `   Routes: ${rec.routes.slice(0, 3).join(", ")}${
              rec.routes.length > 3 ? "..." : ""
            }`
          );
        }
        console.log();
      });
    }
  }

  saveValidationReport(result, filename = "route-validation-report.json") {
    const reportPath = path.join(process.cwd(), filename);
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`📄 Validation report saved to: ${reportPath}`);
    return reportPath;
  }

  async quickValidation() {
    const result = await this.validateRouteCompleteness();
    return result.isValid;
  }

  async getMissingRoutesForLanguage(language) {
    const result = await this.validateRouteCompleteness();
    return result.missingRoutes[language];
  }

  validateSpecificRoute(routePath) {
    const enExists = this.routeExistsInLanguage(routePath, "EN");
    const hiExists = this.routeExistsInLanguage(routePath, "HI");

    return { EN: enExists, HI: hiExists };
  }

  routeExistsInLanguage(routePath, language) {
    const fullPath = path.join(this.appDir, language, routePath, "page.tsx");
    return fs.existsSync(fullPath);
  }
}

module.exports = { RouteCompletenessValidator };
