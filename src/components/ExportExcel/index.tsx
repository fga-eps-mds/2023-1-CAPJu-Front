import { Button, Flex, Text } from "@chakra-ui/react";
import * as XLSX from "xlsx";

interface ExportExcelProps {
  fileName: string;
  excelData: any[];
}

const ExportExcel = ({ excelData, fileName }: ExportExcelProps) => {
  const fileExtension = ".xlsx";

  /* This operation is too resource-intensive to be handled by the frontend.
    It is advisable to move this logic to the server-side for better performance and efficiency.
    If any experienced (or, at least, competent) developers are reviewing this, please consider refactoring accordingly. */
  const exportToExcel = async () => {
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName + fileExtension);
  };

  return (
    <Flex marginRight="1em" hidden={excelData.length === 0}>
      <Button onClick={exportToExcel} colorScheme="blue" size="md">
        <Text> XLSX </Text>
      </Button>
    </Flex>
  );
};

export default ExportExcel;
