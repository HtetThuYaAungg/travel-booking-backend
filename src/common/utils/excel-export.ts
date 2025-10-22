import * as ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  isDate?: boolean;
}

export async function exportToExcel<T>(
  sheetName: string,
  columns: ExcelColumn[],
  data: T[],
  mapper?: (item: T) => Record<string, any>,
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  // Add data rows
  data.forEach((item, rowIndex) => {
    const rowData = mapper ? mapper(item) : (item as any);
    const row = worksheet.addRow(rowData);

    columns.forEach((column, colIndex) => {
      if (column.isDate && rowData[column.key]) {
        const cell = row.getCell(colIndex + 1);

        cell.value = new Date(rowData[column.key]);
        cell.numFmt = 'dd-mmm-yyyy';
      }
    });
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  return workbook.xlsx.writeBuffer();
}
