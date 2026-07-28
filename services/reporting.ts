import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme';

interface ReportData {
  patientName: string;
  caseId: string;
  date: string;
  dob: string;
  chronoAge: string;
  dentalAge: number;
  maturityScore: number;
  ageRange: string;
  toothStages: Record<number, string>;
  imageUri: string;
  practitionerName: string;
  licenseId: string;
}

export const generateClinicalReport = async (data: ReportData) => {
  const toothGridHtml = Object.entries(data.toothStages)
    .map(([tooth, stage]) => `
      <div class="tooth-item">
        <div class="tooth-num">${tooth}</div>
        <div class="tooth-stage">${stage}</div>
      </div>
    `).join('');

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1A1C1E; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-text { font-size: 28px; font-weight: bold; color: ${colors.primary}; }
          .clinic-info { text-align: right; font-size: 12px; color: #72777F; }

          .report-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }

          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; font-weight: bold; color: ${colors.primary}; border-bottom: 1px solid #DDE3EA; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; }

          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 10px; }
          .info-label { font-size: 10px; color: #72777F; font-weight: bold; text-transform: uppercase; }
          .info-value { font-size: 16px; font-weight: 600; }

          .result-card { background-color: #F5F7F8; padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-around; margin-bottom: 20px; }
          .score-circle { width: 80px; height: 80px; border: 4px solid ${colors.primaryLight}; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .score-val { font-size: 28px; font-weight: bold; color: ${colors.primary}; }
          .score-unit { font-size: 10px; font-weight: bold; color: ${colors.primaryLight}; }

          .tooth-grid { display: flex; justify-content: space-between; gap: 10px; margin-top: 10px; }
          .tooth-item { flex: 1; text-align: center; border: 1px solid #DDE3EA; border-radius: 8px; padding: 10px 5px; }
          .tooth-num { font-size: 10px; color: #72777F; margin-bottom: 5px; }
          .tooth-stage { font-size: 18px; font-weight: bold; color: ${colors.primary}; }

          .opg-container { width: 100%; height: 250px; background-color: #000; border-radius: 12px; overflow: hidden; margin-top: 15px; }
          .opg-image { width: 100%; height: 100%; object-fit: contain; }

          .footer { margin-top: 50px; border-top: 1px solid #DDE3EA; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #72777F; }
          .disclaimer { font-style: italic; max-width: 60%; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">DentAge 2.0</div>
          <div class="clinic-info">
            <strong>Clinical Edition</strong><br />
            Report ID: ${data.caseId}<br />
            Generated: ${data.date}
          </div>
        </div>

        <div class="report-title">Forensic Dental Age Report</div>

        <div class="section">
          <div class="section-title">Patient Identification</div>
          <div class="grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">${data.patientName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${data.dob}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Chronological Age</div>
              <div class="info-value">${data.chronoAge} Years</div>
            </div>
            <div class="info-item">
              <div class="info-label">Case Identifier</div>
              <div class="info-value">${data.caseId}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">AI-Powered Diagnostic Results</div>
          <div class="result-card">
            <div class="score-circle">
              <div class="score-val">${data.dentalAge}</div>
              <div class="score-unit">YEARS</div>
            </div>
            <div style="flex: 1; margin-left: 30px;">
              <div class="info-label">Estimated Dental Age</div>
              <div class="info-value" style="font-size: 20px; color: ${colors.primary};">Demirjian Classification</div>
              <div class="info-label" style="margin-top: 10px;">Age Range Reference</div>
              <div class="info-value">${data.ageRange}</div>
            </div>
            <div style="text-align: right;">
              <div class="info-label">Maturity Score</div>
              <div class="info-value" style="font-size: 24px;">${data.maturityScore}%</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Mandibular Left Development (ISO 31-37)</div>
          <div class="tooth-grid">
            ${toothGridHtml}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Diagnostic Radiograph Reference</div>
          <div class="opg-container">
            <img src="${data.imageUri}" class="opg-image" />
          </div>
        </div>

        <div class="footer">
          <div class="disclaimer">
            This report is an AI-assisted diagnostic tool. Findings should be verified by a qualified
            clinical professional against morphological standards.
          </div>
          <div style="text-align: right;">
            <strong>DR. ${data.practitionerName.toUpperCase()}</strong><br />
            License: ${data.licenseId}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
};
