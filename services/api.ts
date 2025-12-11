import { UserRole } from '../types';

/**
 * Generates a simple ID for the user.
 * We replace special chars to ensure compatibility with PeerJS server.
 */
export const generateUserId = (): string => {
  return 'EX' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

/**
 * Fetches the current Bitcoin price in USD from a public API.
 */
export const fetchBitcoinRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
    if (!response.ok) throw new Error('Failed to fetch BTC rate');
    const data = await response.json();
    return data.bpi.USD.rate_float;
  } catch (error) {
    console.error(error);
    throw new Error('Bitcoin API unavailable');
  }
};

/**
 * Fetches the current USD strength.
 */
export const fetchUSDRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch USD rate');
    const data = await response.json();
    return data.rates.EUR; 
  } catch (error) {
    console.error(error);
    throw new Error('Exchange API unavailable');
  }
};

/**
 * Display a local system notification.
 * This is now a pure UI utility called when P2P data arrives.
 */
export const displaySystemNotification = async (
  title: string,
  body: string
) => {
  if (Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      tag: 'exchange-update',
      silent: true,
      requireInteraction: false
    });
  }
};