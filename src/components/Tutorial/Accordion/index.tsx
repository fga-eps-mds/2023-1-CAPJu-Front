import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

type AccordionProps = React.PropsWithChildren<{
  title: string;
  subtitle: string;
  content: string[] | undefined;
}>;

export function Item({ title, subtitle, content }: AccordionProps) {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>{subtitle}</AccordionPanel>
        <AccordionPanel pb={4}>
          <UnorderedList>
            {content &&
              content.map((text: string) => {
                return <ListItem key={text}>{text}</ListItem>;
              })}
          </UnorderedList>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
