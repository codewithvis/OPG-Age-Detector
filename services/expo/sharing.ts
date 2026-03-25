import * as Sharing from 'expo-sharing';

/**
 * Handles sharing logic using the OS-native share sheet.
 */
export const shareFile = async (fileUri: string, dialogTitle: string = 'Share Report') => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: dialogTitle,
      });
    } else {
      console.warn("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error sharing file:", error);
  }
};
