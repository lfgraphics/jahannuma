/**
 * Route Completeness Validator
 * 
 * Utility to verify route parity across languages and detect missing routes
 * automatically. This validator ensures that EN and HI directories have
 * complete route structures matching the default app structure.
 */

import fs from 'fs';
import path from 'path';

export interface RouteInfo {
  type: 'directory' | 'page';
  path: string;
  isDynamic: boolean;
  hasPageFile: boolean;
  children: Map<string, RouteInfo>;
}

export interface MissingRoute {
  route: string;
  type: 'directory' | 'page';
  isDynamic: boolean;
  hasPageFile: boolean;
  pattern: string;
  priority: 'high' | 'medium' | 'low';
  section: string;
}

export interface ValidationResult {
  isValid: boolean;
  timestamp: string;
  summary: {
    totalMissingEN: number;
    totalMissingHI: number;
    highPriorityEN: number;
    highPriorityHI: number;
    completenessPercentageEN: number;
    completenessPercentageHI: number;
  };
  missingRoutes: {
    EN: MissingRoute[];
    HI: MissingRoute[];
  };
  validationErrors: ValidationError[];
  recommendations: ValidationRecommendation[];
}

export interface ValidationError {
  type: 'missing_route' | 'invalid_structure' | 'broken_link';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  route?: string;
  language?: 'EN' | 'HI';
}

export interface ValidationRecommendation {
  type: 'implementation' | 'optimization' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  routes?: string[];
  action: string;
}

export class RouteCompletenessValidator {
  private appDir: string;
  private defaultRoutes: Map<string, RouteInfo>;
  private enRoutes: Map<string, RouteInfo>;
  private hiRoutes: Map<string, RouteInfo>;
  private validationErrors: ValidationError[];
  private recommendations: ValidationRecommendation[];

  constructor(appDir?: string) {
    this.appDir = appDir || path.join(process.cwd(), 'app');
    this.defaultRoutes = new Map();
    this.enRoutes = new Map();
    this.hiRoutes = new Map();
    this.validationErrors = [];
    this.recommendations = [];
  }

  /**
   * Main validation method - performs complete route parity check
   */
  async validateRouteCompleteness(): Promise<ValidationResult> {
    console.log('🔍 Starting route completeness validation...\n');

    try {
      // Reset state
      this.resetValidationState();

      // Scan all route structures
      await this.scanRouteStructures();

      // Perform validation checks
      const missingRoutes = this.identifyMissingRoutes();
      this.validateRouteStructure();
      this.generateRecommendations(missingRoutes);

      // Calculate completeness metrics
      const summary = this.calculateCompletenessSummary(missingRoutes);

      const result: ValidationResult = {
        isValid: this.validationErrors.filter(e => e.severity === 'critical').length === 0,
        timestamp: new Date().toISOString(),
        summary,
        missingRoutes,
        validationErrors: this.validationErrors,
        recommendations: this.recommendations
      };

      console.log('✅ Route completeness validation completed\n');
      return result;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw new Error(`Route validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset validation state for fresh run
   */
  private resetValidationState(): void {
    this.defaultRoutes.clear();
    this.enRoutes.clear();
    this.hiRoutes.clear();
    this.validationErrors = [];
    this.recommendations = [];
  }

  /**
   * Scan all route structures (default, EN, HI)
   */
  private async scanRouteStructures(): Promise<void> {
    // Scan default app structure
    this.scanDefaultRoutes();

    // Scan language directories
    const enDir = path.join(this.appDir, 'EN');
    const hiDir = path.join(this.appDir, 'HI');

    if (fs.existsSync(enDir)) {
      this.scanDirectory(enDir, this.enRoutes);
    } else {
      this.addValidationError('critical', 'EN directory does not exist', undefined, 'EN');
    }

    if (fs.existsSync(hiDir)) {
      this.scanDirectory(hiDir, this.hiRoutes);
    } else {
      this.addValidationError('critical', 'HI directory does not exist', undefined, 'HI');
    }
  }

  /**
   * Scan default app structure (excluding language directories)
   */
  private scanDefaultRoutes(): void {
    if (!fs.existsSync(this.appDir)) {
      throw new Error(`App directory does not exist: ${this.appDir}`);
    }

    const items = fs.readdirSync(this.appDir, { withFileTypes: true });

    for (const item of items) {
      // Skip language directories and system directories
      if (['EN', 'HI', 'api', 'Components', 'types'].includes(item.name)) {
        continue;
      }

      if (item.isDirectory()) {
        const itemPath = path.join(this.appDir, item.name);
        this.defaultRoutes.set(item.name, {
          type: 'directory',
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: this.hasPageFile(itemPath),
          children: new Map()
        });

        this.scanDirectory(itemPath, this.defaultRoutes.get(item.name)!.children, item.name);
      }
    }

    // Check for root page
    const rootPagePath = path.join(this.appDir, 'page.tsx');
    if (fs.existsSync(rootPagePath)) {
      this.defaultRoutes.set('/', {
        type: 'page',
        path: rootPagePath,
        isDynamic: false,
        hasPageFile: true,
        children: new Map()
      });
    }
  }

  /**
   * Recursively scan directory structure
   */
  private scanDirectory(dirPath: string, routeMap: Map<string, RouteInfo>, prefix = ''): void {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const routePath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.isDirectory()) {
        // Skip certain directories
        if (['api', 'Components', 'types'].includes(item.name)) {
          continue;
        }

        routeMap.set(item.name, {
          type: 'directory',
          path: itemPath,
          isDynamic: this.isDynamicRoute(item.name),
          hasPageFile: this.hasPageFile(itemPath),
          children: new Map()
        });

        this.scanDirectory(itemPath, routeMap.get(item.name)!.children, routePath);
      }
    }
  }

  /**
   * Check if route name indicates dynamic routing
   */
  private isDynamicRoute(routeName: string): boolean {
    return routeName.startsWith('[') && routeName.endsWith(']');
  }

  /**
   * Check if directory has a page.tsx file
   */
  private hasPageFile(dirPath: string): boolean {
    const pageFile = path.join(dirPath, 'page.tsx');
    return fs.existsSync(pageFile);
  }

  /**
   * Get dynamic route pattern type
   */
  private getDynamicPattern(routeName: string): string {
    if (routeName.includes('[slug]')) return 'slug';
    if (routeName.includes('[id]')) return 'id';
    if (routeName.includes('[name]')) return 'name';
    if (routeName.includes('[unwan]')) return 'unwan';
    if (routeName.includes('[...')) return 'catch-all';
    if (routeName.startsWith('[') && routeName.endsWith(']')) return 'single-param';
    return 'static';
  }

  /**
   * Identify missing routes in language directories
   */
  private identifyMissingRoutes(): { EN: MissingRoute[]; HI: MissingRoute[] } {
    const missingRoutes = {
      EN: [] as MissingRoute[],
      HI: [] as MissingRoute[]
    };

    // Check missing routes in EN
    this.findMissingInLanguage(this.defaultRoutes, this.enRoutes, 'EN', missingRoutes.EN);

    // Check missing routes in HI
    this.findMissingInLanguage(this.defaultRoutes, this.hiRoutes, 'HI', missingRoutes.HI);

    return missingRoutes;
  }

  /**
   * Find missing routes in a specific language directory
   */
  private findMissingInLanguage(
    defaultRoutes: Map<string, RouteInfo>,
    langRoutes: Map<string, RouteInfo>,
    language: 'EN' | 'HI',
    missingList: MissingRoute[],
    prefix = ''
  ): void {
    for (const [routeName, routeInfo] of defaultRoutes) {
      const fullRoutePath = prefix ? `${prefix}/${routeName}` : routeName;

      // Skip root page for language directories
      if (routeName === '/') continue;

      if (!langRoutes.has(routeName)) {
        const missingRoute: MissingRoute = {
          route: fullRoutePath,
          type: routeInfo.type,
          isDynamic: routeInfo.isDynamic,
          hasPageFile: routeInfo.hasPageFile,
          pattern: routeInfo.isDynamic ? this.getDynamicPattern(routeName) : 'static',
          priority: this.getRoutePriority(routeName, routeInfo),
          section: this.getRouteSection(fullRoutePath)
        };

        missingList.push(missingRoute);

        // Add validation error
        this.addValidationError(
          missingRoute.priority === 'high' ? 'critical' : 'warning',
          `Missing route: ${fullRoutePath}`,
          fullRoutePath,
          language
        );
      } else {
        // Check nested routes
        const langRouteInfo = langRoutes.get(routeName);
        if (routeInfo.children && routeInfo.children.size > 0 && langRouteInfo) {
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

  /**
   * Determine route priority based on importance
   */
  private getRoutePriority(routeName: string, routeInfo: RouteInfo): 'high' | 'medium' | 'low' {
    // High priority routes
    const highPriorityRoutes = [
      'E-Books', 'Ashaar', 'Ghazlen', 'Nazmen', 'Rubai', 'Shaer',
      'Favorites', 'sign-in', 'sign-up'
    ];

    // Medium priority routes
    const mediumPriorityRoutes = [
      'Founders', 'Interview', 'privacypolicy', 'terms&conditions',
      'cancellation&refund', 'shipping&delivery'
    ];

    if (highPriorityRoutes.includes(routeName)) return 'high';
    if (mediumPriorityRoutes.includes(routeName)) return 'medium';
    if (routeInfo.isDynamic) return 'high'; // Dynamic routes are generally high priority

    return 'low';
  }

  /**
   * Get the main section for a route
   */
  private getRouteSection(routePath: string): string {
    const parts = routePath.split('/');
    return parts[0] || 'root';
  }

  /**
   * Validate route structure integrity
   */
  private validateRouteStructure(): void {
    // Check for orphaned directories (directories without page.tsx)
    this.validateOrphanedDirectories(this.enRoutes, 'EN');
    this.validateOrphanedDirectories(this.hiRoutes, 'HI');

    // Check for inconsistent dynamic route patterns
    this.validateDynamicRouteConsistency();

    // Check for missing essential files (loading.tsx, error.tsx for dynamic routes)
    this.validateEssentialFiles();
  }

  /**
   * Check for directories without page.tsx files
   */
  private validateOrphanedDirectories(routes: Map<string, RouteInfo>, language: 'EN' | 'HI', prefix = ''): void {
    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeInfo.type === 'directory' && !routeInfo.isDynamic && !routeInfo.hasPageFile) {
        this.addValidationError(
          'warning',
          `Directory without page.tsx: ${fullPath}`,
          fullPath,
          language
        );
      }

      // Recursively check children
      if (routeInfo.children && routeInfo.children.size > 0) {
        this.validateOrphanedDirectories(routeInfo.children, language, fullPath);
      }
    }
  }

  /**
   * Validate dynamic route pattern consistency
   */
  private validateDynamicRouteConsistency(): void {
    const enDynamicRoutes = this.extractDynamicRoutes(this.enRoutes);
    const hiDynamicRoutes = this.extractDynamicRoutes(this.hiRoutes);
    const defaultDynamicRoutes = this.extractDynamicRoutes(this.defaultRoutes);

    // Check if EN and HI have consistent dynamic patterns with default
    for (const defaultRoute of defaultDynamicRoutes) {
      const enHasRoute = enDynamicRoutes.some(r => r.pattern === defaultRoute.pattern && r.section === defaultRoute.section);
      const hiHasRoute = hiDynamicRoutes.some(r => r.pattern === defaultRoute.pattern && r.section === defaultRoute.section);

      if (!enHasRoute) {
        this.addValidationError(
          'critical',
          `Missing dynamic route pattern ${defaultRoute.pattern} in section ${defaultRoute.section}`,
          defaultRoute.route,
          'EN'
        );
      }

      if (!hiHasRoute) {
        this.addValidationError(
          'critical',
          `Missing dynamic route pattern ${defaultRoute.pattern} in section ${defaultRoute.section}`,
          defaultRoute.route,
          'HI'
        );
      }
    }
  }

  /**
   * Extract dynamic routes from route map
   */
  private extractDynamicRoutes(routes: Map<string, RouteInfo>, prefix = ''): Array<{ route: string, pattern: string, section: string }> {
    const dynamicRoutes: Array<{ route: string, pattern: string, section: string }> = [];

    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeInfo.isDynamic) {
        dynamicRoutes.push({
          route: fullPath,
          pattern: this.getDynamicPattern(routeName),
          section: this.getRouteSection(fullPath)
        });
      }

      // Recursively check children
      if (routeInfo.children && routeInfo.children.size > 0) {
        dynamicRoutes.push(...this.extractDynamicRoutes(routeInfo.children, fullPath));
      }
    }

    return dynamicRoutes;
  }

  /**
   * Validate essential files for dynamic routes
   */
  private validateEssentialFiles(): void {
    // Check EN directory
    this.checkEssentialFilesInLanguage('EN', this.enRoutes);

    // Check HI directory
    this.checkEssentialFilesInLanguage('HI', this.hiRoutes);
  }

  /**
   * Check essential files in a specific language directory
   */
  private checkEssentialFilesInLanguage(language: 'EN' | 'HI', routes: Map<string, RouteInfo>, prefix = ''): void {
    for (const [routeName, routeInfo] of routes) {
      const fullPath = prefix ? `${prefix}/${routeName}` : routeName;

      if (routeInfo.isDynamic && routeInfo.hasPageFile) {
        const routeDir = path.join(this.appDir, language, fullPath);

        // Check for loading.tsx
        const loadingFile = path.join(routeDir, 'loading.tsx');
        if (!fs.existsSync(loadingFile)) {
          this.addValidationError(
            'info',
            `Missing loading.tsx for dynamic route: ${fullPath}`,
            fullPath,
            language
          );
        }

        // Check for error.tsx
        const errorFile = path.join(routeDir, 'error.tsx');
        if (!fs.existsSync(errorFile)) {
          this.addValidationError(
            'info',
            `Missing error.tsx for dynamic route: ${fullPath}`,
            fullPath,
            language
          );
        }
      }

      // Recursively check children
      if (routeInfo.children && routeInfo.children.size > 0) {
        this.checkEssentialFilesInLanguage(language, routeInfo.children, fullPath);
      }
    }
  }

  /**
   * Calculate completeness summary metrics
   */
  private calculateCompletenessSummary(missingRoutes: { EN: MissingRoute[]; HI: MissingRoute[] }): ValidationResult['summary'] {
    const totalDefaultRoutes = this.countTotalRoutes(this.defaultRoutes);
    const totalENRoutes = this.countTotalRoutes(this.enRoutes);
    const totalHIRoutes = this.countTotalRoutes(this.hiRoutes);

    const completenessPercentageEN = totalDefaultRoutes > 0
      ? Math.round(((totalDefaultRoutes - missingRoutes.EN.length) / totalDefaultRoutes) * 100)
      : 0;

    const completenessPercentageHI = totalDefaultRoutes > 0
      ? Math.round(((totalDefaultRoutes - missingRoutes.HI.length) / totalDefaultRoutes) * 100)
      : 0;

    return {
      totalMissingEN: missingRoutes.EN.length,
      totalMissingHI: missingRoutes.HI.length,
      highPriorityEN: missingRoutes.EN.filter(r => r.priority === 'high').length,
      highPriorityHI: missingRoutes.HI.filter(r => r.priority === 'high').length,
      completenessPercentageEN,
      completenessPercentageHI
    };
  }

  /**
   * Count total routes in a route map
   */
  private countTotalRoutes(routes: Map<string, RouteInfo>): number {
    let count = 0;

    for (const [, routeInfo] of routes) {
      if (routeInfo.type === 'directory' || routeInfo.hasPageFile) {
        count++;
      }

      if (routeInfo.children && routeInfo.children.size > 0) {
        count += this.countTotalRoutes(routeInfo.children);
      }
    }

    return count;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(missingRoutes: { EN: MissingRoute[]; HI: MissingRoute[] }): void {
    // High priority missing routes
    const highPriorityEN = missingRoutes.EN.filter(r => r.priority === 'high');
    const highPriorityHI = missingRoutes.HI.filter(r => r.priority === 'high');

    if (highPriorityEN.length > 0) {
      this.recommendations.push({
        type: 'implementation',
        priority: 'high',
        message: `Implement ${highPriorityEN.length} high-priority missing routes in EN directory`,
        routes: highPriorityEN.map(r => r.route),
        action: 'Create missing route files and components'
      });
    }

    if (highPriorityHI.length > 0) {
      this.recommendations.push({
        type: 'implementation',
        priority: 'high',
        message: `Implement ${highPriorityHI.length} high-priority missing routes in HI directory`,
        routes: highPriorityHI.map(r => r.route),
        action: 'Create missing route files and components'
      });
    }

    // Dynamic route consistency
    const criticalErrors = this.validationErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      this.recommendations.push({
        type: 'implementation',
        priority: 'high',
        message: 'Fix critical route structure issues',
        action: 'Address missing dynamic routes and structural inconsistencies'
      });
    }

    // Performance optimization
    const missingEssentialFiles = this.validationErrors.filter(e =>
      e.message.includes('loading.tsx') || e.message.includes('error.tsx')
    );

    if (missingEssentialFiles.length > 0) {
      this.recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: 'Add missing loading and error components for better UX',
        action: 'Create loading.tsx and error.tsx files for dynamic routes'
      });
    }

    // Maintenance recommendations
    if (missingRoutes.EN.length > 0 || missingRoutes.HI.length > 0) {
      this.recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        message: 'Set up automated route validation in CI/CD pipeline',
        action: 'Integrate route completeness validation into build process'
      });
    }
  }

  /**
   * Add validation error to the list
   */
  private addValidationError(
    severity: ValidationError['severity'],
    message: string,
    route?: string,
    language?: 'EN' | 'HI'
  ): void {
    this.validationErrors.push({
      type: route ? 'missing_route' : 'invalid_structure',
      severity,
      message,
      route,
      language
    });
  }

  /**
   * Print formatted validation report
   */
  printValidationReport(result: ValidationResult): void {
    console.log('📊 ROUTE COMPLETENESS VALIDATION REPORT');
    console.log('======================================\n');

    // Summary
    console.log('📈 SUMMARY');
    console.log(`• EN Directory Completeness: ${result.summary.completenessPercentageEN}%`);
    console.log(`• HI Directory Completeness: ${result.summary.completenessPercentageHI}%`);
    console.log(`• Missing routes in EN: ${result.summary.totalMissingEN}`);
    console.log(`• Missing routes in HI: ${result.summary.totalMissingHI}`);
    console.log(`• High priority missing in EN: ${result.summary.highPriorityEN}`);
    console.log(`• High priority missing in HI: ${result.summary.highPriorityHI}\n`);

    // Validation Status
    const statusIcon = result.isValid ? '✅' : '❌';
    const statusText = result.isValid ? 'PASSED' : 'FAILED';
    console.log(`${statusIcon} VALIDATION STATUS: ${statusText}\n`);

    // Errors by severity
    if (result.validationErrors.length > 0) {
      console.log('🚨 VALIDATION ERRORS');
      console.log('-------------------');

      const errorsBySeverity = {
        critical: result.validationErrors.filter(e => e.severity === 'critical'),
        warning: result.validationErrors.filter(e => e.severity === 'warning'),
        info: result.validationErrors.filter(e => e.severity === 'info')
      };

      for (const [severity, errors] of Object.entries(errorsBySeverity)) {
        if (errors.length > 0) {
          const icon = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
          console.log(`\n${icon} ${severity.toUpperCase()} (${errors.length}):`);

          errors.slice(0, 10).forEach(error => {
            const langPrefix = error.language ? `[${error.language}] ` : '';
            console.log(`  • ${langPrefix}${error.message}`);
          });

          if (errors.length > 10) {
            console.log(`  ... and ${errors.length - 10} more`);
          }
        }
      }
      console.log();
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('------------------');

      result.recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${priorityIcon} [${rec.type.toUpperCase()}] ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
        if (rec.routes && rec.routes.length > 0) {
          console.log(`   Routes: ${rec.routes.slice(0, 3).join(', ')}${rec.routes.length > 3 ? '...' : ''}`);
        }
        console.log();
      });
    }
  }

  /**
   * Save validation report to file
   */
  saveValidationReport(result: ValidationResult, filename = 'route-validation-report.json'): string {
    const reportPath = path.join(process.cwd(), filename);
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`📄 Validation report saved to: ${reportPath}`);
    return reportPath;
  }

  /**
   * Quick validation check - returns boolean result
   */
  async quickValidation(): Promise<boolean> {
    const result = await this.validateRouteCompleteness();
    return result.isValid;
  }

  /**
   * Get missing routes for a specific language
   */
  async getMissingRoutesForLanguage(language: 'EN' | 'HI'): Promise<MissingRoute[]> {
    const result = await this.validateRouteCompleteness();
    return result.missingRoutes[language];
  }

  /**
   * Validate specific route exists in both languages
   */
  validateSpecificRoute(routePath: string): { EN: boolean; HI: boolean } {
    const enExists = this.routeExistsInLanguage(routePath, 'EN');
    const hiExists = this.routeExistsInLanguage(routePath, 'HI');

    return { EN: enExists, HI: hiExists };
  }

  /**
   * Check if a specific route exists in a language directory
   */
  private routeExistsInLanguage(routePath: string, language: 'EN' | 'HI'): boolean {
    const fullPath = path.join(this.appDir, language, routePath, 'page.tsx');
    return fs.existsSync(fullPath);
  }
}

export default RouteCompletenessValidator;