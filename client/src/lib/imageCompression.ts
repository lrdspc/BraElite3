import { isOnline } from './pwa';

/**
 * Connection quality levels
 */
export enum ConnectionQuality {
  OFFLINE = 'offline',
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast'
}

/**
 * Compression settings for different connection qualities
 */
interface CompressionSettings {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const compressionSettings: Record<ConnectionQuality, CompressionSettings> = {
  [ConnectionQuality.OFFLINE]: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.6
  },
  [ConnectionQuality.SLOW]: {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.7
  },
  [ConnectionQuality.MEDIUM]: {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 0.8
  },
  [ConnectionQuality.FAST]: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.9
  }
};

/**
 * Detects the current connection quality
 * @returns Promise that resolves to a ConnectionQuality
 */
export async function detectConnectionQuality(): Promise<ConnectionQuality> {
  // Check if online
  if (!isOnline()) {
    return ConnectionQuality.OFFLINE;
  }
  
  // Use Network Information API if available
  if ('connection' in navigator && navigator.connection) {
    const connection = navigator.connection as any;
    
    // Check effectiveType (4g, 3g, 2g, slow-2g)
    if (connection.effectiveType) {
      switch (connection.effectiveType) {
        case '4g':
          return ConnectionQuality.FAST;
        case '3g':
          return ConnectionQuality.MEDIUM;
        case '2g':
        case 'slow-2g':
          return ConnectionQuality.SLOW;
        default:
          return ConnectionQuality.MEDIUM;
      }
    }
    
    // Check downlink (Mbps)
    if (connection.downlink !== undefined) {
      if (connection.downlink > 5) {
        return ConnectionQuality.FAST;
      } else if (connection.downlink > 1) {
        return ConnectionQuality.MEDIUM;
      } else {
        return ConnectionQuality.SLOW;
      }
    }
  }
  
  // Fallback: measure response time to a small request
  try {
    const startTime = Date.now();
    await fetch('/api/ping', { method: 'HEAD' });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime < 100) {
      return ConnectionQuality.FAST;
    } else if (responseTime < 300) {
      return ConnectionQuality.MEDIUM;
    } else {
      return ConnectionQuality.SLOW;
    }
  } catch (error) {
    console.error('Error measuring connection speed:', error);
    return ConnectionQuality.MEDIUM; // Default to medium if measurement fails
  }
}

/**
 * Compresses an image based on the current connection quality
 * @param file Image file to compress
 * @param connectionQuality Optional connection quality (if already detected)
 * @returns Promise that resolves to a compressed File object
 */
export async function compressImage(
  file: File,
  connectionQuality?: ConnectionQuality
): Promise<File> {
  // Skip compression for non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  // Detect connection quality if not provided
  const quality = connectionQuality || await detectConnectionQuality();
  const settings = compressionSettings[quality];
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > settings.maxWidth) {
          height = (height * settings.maxWidth) / width;
          width = settings.maxWidth;
        }
        
        if (height > settings.maxHeight) {
          width = (width * settings.maxHeight) / height;
          height = settings.maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with appropriate quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Create new file with same name but compressed
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: 'image/jpeg',
                lastModified: Date.now()
              }
            );
            
            console.log(`Compressed image: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`);
            
            resolve(compressedFile);
          },
          'image/jpeg',
          settings.quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a thumbnail from an image file
 * @param file Image file
 * @param maxWidth Maximum width of the thumbnail
 * @param maxHeight Maximum height of the thumbnail
 * @returns Promise that resolves to a data URL for the thumbnail
 */
export async function createThumbnail(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}