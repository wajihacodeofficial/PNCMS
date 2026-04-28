import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export const exportToPDF = (title: string, headers: string[][], data: any[][], filename: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (sheetName: string, headers: string[], data: any[][], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.addRow(headers);
  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Style the header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE9ECEF' }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
