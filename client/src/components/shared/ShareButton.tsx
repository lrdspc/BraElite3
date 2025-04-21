import React from 'react';
import { shareContent, canShare } from '@/lib/pwa';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

/**
 * ShareButton component that uses the Web Share API to share content
 * Falls back to copying to clipboard if Web Share API is not available
 */
const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Brasilit Vistorias',
  text = 'Confira esta vistoria técnica da Brasilit',
  url = window.location.href,
  className = '',
  variant = 'outline',
  size = 'sm',
  children,
}) => {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  // Check if Web Share API is supported
  React.useEffect(() => {
    setIsSupported(canShare());
  }, []);

  const handleShare = async () => {
    if (isSupported) {
      await shareContent({ title, text, url });
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
      title={isSupported ? 'Compartilhar' : 'Copiar link'}
    >
      {children || (
        <>
          <Share className="h-4 w-4 mr-2" />
          {isSupported ? 'Compartilhar' : isCopied ? 'Copiado!' : 'Copiar link'}
        </>
      )}
    </Button>
  );
};

export default ShareButton;