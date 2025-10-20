'use client'

import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    // Check if user dismissed recently (within 1 hour)
    const checkDismissedRecently = () => {
      const dismissedAt = localStorage.getItem('pwa-install-dismissed-at')
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt)
        const oneHourInMs = 60 * 60 * 1000 // 1 hour in milliseconds
        const timeSinceDismissed = Date.now() - dismissedTime

        if (timeSinceDismissed < oneHourInMs) {
          return true // Still within 1 hour, don't show
        } else {
          // More than 1 hour has passed, remove the stored timestamp
          localStorage.removeItem('pwa-install-dismissed-at')
          return false
        }
      }
      return false
    }

    checkIfInstalled()

    // Don't proceed if dismissed recently
    if (checkDismissedRecently()) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Save the event so it can be triggered later
      setDeferredPrompt(e)
      // Show install banner if not already installed and not dismissed recently
      if (!isInstalled && !checkDismissedRecently()) {
        setShowInstallBanner(true)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm('New content is available! Click OK to refresh.')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    // Store the current timestamp when user clicks "Later"
    const dismissedAt = Date.now()
    localStorage.setItem('pwa-install-dismissed-at', dismissedAt.toString())
  }

  // Don't show if already installed or user previously dismissed
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Install JahanNuma
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Get quick access to poetry and poets with our app
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-[#F0D586] hover:bg-[#E8C875] text-gray-900"
          >
            <Download size={16} className="mr-1" />
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="px-3"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}