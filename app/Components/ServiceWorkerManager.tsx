'use client'

import { useEffect } from 'react'

export default function ServiceWorkerManager() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope)

          // Check for updates every 30 seconds when page is visible
          const checkForUpdates = () => {
            if (document.visibilityState === 'visible') {
              registration.update()
            }
          }

          // Check for updates on visibility change
          document.addEventListener('visibilitychange', checkForUpdates)

          // Check for updates periodically
          const updateInterval = setInterval(() => {
            registration.update()
          }, 30000) // 30 seconds

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Show update notification
                  const updateBanner = document.createElement('div')
                  updateBanner.innerHTML = `
                    <div style="
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      background: #F0D586;
                      color: #000;
                      padding: 12px;
                      text-align: center;
                      z-index: 9999;
                      font-size: 14px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">
                      <span>New content available! </span>
                      <button onclick="window.location.reload()" style="
                        background: #000;
                        color: #F0D586;
                        border: none;
                        padding: 4px 12px;
                        border-radius: 4px;
                        margin-left: 8px;
                        cursor: pointer;
                      ">Refresh</button>
                      <button onclick="this.parentElement.parentElement.remove()" style="
                        background: transparent;
                        border: none;
                        margin-left: 8px;
                        cursor: pointer;
                        font-size: 16px;
                      ">×</button>
                    </div>
                  `
                  document.body.appendChild(updateBanner)
                }
              })
            }
          })

          return () => {
            document.removeEventListener('visibilitychange', checkForUpdates)
            clearInterval(updateInterval)
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}