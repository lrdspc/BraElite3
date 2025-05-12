import React, { useEffect } from 'react';
import { setAppBadge, clearAppBadge } from '@/lib/pwa';

interface NotificationBadgeProps {
  count: number;
  children?: React.ReactNode;
}

/**
 * NotificationBadge component that uses the Badging API to set a badge on the app icon
 * Also displays a visual badge in the UI
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, children }) => {
  // Update the app badge when count changes
  useEffect(() => {
    if (count > 0) {
      setAppBadge(count);
    } else {
      clearAppBadge();
    }
  }, [count]);

  // If count is 0, don't show the badge
  if (count === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-flex">
      {children}
      <div className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brasilit-red rounded-full">
        {count > 99 ? '99+' : count}
      </div>
    </div>
  );
};

export default NotificationBadge;