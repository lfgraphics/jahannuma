"use client";

import { getPerformanceStats } from '@/lib/performance-monitoring';
import { useEffect, useState } from 'react';

interface PerformanceStats {
  dataFetching: any;
  buildTime: any;
  apiFailures: any;
}

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      const loadStats = () => {
        try {
          const performanceStats = getPerformanceStats();
          setStats(performanceStats);
        } catch (error) {
          console.error('Failed to load performance stats:', error);
        }
      };

      loadStats();
      const interval = setInterval(loadStats, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development' || !stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        📊 Performance
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Data Fetching Metrics */}
          {stats.dataFetching && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Data Fetching</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-mono">{stats.dataFetching.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span className="font-mono">{Math.round(stats.dataFetching.averageDuration)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate:</span>
                  <span className="font-mono">{(stats.dataFetching.cacheHitRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-mono">{(stats.dataFetching.successRate * 100).toFixed(1)}%</span>
                </div>
                {stats.dataFetching.slowRequests > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Slow Requests:</span>
                    <span className="font-mono">{stats.dataFetching.slowRequests}</span>
                  </div>
                )}
                {stats.dataFetching.criticalRequests > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Critical Requests:</span>
                    <span className="font-mono">{stats.dataFetching.criticalRequests}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Build Time Metrics */}
          {stats.buildTime && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Build Performance</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Builds:</span>
                  <span className="font-mono">{stats.buildTime.totalBuilds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span className="font-mono">{Math.round(stats.buildTime.averageDuration)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-mono">{(stats.buildTime.successRate * 100).toFixed(1)}%</span>
                </div>
                {stats.buildTime.slowBuilds > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Slow Builds:</span>
                    <span className="font-mono">{stats.buildTime.slowBuilds}</span>
                  </div>
                )}
                {stats.buildTime.criticalBuilds > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Critical Builds:</span>
                    <span className="font-mono">{stats.buildTime.criticalBuilds}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API Failures */}
          {stats.apiFailures && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">API Failures</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Failures:</span>
                  <span className="font-mono text-red-600">{stats.apiFailures.totalFailures}</span>
                </div>
                {stats.apiFailures.mostFailedEndpoint && (
                  <div className="flex justify-between">
                    <span>Most Failed:</span>
                    <span className="font-mono text-xs truncate max-w-32" title={stats.apiFailures.mostFailedEndpoint[0]}>
                      {stats.apiFailures.mostFailedEndpoint[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            Updates every 5 seconds • Dev only
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceDashboard;