import * as Network from 'expo-network';

/**
 * Validates whether the device has an active internet connection.
 */
export const isNetworkConnected = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return !!networkState.isConnected && networkState.isInternetReachable === true;
  } catch (error) {
    console.error("Network detection error", error);
    return false;
  }
};
