'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const WELCOME_DIALOG_KEY = 'welcome-dialog-shown';

export default function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if welcome dialog has been shown before
    const hasBeenShown = localStorage.getItem(WELCOME_DIALOG_KEY);

    if (!hasBeenShown) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as shown so it doesn't appear again
    localStorage.setItem(WELCOME_DIALOG_KEY, 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            خوش آمدید - Welcome
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src="/assets/welcome.jpg"
              alt="Welcome"
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error('Welcome image failed to load');
                // Hide the image and show a placeholder
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-text')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-text flex items-center justify-center h-full text-gray-500';
                  fallback.innerHTML = '<p>Welcome Image<br/>Please add welcome.jpg to /public/assets/</p>';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <p className="text-center text-muted-foreground">
            جہان نما میں آپ کا خیر مقدم
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}