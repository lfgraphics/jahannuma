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
      toast.success('खाता विवरण सफलतापूर्वक क्लिपबोर्ड में कॉपी किया गया');
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('खाता विवरण को क्लिपबोर्ड में कॉपी करने में विफल');
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Button onClick={handleCopy}>{isCopied ? 'विवरण कॉपी किया गया!' : 'विवरण कॉपी करें'}</Button>
  );
}

export default CopyButton;