import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import fs from "fs";

// Get Sheets client authorized with service account JSON file
const getSheetsClient = async () => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const credentialsPath = path.join(process.cwd(), "google-credentials.json");

  if (!spreadsheetId) {
    console.warn("Google Sheets sync is disabled: GOOGLE_SHEETS_SPREADSHEET_ID is missing.");
    return null;
  }

  let auth: GoogleAuth;

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } catch (err) {
      console.error("Failed to parse GOOGLE_CREDENTIALS_JSON env variable:", err);
      return null;
    }
  } else if (fs.existsSync(credentialsPath)) {
    auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } else {
    console.warn("Google Sheets sync is disabled: Neither GOOGLE_CREDENTIALS_JSON env nor google-credentials.json file was found.");
    return null;
  }

  try {
    const client = await auth.getClient();
    return google.sheets({ version: "v4", auth: client as any });
  } catch (error) {
    console.error("Failed to initialize Google Auth client:", error);
    return null;
  }
};

// Check if a sheet tab exists, if not create it
async function ensureSheetExists(sheets: any, spreadsheetId: string, title: string) {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetExists = res.data.sheets?.some(
      (sheet: any) => sheet.properties?.title === title
    );

    if (!sheetExists) {
      console.log(`Sheet tab "${title}" does not exist. Creating it...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(`Error ensuring sheet tab "${title}" exists:`, error);
    throw error;
  }
}

// Get predefined headers for each model
function getHeadersForModel(modelName: string): string[] {
  const headersMap: Record<string, string[]> = {
    User: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    Patient: ["id", "fullName", "tcNo", "protocolNo", "phone", "secondPhone", "email", "address", "gender", "birthDate", "bloodGroup", "insuranceInfo", "relativeName", "relativePhone", "emergencyName", "emergencyPhone", "smokingStatus", "alcoholStatus", "chronicDiseases", "riskStatus", "notes", "createdAt", "updatedAt"],
    Appointment: ["id", "patientId", "doctorId", "dateTime", "status", "notes", "createdAt", "updatedAt"],
    Examination: ["id", "patientId", "doctorId", "complaint", "physicalExam", "diagnosis", "preliminaryDiag", "finalDiagnosis", "icd10Code", "treatment", "treatmentPlan", "notes", "version", "createdAt", "updatedAt"],
    Payment: ["id", "patientId", "amount", "type", "category", "description", "date", "notes", "createdAt", "updatedAt"],
    Notification: ["id", "userId", "title", "message", "isRead", "createdAt", "updatedAt"],
    Treatment: ["id", "name", "category", "cost", "duration", "description", "createdAt", "updatedAt"],
    InventoryItem: ["id", "name", "category", "quantity", "unit", "unitPrice", "minThreshold", "expiration", "createdAt", "updatedAt"],
    LabTest: ["id", "patientId", "doctorId", "testName", "result", "status", "date", "createdAt", "updatedAt"],
    Prescription: ["id", "patientId", "doctorId", "diagnosis", "notes", "date", "createdAt", "updatedAt"],
    PrescriptionItem: ["id", "prescriptionId", "medicineName", "dosage", "frequency", "duration"],
    Allergy: ["id", "patientId", "type", "name", "severity", "reaction", "notes", "createdAt"],
    PatientMedication: ["id", "patientId", "name", "dosage", "frequency", "startDate", "endDate", "isActive", "notes", "createdAt"],
    FamilyHistory: ["id", "patientId", "condition", "relation", "notes", "createdAt"],
    Surgery: ["id", "patientId", "name", "date", "surgeonId", "assistantTeam", "technique", "duration", "anesthesiaType", "operationNote", "complication", "status", "createdAt"],
    FollowUp: ["id", "patientId", "doctorId", "date", "type", "notes", "result", "createdAt"],
    FileAttachment: ["id", "patientId", "fileName", "filePath", "fileType", "category", "description", "uploadedAt"],
    Expense: ["id", "category", "description", "amount", "date", "notes", "createdAt"],
    AuditLog: ["id", "userId", "userName", "action", "entity", "entityId", "details", "ipAddress", "createdAt"],
    ConsentForm: ["id", "patientId", "type", "title", "signedAt", "pdfPath", "createdAt"],
  };

  // Capitalize modelName to match Prisma casing (e.g. Patient, Appointment)
  const normalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  return headersMap[normalized] || ["id"];
}

// Synchronizes the records of a given model to its corresponding Google Sheet tab
export async function syncModelToSheets(modelName: string, data: any[]) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!sheets || !spreadsheetId) return;

  const headers = getHeadersForModel(modelName);

  // Format records into 2D grid values
  const rows = data.map((item) => {
    return headers.map((header) => {
      const val = item[header];
      if (val instanceof Date) {
        return val.toISOString();
      }
      if (typeof val === "boolean") {
        return val ? "TRUE" : "FALSE";
      }
      if (val === null || val === undefined) {
        return "";
      }
      if (typeof val === "object") {
        return JSON.stringify(val);
      }
      return String(val);
    });
  });

  const values = [headers, ...rows];

  try {
    // 1. Ensure the sheet tab exists
    await ensureSheetExists(sheets, spreadsheetId, modelName);

    // 2. Clear old contents to handle deleted or reduced rows
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${modelName}!A1:Z100000`,
    });

    // 3. Write new data starting from A1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${modelName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    console.log(`[Google Sheets Sync] Synced ${data.length} rows for model "${modelName}".`);
  } catch (error) {
    console.error(`[Google Sheets Sync] Failed to sync model "${modelName}":`, error);
  }
}
