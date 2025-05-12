/**
 * TypeScript declarations for PWA-related browser APIs
 */

// BeforeInstallPromptEvent for custom install prompt
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}

// Badging API
interface Navigator {
  setAppBadge?(count: number): Promise<void>;
  clearAppBadge?(): Promise<void>;
}

// Web Share API extensions
interface Navigator {
  canShare?(data?: { files?: File[] }): boolean;
}

// Periodic Background Sync API
interface ServiceWorkerRegistration {
  periodicSync?: {
    register(tag: string, options?: { minInterval: number }): Promise<void>;
    unregister(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  };
}

interface PermissionDescriptor {
  name: string;
}

// Windows Widgets API
interface Window {
  widgets?: {
    register(config: {
      widgetName: string;
      widgetUrl: string;
      widgetDisplayName: string;
      widgetDescription: string;
      widgetKeywords: string[];
      widgetCategory: string;
      widgetSizes: Array<{ width: number; height: number }>;
    }): void;
  };
}