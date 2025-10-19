'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
}

export default function PWAInstallButton({ 
  className = '', 
  variant = 'default',
  size = 'default' 
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
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

    checkIfInstalled()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User ${outcome} the install prompt`)
    setDeferredPrompt(null)
  }

  // Don't show if already installed or prompt not available
  if (isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant={variant}
      size={size}
      className={className}
    >
      <Download size={16} className="mr-2" />
      Install App
    </Button>
  )
}