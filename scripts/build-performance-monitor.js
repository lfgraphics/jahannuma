/**
 * Build Performance Monitor
 * Monitors build time duration and logs performance metrics
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class BuildPerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.phases = new Map();
    this.currentPhase = null;
    this.errors = [];
  }

  startPhase(phaseName) {
    if (this.currentPhase) {
      this.endPhase();
    }
    
    this.currentPhase = {
      name: phaseName,
      startTime: performance.now(),
      errors: []
    };
    
    console.log(`🚀 Starting build phase: ${phaseName}`);
  }

  endPhase() {
    if (!this.currentPhase) return;

    const duration = performance.now() - this.currentPhase.startTime;
    const success = this.currentPhase.errors.length === 0;
    
    this.phases.set(this.currentPhase.name, {
      duration,
      success,
      errors: [...this.currentPhase.errors],
      timestamp: Date.now()
    });

    const status = success ? '✅' : '❌';
    const durationStr = `${Math.round(duration)}ms`;
    
    console.log(`${status} Completed build phase: ${this.currentPhase.name} (${durationStr})`);
    
    if (!success) {
      console.error(`   Errors in ${this.currentPhase.name}:`, this.currentPhase.errors);
    }

    // Check for performance thresholds
    if (duration > 120000) { // 2 minutes
      console.warn(`⚠️  Build phase '${this.currentPhase.name}' took ${durationStr} - this is critically slow`);
    } else if (duration > 30000) { // 30 seconds
      console.warn(`⚠️  Build phase '${this.currentPhase.name}' took ${durationStr} - this is slow`);
    }

    this.currentPhase = null;
  }

  addError(error) {
    if (this.currentPhase) {
      this.currentPhase.errors.push(error);
    }
    this.errors.push(error);
  }

  finish() {
    if (this.currentPhase) {
      this.endPhase();
    }

    const totalDuration = performance.now() - this.startTime;
    const success = this.errors.length === 0;
    
    const report = {
      totalDuration,
      success,
      totalErrors: this.errors.length,
      phases: Object.fromEntries(this.phases),
      timestamp: Date.now()
    };

    // Log summary
    const status = success ? '✅' : '❌';
    const durationStr = `${Math.round(totalDuration)}ms`;
    
    console.log(`\n${status} Build completed in ${durationStr}`);
    
    if (!success) {
      console.error(`   Total errors: ${this.errors.length}`);
    }

    // Performance analysis
    if (totalDuration > 120000) {
      console.warn(`⚠️  Total build time ${durationStr} is critically slow`);
    } else if (totalDuration > 30000) {
      console.warn(`⚠️  Total build time ${durationStr} is slow`);
    } else {
      console.log(`🎉 Build completed in good time: ${durationStr}`);
    }

    // Save performance report
    this.saveReport(report);
    
    return report;
  }

  saveReport(report) {
    try {
      const reportsDir = path.join(process.cwd(), '.next', 'build-reports');
      
      // Create reports directory if it doesn't exist
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const reportFile = path.join(reportsDir, `build-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      
      console.log(`📊 Build performance report saved to: ${reportFile}`);

      // Keep only the last 10 reports
      const files = fs.readdirSync(reportsDir)
        .filter(f => f.startsWith('build-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(reportsDir, f),
          time: fs.statSync(path.join(reportsDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 10) {
        files.slice(10).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }

    } catch (error) {
      console.error('Failed to save build performance report:', error);
    }
  }

  // Static method to wrap Next.js build
  static wrapNextBuild() {
    const monitor = new BuildPerformanceMonitor();
    
    // Hook into process events
    process.on('exit', () => {
      monitor.finish();
    });

    process.on('uncaughtException', (error) => {
      monitor.addError(error.message);
      monitor.finish();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      monitor.addError(reason.toString());
      monitor.finish();
      process.exit(1);
    });

    return monitor;
  }
}

// Export for use in build scripts
module.exports = { BuildPerformanceMonitor };

// If run directly, start monitoring
if (require.main === module) {
  const monitor = BuildPerformanceMonitor.wrapNextBuild();
  
  monitor.startPhase('initialization');
  
  // Example usage - in a real build, these would be called at appropriate times
  setTimeout(() => {
    monitor.startPhase('compilation');
    setTimeout(() => {
      monitor.startPhase('optimization');
      setTimeout(() => {
        monitor.startPhase('finalization');
        setTimeout(() => {
          monitor.finish();
        }, 1000);
      }, 2000);
    }, 3000);
  }, 1000);
}