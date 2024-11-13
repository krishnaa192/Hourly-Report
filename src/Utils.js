// utils/apiService.js
import { openDB } from 'idb';

const api_url = process.env.REACT_APP_API_URL;

// Database and store configuration
const dbName = 'inappReportDB';
const storeName = 'reports';

// Initialize IndexedDB
const initDB = async () => {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });
};

// Store data in IndexedDB
const storeDataInCache = async (data) => {
  const db = await initDB();
  await db.put(storeName, { data, timestamp: Date.now() }, 'hourlyReport');
};

// Retrieve data from IndexedDB
const getDataFromCache = async () => {
  const db = await initDB();
  const cachedData = await db.get(storeName, 'hourlyReport');
  if (cachedData && Date.now() - cachedData.timestamp < 12 * 60 * 60 * 1000) {
    return cachedData.data;
  }
  return null;
};

export const fetchHourlyInappReport = async () => {
  try {
    // Try to get data from IndexedDB cache
    const cachedData = await getDataFromCache();
    if (cachedData) {
      console.log('Returning cached data');
      return cachedData;
    }

    // Fetch data from API if no valid cache is available
    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    // Store fetched data in cache for 24 hours
    await storeDataInCache(data);

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Propagate the error to handle in the calling component
  }
};

  