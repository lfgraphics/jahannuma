'use client';

import { useTour } from '@/contexts/TourContext';
import { useCallback, useState } from 'react';
import AlertDialog from './alert-dialog';
import WelcomeDialog from './welcome-dialog';

export default function DialogManager() {
  const [welcomeDone, setWelcomeDone] = useState(false);
  const { onDialogsClosed } = useTour();

  const handleWelcomeClose = useCallback(() => {
    setWelcomeDone(true);
  }, []);

  const handleAlertClose = useCallback(() => {
    onDialogsClosed();
  }, [onDialogsClosed]);

  return (
    <>
      <WelcomeDialog onClose={handleWelcomeClose} />
      {welcomeDone && <AlertDialog onClose={handleAlertClose} />}
    </>
  );
}
