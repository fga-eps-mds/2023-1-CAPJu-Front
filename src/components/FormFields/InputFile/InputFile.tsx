/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import {
  FormControl,
  FormLabel,
  HStack,
  Flex,
  Button,
  Box,
  Input,
  Icon,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { FieldError } from "react-hook-form";

interface InputFileProps {
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any;
  allowedFileTypes?: string[];
  externalError?: FieldError | undefined;
}

const InputFile = ({
  onChange,
  label,
  allowedFileTypes,
  externalError,
  ...props
}: InputFileProps) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = event.target.files && event.target.files[0];
    console.log(file);
    if (
      file &&
      allowedFileTypes?.length &&
      !allowedFileTypes.includes(file.type)
    ) {
      setError("Formato inválido. Insira um .xls, .xlsx ou .csv");
    }

    if (file) {
      setFilename(file.name);
      if (onChange) {
        onChange(event);
      }
    }
  };

  const handleClick = () => {
    if (inputFileRef.current) inputFileRef.current.click();
  };

  return (
    <FormControl isInvalid={!!error || !!externalError?.message}>
      {label && <FormLabel>{label}</FormLabel>}
      <HStack spacing={4}>
        <Flex align="center" width="100%">
          <Button
            colorScheme="black"
            onClick={handleClick}
            leftIcon={<Icon as={FaUpload} />}
            backgroundColor="black"
            color="white"
            borderRightRadius="0"
            _hover={{ backgroundColor: "black" }}
          >
            Carregar arquivo
          </Button>
          <Box flex="1" color="black">
            <Input
              color="black"
              placeholder="Nenhum arquivo inserido"
              readOnly
              value={filename}
              borderTopLeftRadius="0"
              borderBottomLeftRadius="0"
              // @ts-ignore
              borderColor={
                error ? "red" : externalError?.message ? "red.500" : null
              }
              {...props}
            />
            <input
              ref={inputFileRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>
        </Flex>
      </HStack>
      <FormErrorMessage>{error || externalError?.message}</FormErrorMessage>
    </FormControl>
  );
};

export default InputFile;
