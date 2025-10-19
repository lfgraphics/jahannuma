'use client';

import AlertDialog from './alert-dialog';
import WelcomeDialog from './welcome-dialog';

export default function DialogManager() {
  return (
    <>
      <WelcomeDialog />
      <AlertDialog />
    </>
  );
}