import { Tabs, TabList, Tab, Flex } from "@chakra-ui/react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getTabIndexes } from "utils/tabs";

export function NavigationTabs() {
  const tabs = getTabIndexes();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTabIndex = useMemo<number | undefined>(() => {
    const currentPathIndex = location.pathname
      .split("/")
      .filter((_item, index) => index < 2)
      .join("/");
    const currentTab = tabs.find((tab) => tab.pathIndex === currentPathIndex);

    return currentTab ? tabs.indexOf(currentTab) : undefined;
  }, [tabs, location]);

  return (
    <Flex
      w="100%"
      pl={["5vw", "5vw", "5vw", "5vw", 0]}
      justifyContent="start"
      marginBottom={["6", "8"]}
      overflow="scroll"
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "&::-webkit-scrollbar-track": {
          display: "none",
        },
        "&::-webkit-scrollbar-thumb": {
          display: "none",
        },
      }}
    >
      <Tabs
        w="100%"
        variant="line"
        colorScheme="green"
        defaultIndex={currentTabIndex}
      >
        <TabList>
          {tabs.map((tab, index) => {
            const isCurrentTab = currentTabIndex === index;

            return (
              <Tab
                key={tab.label}
                disabled={isCurrentTab}
                onClick={() => (isCurrentTab ? {} : navigate(tab.path))}
                cursor={isCurrentTab ? "default" : "pointer"}
                minW="fit-content"
              >
                {tab.label}
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Flex>
  );
}
