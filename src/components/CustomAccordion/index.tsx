import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";

interface CustomAccordionProps {
  title: String;
  children: JSX.Element;
  marginBottom: number;
}
export default function CustomAccordion({
  title,
  children,
  marginBottom,
}: CustomAccordionProps) {
  return (
    <Accordion
      marginBottom={marginBottom}
      defaultIndex={[0]}
      allowMultiple
      width="100%"
      backgroundColor="#FFF"
      borderRadius="8px"
    >
      <AccordionItem>
        <h2>
          <AccordionButton>
            <AccordionIcon />
            <Box
              as="span"
              textAlign="left"
              marginLeft="18"
              fontSize="17px"
              fontWeight="600"
              fontStyle="normal"
              lineHeight="24px"
            >
              {title}
            </Box>
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} width="100%">
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
