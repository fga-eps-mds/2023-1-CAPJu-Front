import { Button, Image } from '@chakra-ui/react';
import * as XLSX from "xlsx";

interface ExportExcelProps {
  fileName: string;
  excelData: any[];
}

const ExportExcel = ({ excelData, fileName }: ExportExcelProps) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    
    const exportToExcel = async () => {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName + fileExtension);
    }

    return (
      <Button onClick={exportToExcel} colorScheme="blue" size="md">
        <Image width="20px" src="src/images/csv.svg" />
      </Button>
    )
}


export default ExportExcel;