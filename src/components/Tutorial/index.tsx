import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Flex,
  Box,
} from "@chakra-ui/react";
import { MdHelp } from "react-icons/md";
import { colors } from "styles/colors";
import { helperText } from "../../utils/helperText";
import { Item } from "./Accordion";

export function Tutorial() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      mt="auto"
      width="90%"
      maxWidth={1140}
      alignItems="center"
      justifyContent="end"
    >
      <MdHelp
        title="Tutorial"
        color={colors.blue["500"]}
        onClick={onOpen}
        size={50}
        cursor="pointer"
      />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>FAQ - Capju</DrawerHeader>
          <DrawerBody>
            {helperText &&
              helperText.map((text) => {
                return (
                  <Box key={text.title}>
                    <Item
                      title={text.title}
                      subtitle={text.subtitle}
                      content={text.content && text.content}
                    />
                  </Box>
                );
              })}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
