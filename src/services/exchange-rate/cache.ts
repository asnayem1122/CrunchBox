import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedRatesData {
  rates: Record<string, number>;
  effectiveDate: string;
  fetchedAt: number;
}

const CACHE_KEY = '@crunchbox_exchange_rates_cache';

let memoryCache: CachedRatesData | null = null;

export async function getCachedRates(): Promise<CachedRatesData | null> {
  if (typeof window === 'undefined') {
    return memoryCache;
  }
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return memoryCache;
    const data = JSON.parse(raw) as CachedRatesData;
    if (data && typeof data.rates === 'object') {
      memoryCache = data;
      return data;
    }
    return memoryCache;
  } catch {
    return memoryCache;
  }
}

export async function saveCachedRates(data: CachedRatesData): Promise<void> {
  memoryCache = data;
  if (typeof window === 'undefined') {
    return;
  }
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Graceful fallback if storage write fails
  }
}
