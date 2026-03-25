import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A wrapper for AsyncStorage to handle saving offline queue states.
 */

const STORAGE_KEY = '@opg_offline_queue';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export const getOfflineQueue = async (): Promise<QueuedAction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading offline queue", error);
    return [];
  }
};

export const enqueueAction = async (action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
  try {
    const queue = await getOfflineQueue();
    const newAction: QueuedAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    queue.push(newAction);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error("Error saving to offline queue", error);
    return false;
  }
};

export const clearQueueItem = async (id: string) => {
  try {
    const queue = await getOfflineQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from offline queue", error);
  }
};
