import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';

/**
 * Handles PDF Generation and Local Saving using Modern FileSystem API.
 */
export const generatePDFReport = async (htmlContent: string): Promise<string> => {
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    const fileName = `OPG_Age_Report_${Date.now()}.pdf`;
    const sourceFile = new File(uri);
    const destinationFile = new File(Paths.document, fileName);

    await sourceFile.move(destinationFile);

    return destinationFile.uri;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

