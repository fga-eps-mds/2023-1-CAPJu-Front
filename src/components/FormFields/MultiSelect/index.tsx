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

export interface MultiSelectProps
  extends Omit<ChakraSelectProps, "onChange" | "defaultValue"> {
  options: SelectOption[];
  label?: string | JSX.Element;
  errors?: FieldError | undefined;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: SelectOption[]) => void;
  defaultValue?: SelectOption[];
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
          // @ts-ignore
          defaultValue={defaultValue || undefined}
          {...rest}
        />
        <FormErrorMessage color="red.400">{errors?.message}</FormErrorMessage>
      </FormControl>
    );
  }
);
