'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
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
      <DialogContent className="max-w-80 mx-auto">
        <DialogTitle />
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-80 h-80 rounded-lg overflow-hidden">
            <img
              src="/assets/welcome.jpg"
              alt="Welcome"
              className="object-fill w-full h-full"
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