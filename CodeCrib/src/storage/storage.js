import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJSON(key, fallback) {
  let serialized;

  try {
    serialized = await AsyncStorage.getItem(key);
  } catch (error) {
    throw new Error(`Could not read local data (${key}): ${error.message}`);
  }

  if (serialized === null) {
    return fallback;
  }

  try {
    return JSON.parse(serialized);
  } catch (error) {
    throw new Error(`Stored data is invalid (${key}): ${error.message}`);
  }
}

export async function writeJSON(key, value) {
  let serialized;

  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    throw new Error(`Could not prepare local data (${key}): ${error.message}`);
  }

  try {
    await AsyncStorage.setItem(key, serialized);
  } catch (error) {
    throw new Error(`Could not save local data (${key}): ${error.message}`);
  }
}

export async function removeStoredValue(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw new Error(`Could not clear local data (${key}): ${error.message}`);
  }
}
