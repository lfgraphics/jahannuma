'use client'; // This directive is essential for client-side functionality

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success('Account Details Copied to Clipboard Successfully');
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to Copy Account Details to Clipboard');
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Button onClick={handleCopy}>{isCopied ? 'Details Copied!' : 'Copy Details'}</Button>
  );
}

export default CopyButton;