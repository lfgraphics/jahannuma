'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertItem {
  id: string;
  url?: string;
  image: string;
  showTill: string; // ISO date string
  title?: string;
}

const ALERT_DIALOG_KEY = 'alert-dialog-last-shown';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function AlertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Check if alerts were shown in the last 24 hours
      const lastShown = localStorage.getItem(ALERT_DIALOG_KEY);
      const now = Date.now();

      if (lastShown) {
        const lastShownTime = parseInt(lastShown, 10);
        const timeSinceLastShown = now - lastShownTime;

        if (timeSinceLastShown < TWENTY_FOUR_HOURS) {
          console.log('Alerts were shown recently, skipping for 24 hours');
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        const activeAlerts = filterActiveAlerts(data.alerts || []);

        if (activeAlerts.length > 0) {
          setAlerts(activeAlerts);
          setIsOpen(true);
          // Mark as shown now
          localStorage.setItem(ALERT_DIALOG_KEY, now.toString());
        }
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActiveAlerts = (alerts: AlertItem[]): AlertItem[] => {
    const now = new Date();
    return alerts.filter(alert => {
      // Check if alert has valid image and showTill date
      if (!alert.image || alert.image.trim() === '') {
        console.warn('Alert missing image:', alert);
        return false;
      }
      if (!alert.showTill) {
        console.warn('Alert missing showTill date:', alert);
        return false;
      }

      const showTillDate = new Date(alert.showTill);
      return showTillDate > now;
    });
  };

  const handleItemClick = (alert: AlertItem) => {
    if (alert.url) {
      window.open(alert.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto">
        <div className="relative">
          {alerts.length === 1 ? (
            <AlertItem alert={alerts[0]} onClick={() => handleItemClick(alerts[0])} />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {alerts.map((alert) => (
                  <CarouselItem key={alert.id}>
                    <AlertItem alert={alert} onClick={() => handleItemClick(alert)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AlertItemProps {
  alert: AlertItem;
  onClick: () => void;
}

function AlertItem({ alert, onClick }: AlertItemProps) {
  // Validate image source
  const hasValidImage = alert.image && alert.image.trim() !== '';

  if (!hasValidImage) {
    return (
      <div className="relative">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>No image available</p>
            {alert.title && <p className="font-medium mt-2">{alert.title}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${alert.url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
        <img
          src={alert.image}
          alt={alert.title || 'Alert'}
          className="object-cover"
          onError={(e) => {
            console.error('Image failed to load:', alert.image);
            // Hide the image element on error
            e.currentTarget.style.display = 'none';
          }}
        />
        {alert.url && (
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
            <ExternalLink className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}