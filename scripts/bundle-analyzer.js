/**
 * Bundle Size Analyzer and Optimizer
 * Analyzes bundle size, identifies unused dependencies, and optimizes imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
    this.unusedDeps = [];
    this.largeDeps = [];
    this.optimizationSuggestions = [];
  }

  loadPackageJson() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  }

  async analyzeDependencies() {
    console.log('🔍 Analyzing dependencies...');
    
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    // Check for unused dependencies
    for (const [dep, version] of Object.entries(dependencies)) {
      if (await this.isDependencyUnused(dep)) {
        this.unusedDeps.push({ name: dep, version });
      }
    }

    // Check for large dependencies
    await this.checkLargeDependencies();

    this.generateOptimizationSuggestions();
  }

  async isDependencyUnused(depName) {
    try {
      // Skip certain dependencies that might not be directly imported
      const skipCheck = [
        '@types/',
        'eslint',
        'prettier',
        'typescript',
        'next',
        '@next/',
        'postcss',
        'tailwindcss',
        'autoprefixer'
      ];

      if (skipCheck.some(skip => depName.includes(skip))) {
        return false;
      }

      // Search for imports in the codebase
      const searchPatterns = [
        `import.*from.*['"]${depName}['"]`,
        `import.*['"]${depName}['"]`,
        `require\\(['"]${depName}['"]\\)`,
        `from ['"]${depName}['"]`
      ];

      for (const pattern of searchPatterns) {
        try {
          execSync(`grep -r "${pattern}" app/ lib/ hooks/ components/ src/ 2>/dev/null`, { 
            stdio: 'pipe' 
          });
          return false; // Found usage
        } catch (error) {
          // Continue checking other patterns
        }
      }

      return true; // No usage found
    } catch (error) {
      return false; // Assume used if we can't check
    }
  }

  async checkLargeDependencies() {
    console.log('📦 Checking dependency sizes...');
    
    try {
      // Get node_modules sizes
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        return;
      }

      const dependencies = Object.keys(this.packageJson.dependencies || {});
      
      for (const dep of dependencies) {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          const size = this.getDirectorySize(depPath);
          if (size > 5 * 1024 * 1024) { // > 5MB
            this.largeDeps.push({
              name: dep,
              size: this.formatBytes(size),
              sizeBytes: size
            });
          }
        }
      }

      // Sort by size
      this.largeDeps.sort((a, b) => b.sizeBytes - a.sizeBytes);
    } catch (error) {
      console.warn('Could not analyze dependency sizes:', error.message);
    }
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateOptimizationSuggestions() {
    // Unused dependencies
    if (this.unusedDeps.length > 0) {
      this.optimizationSuggestions.push({
        type: 'unused-deps',
        title: 'Remove unused dependencies',
        description: `Found ${this.unusedDeps.length} potentially unused dependencies`,
        action: `pnpm remove ${this.unusedDeps.map(d => d.name).join(' ')}`,
        impact: 'Reduces bundle size and installation time',
        deps: this.unusedDeps
      });
    }

    // Large dependencies
    if (this.largeDeps.length > 0) {
      this.optimizationSuggestions.push({
        type: 'large-deps',
        title: 'Consider alternatives for large dependencies',
        description: `Found ${this.largeDeps.length} large dependencies`,
        impact: 'Could significantly reduce bundle size',
        deps: this.largeDeps.slice(0, 5) // Top 5
      });
    }

    // Dynamic imports suggestions
    this.optimizationSuggestions.push({
      type: 'dynamic-imports',
      title: 'Use dynamic imports for code splitting',
      description: 'Convert large components to dynamic imports',
      examples: [
        'const Component = dynamic(() => import("./Component"))',
        'const { heavyFunction } = await import("./utils")'
      ],
      impact: 'Reduces initial bundle size'
    });

    // Tree shaking suggestions
    this.optimizationSuggestions.push({
      type: 'tree-shaking',
      title: 'Optimize imports for better tree shaking',
      description: 'Use specific imports instead of default imports',
      examples: [
        'import { specific } from "library" // Good',
        'import * as library from "library" // Avoid'
      ],
      impact: 'Eliminates unused code from bundle'
    });
  }

  analyzeImports() {
    console.log('🌳 Analyzing import patterns...');
    
    const importIssues = [];
    const files = this.getAllSourceFiles();

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const issues = this.checkImportPatterns(content, file);
      importIssues.push(...issues);
    }

    if (importIssues.length > 0) {
      this.optimizationSuggestions.push({
        type: 'import-optimization',
        title: 'Optimize import statements',
        description: `Found ${importIssues.length} import optimization opportunities`,
        issues: importIssues.slice(0, 10), // Top 10
        impact: 'Improves tree shaking and reduces bundle size'
      });
    }
  }

  getAllSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const directories = ['app', 'lib', 'hooks', 'components', 'src'];

    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(dirPath, files, extensions);
      }
    }

    return files;
  }

  walkDirectory(dirPath, files, extensions) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          this.walkDirectory(itemPath, files, extensions);
        } else if (stats.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  checkImportPatterns(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Check for barrel imports that might hurt tree shaking
      if (line.includes('import * as') && !line.includes('React')) {
        issues.push({
          file: path.relative(this.projectRoot, filePath),
          line: lineNumber,
          issue: 'Namespace import may hurt tree shaking',
          suggestion: 'Use specific imports instead',
          code: line
        });
      }

      // Check for default imports from libraries that support named imports
      const defaultImportLibraries = ['lodash', 'date-fns', 'ramda'];
      for (const lib of defaultImportLibraries) {
        if (line.includes(`import`) && line.includes(`from '${lib}'`) && !line.includes('{')) {
          issues.push({
            file: path.relative(this.projectRoot, filePath),
            line: lineNumber,
            issue: `Default import from ${lib} includes entire library`,
            suggestion: `Use specific imports: import { method } from '${lib}'`,
            code: line
          });
        }
      }
    }

    return issues;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        unusedDependencies: this.unusedDeps.length,
        largeDependencies: this.largeDeps.length,
        optimizationSuggestions: this.optimizationSuggestions.length
      },
      unusedDependencies: this.unusedDeps,
      largeDependencies: this.largeDeps,
      optimizationSuggestions: this.optimizationSuggestions
    };

    // Save report
    const reportsDir = path.join(this.projectRoot, '.next', 'bundle-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `bundle-analysis-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return { report, reportFile };
  }

  printReport(report) {
    console.log('\n📊 Bundle Analysis Report');
    console.log('========================');

    if (this.unusedDeps.length > 0) {
      console.log(`\n❌ Unused Dependencies (${this.unusedDeps.length}):`);
      this.unusedDeps.forEach(dep => {
        console.log(`   • ${dep.name}@${dep.version}`);
      });
    }

    if (this.largeDeps.length > 0) {
      console.log(`\n📦 Large Dependencies (${this.largeDeps.length}):`);
      this.largeDeps.slice(0, 5).forEach(dep => {
        console.log(`   • ${dep.name}: ${dep.size}`);
      });
    }

    console.log(`\n💡 Optimization Suggestions (${this.optimizationSuggestions.length}):`);
    this.optimizationSuggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.title}`);
      console.log(`   ${suggestion.description}`);
      if (suggestion.action) {
        console.log(`   Action: ${suggestion.action}`);
      }
      console.log(`   Impact: ${suggestion.impact}`);
    });

    console.log('\n✅ Analysis complete!');
  }

  async run() {
    console.log('🚀 Starting bundle analysis...\n');
    
    await this.analyzeDependencies();
    this.analyzeImports();
    
    const { report, reportFile } = this.generateReport();
    this.printReport(report);
    
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = { BundleAnalyzer };