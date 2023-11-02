import { Button, Flex, Image } from "@chakra-ui/react";
import * as XLSX from "xlsx";

interface ExportExcelProps {
  fileName: string;
  excelData: any[];
}

const ExportExcel = ({ excelData, fileName }: ExportExcelProps) => {
  const fileExtension = ".xlsx";

  const exportToExcel = async () => {
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName + fileExtension);
  };

  return (
    <Flex marginRight="1em">
      <Button onClick={exportToExcel} colorScheme="blue" size="md">
        <Image width="3.5em" src="src/images/spreadsheet-file-icon.png" />
      </Button>
    </Flex>
  );
};

export default ExportExcel;
