import { WeatherData, WeatherCondition } from '@shared/schema';
import { Geolocation } from '@shared/schema';

/**
 * Fetches current weather data based on geolocation
 * @param location Geolocation object
 * @returns Promise that resolves to a WeatherData object
 */
export async function getWeatherData(location: Geolocation): Promise<WeatherData | null> {
  if (!location || !location.latitude || !location.longitude) {
    return null;
  }

  try {
    // This is a placeholder for a real weather API call
    // In a production app, you would use a service like OpenWeatherMap, WeatherAPI, etc.
    // Example using OpenWeatherMap (you would need an API key):
    // const apiKey = 'your-api-key';
    // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;
    
    // For demo purposes, we'll simulate a weather API response
    // In a real implementation, replace this with an actual API call
    const mockWeatherResponse = await simulateWeatherApiCall(location);
    
    return {
      weatherCondition: mapToWeatherCondition(mockWeatherResponse.condition),
      temperature: mockWeatherResponse.temperature,
      humidity: mockWeatherResponse.humidity,
      windSpeed: mockWeatherResponse.windSpeed
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

/**
 * Maps an API weather condition to our internal WeatherCondition enum
 * @param apiCondition Weather condition from API
 * @returns Mapped WeatherCondition
 */
function mapToWeatherCondition(apiCondition: string): WeatherCondition | undefined {
  const conditionMap: Record<string, WeatherCondition> = {
    'clear': 'sunny',
    'clouds': 'cloudy',
    'few clouds': 'partly_cloudy',
    'scattered clouds': 'partly_cloudy',
    'broken clouds': 'cloudy',
    'shower rain': 'rainy',
    'rain': 'rainy',
    'thunderstorm': 'stormy',
    'snow': 'snowy',
    'mist': 'foggy'
  };
  
  return conditionMap[apiCondition.toLowerCase()] || undefined;
}

/**
 * Simulates a weather API call (for demo purposes)
 * In a real app, replace this with an actual API call
 */
async function simulateWeatherApiCall(location: Geolocation): Promise<{
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate realistic weather data based on location
  // This is just for demonstration - in a real app, use actual API data
  const conditions = ['clear', 'clouds', 'few clouds', 'scattered clouds', 'rain', 'thunderstorm'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    condition: randomCondition,
    temperature: 15 + Math.random() * 20, // Random temp between 15-35°C
    humidity: 30 + Math.random() * 60, // Random humidity between 30-90%
    windSpeed: Math.random() * 15 // Random wind speed between 0-15 km/h
  };
}

/**
 * Gets a weather icon based on the weather condition
 * @param condition WeatherCondition
 * @returns Icon name (can be used with Lucide icons)
 */
export function getWeatherIcon(condition?: WeatherCondition): string {
  if (!condition) return 'cloud';
  
  const iconMap: Record<WeatherCondition, string> = {
    'sunny': 'sun',
    'cloudy': 'cloud',
    'partly_cloudy': 'cloud-sun',
    'rainy': 'cloud-rain',
    'stormy': 'cloud-lightning',
    'windy': 'wind',
    'foggy': 'cloud-fog',
    'snowy': 'cloud-snow'
  };
  
  return iconMap[condition] || 'cloud';
}

/**
 * Formats weather data into a human-readable string
 * @param data WeatherData object
 * @returns Formatted string (e.g. "Sunny, 25°C, 60% humidity, 10 km/h wind")
 */
export function formatWeatherData(data: WeatherData | null): string {
  if (!data) {
    return 'Dados climáticos não disponíveis';
  }
  
  const parts = [];
  
  if (data.weatherCondition) {
    const conditionLabels: Record<WeatherCondition, string> = {
      'sunny': 'Ensolarado',
      'cloudy': 'Nublado',
      'partly_cloudy': 'Parcialmente nublado',
      'rainy': 'Chuvoso',
      'stormy': 'Tempestuoso',
      'windy': 'Ventoso',
      'foggy': 'Neblina',
      'snowy': 'Neve'
    };
    parts.push(conditionLabels[data.weatherCondition]);
  }
  
  if (data.temperature !== undefined) {
    parts.push(`${data.temperature.toFixed(1)}°C`);
  }
  
  if (data.humidity !== undefined) {
    parts.push(`${data.humidity.toFixed(0)}% umidade`);
  }
  
  if (data.windSpeed !== undefined) {
    parts.push(`${data.windSpeed.toFixed(1)} km/h vento`);
  }
  
  return parts.join(', ') || 'Dados climáticos não disponíveis';
}