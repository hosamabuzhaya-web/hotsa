import * as XLSX from 'xlsx';

/**
 * Parses an Excel or CSV file and returns an array of JSON objects.
 * @param {File} file - The uploaded file handler
 * @returns {Promise<Array>} - Array of objects representing the rows
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        // Parse the excel file
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // We assume we want the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to json
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};
