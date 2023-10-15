import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import {
  epsName,
  mdsName,
  aboutYears,
  epsStudents20231,
  mdsStudents20231,
  mdsStudents20232,
  epsStudents20222,
  mdsStudents20222,
  epsStudents20221,
  mdsStudents20221,
  epsStudents20232,
} from "utils/aboutText";

function AboutAccordion() {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {epsName}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Tabs>
            <TabList>
              <Tab>{aboutYears[0]}</Tab>
              <Tab>{aboutYears[1]}</Tab>
              <Tab>{aboutYears[2]}</Tab>
              <Tab>{aboutYears[3]}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {epsStudents20232.map((student) => {
                  return <Badge mr={1}>
                    <a href={student.profile} target="_blank" rel="noopener noreferrer">
                      {student.name}
                    </a>
                  </Badge>
                })}
              </TabPanel>
              <TabPanel>
                {epsStudents20231.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
              <TabPanel>
                {epsStudents20222.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
              <TabPanel>
                {epsStudents20221.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {mdsName}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Tabs>
            <TabList>
              <Tab>{aboutYears[0]}</Tab>
              <Tab>{aboutYears[1]}</Tab>
              <Tab>{aboutYears[2]}</Tab>
              <Tab>{aboutYears[3]}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {mdsStudents20232.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
              <TabPanel>
                {mdsStudents20231.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
              <TabPanel>
                {mdsStudents20222.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
              <TabPanel>
                {mdsStudents20221.map((name) => {
                  return <Badge mr={1}>{name}</Badge>;
                })}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default AboutAccordion;
