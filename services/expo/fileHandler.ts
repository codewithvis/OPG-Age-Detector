import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

/**
 * Handles PDF Generation and Local Saving.
 */
export const generatePDFReport = async (htmlContent: string): Promise<string> => {
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Move to a more permanent document directory if needed, or return the temp uri
    const fileName = `OPG_Age_Report_${Date.now()}.pdf`;
    const destDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
    const newPath = destDir + fileName;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newPath
    });

    return newPath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
