import { FieldError } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  forwardRef,
  SelectProps as ChakraSelectProps,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

type Option = {
  label: string;
  value: string | number;
};

export interface MultiSelectProps extends Omit<ChakraSelectProps, "onChange"> {
  options: Option[];
  label?: string | JSX.Element;
  errors?: FieldError | undefined;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: SelectOption[]) => void;
}

export const MultiSelect = forwardRef<MultiSelectProps, "select">(
  (props, ref) => {
    const { label, errors, options, defaultValue, ...rest } = props;

    return (
      <FormControl
        isInvalid={Boolean(errors)}
        width={props.width || props.w || "100%"}
      >
        {label && <FormLabel>{label}</FormLabel>}
        <Select
          isMulti
          tagVariant="solid"
          colorScheme="blue"
          // @ts-ignore
          options={options}
          ref={ref}
          noOptionsMessage={() => <Text>Não há mais opções disponíveis.</Text>}
          {...rest}
        />
        <FormErrorMessage color="red.400">{errors?.message}</FormErrorMessage>
      </FormControl>
    );
  }
);
