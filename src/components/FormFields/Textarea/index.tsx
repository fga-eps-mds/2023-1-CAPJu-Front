import { FieldError } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  forwardRef,
  Textarea as ChakraTextarea,
  InputGroup,
  TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";

export interface TextareaProps extends ChakraTextareaProps {
  infoText?: string | JSX.Element;
  label?: string | JSX.Element;
  errors?: FieldError | undefined;
  mask?: string;
}

export const Textarea = forwardRef<TextareaProps, "input">((props, ref) => {
  const { label, errors, mask, infoText, ...rest } = props;

  return (
    <FormControl
      isInvalid={Boolean(errors)}
      width={props.width || props.w || "100%"}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <InputGroup>
        <ChakraTextarea variant="outline" {...rest} ref={ref} />
      </InputGroup>
      <FormErrorMessage color="red.400">{errors?.message}</FormErrorMessage>
    </FormControl>
  );
});
