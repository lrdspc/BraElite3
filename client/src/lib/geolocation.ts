import { Geolocation } from '@shared/schema';

/**
 * Gets the current geolocation of the device
 * @returns Promise that resolves to a Geolocation object
 */
export async function getCurrentLocation(): Promise<Geolocation | null> {
  // Check if geolocation is supported by the browser
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser');
    return null;
  }

  try {
    // Get current position with high accuracy
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    return {
      latitude: position.coords.latitude.toString(),
      longitude: position.coords.longitude.toString()
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Formats a geolocation object into a human-readable string
 * @param location Geolocation object
 * @returns Formatted string (e.g. "12.3456°N, 65.4321°W")
 */
export function formatLocation(location: Geolocation | null): string {
  if (!location || !location.latitude || !location.longitude) {
    return 'Localização não disponível';
  }

  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);

  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Attempts to get an address from coordinates using reverse geocoding
 * @param location Geolocation object
 * @returns Promise that resolves to an address string
 */
export async function getAddressFromCoordinates(location: Geolocation): Promise<string | null> {
  if (!location || !location.latitude || !location.longitude) {
    return null;
  }

  try {
    // Use a geocoding service (this example uses Nominatim, but you might want to use Google Maps or another service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': 'BrasilitPWA/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return null;
  }
}