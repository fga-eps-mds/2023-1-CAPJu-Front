import {
  Button,
  Flex,
  Image,
  Progress,
  Tab,
  TabList,
  Tabs,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Text,
} from "@chakra-ui/react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { PiListMagnifyingGlassDuotone } from "react-icons/pi";
import { FaUser, FaRegEdit } from "react-icons/fa";
import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { HeaderLink } from "./HeaderLink";
import { tabs } from "../../utils/tabs";
import { isActionAllowedToUser } from "../../utils/permissions";

export function Header() {
  const { getUserData } = useAuth();
  const { isAuthenticated, handleLogout } = useAuth();
  const { isLoading } = useLoading();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });

  const location = useLocation();
  const currentTabIndex = useMemo<number | undefined>(() => {
    const currentPathIndex = location.pathname
      .split("/")
      .filter((_item, index) => index < 2)
      .join("/");
    const currentTab = tabs.find((tab) => tab.pathIndex === currentPathIndex);

    return currentTab ? tabs.indexOf(currentTab) : undefined;
  }, [tabs, location]);

  const isUserAllowedInTab = useCallback(
    (tabAction: string | undefined) => {
      if (!tabAction) return true;
      if (!userData?.value) return false;
      if (tabAction === "manage-profiles" && userData?.value?.idRole === 5)
        return true;

      return isActionAllowedToUser(userData?.value?.allowedActions, tabAction);
    },
    [userData]
  );
  const [tabIndex, setTabIndex] = useState<number | undefined>(currentTabIndex);
  const navigate = useNavigate();

  return (
    <Flex
      py="4"
      w="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor="white"
      position="relative"
    >
      <Flex
        w="90%"
        maxW={1120}
        alignItems="center"
        justifyContent="space-between"
      >
        <Image w="20%" maxW="24" src="/assets/logo.png" />
        {isAuthenticated ? (
          <>
            <Flex alignItems="center" ml="auto" gap="5">
              <Tabs
                w="100%"
                variant="line"
                colorScheme="green"
                index={tabIndex}
                size="lg"
              >
                <TabList sx={{ borderBottom: "unset" }}>
                  {tabs.map((tab, index) => {
                    const isCurrentTab = currentTabIndex === index;
                    let cursor = isCurrentTab ? "default" : "pointer";

                    if (!isUserAllowedInTab(tab.action)) cursor = "not-allowed";

                    const handleClick = () => {
                      if (isUserAllowedInTab(tab.action)) {
                        navigate(tab.path);
                        setTabIndex(index);
                      }
                    };

                    return (
                      <Tab
                        sx={{ paddingBottom: "5px", fontSize: "16px" }}
                        key={tab.label}
                        onClick={handleClick}
                        cursor={cursor}
                        minW="fit-content"
                        opacity={isUserAllowedInTab(tab.action) ? 1 : 0.25}
                      >
                        {tab.label}
                      </Tab>
                    );
                  })}
                </TabList>
              </Tabs>
            </Flex>
            <Flex alignItems="center" ml="auto" gap="5">
              <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <PopoverTrigger>
                  <Avatar
                    bg="black"
                    cursor="pointer"
                    onClick={() => setIsOpen(true)}
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <Flex direction="column" gap="2">
                      <Button
                        size="sm"
                        w="100%"
                        variant="ghost"
                        colorScheme="blackAlpha"
                        onClick={() => {
                          navigate("/acessos");
                          setIsOpen(false);
                        }}
                        leftIcon={<FaUser color="black" />}
                        justifyContent="flex-start"
                      >
                        <Flex alignItems="jus">
                          <Text ml="2" textColor="black">
                            Solicitações de cadastro
                          </Text>
                        </Flex>
                      </Button>
                      <hr />
                      <Button
                        size="sm"
                        w="100%"
                        variant="ghost"
                        colorScheme="blackAlpha"
                        onClick={() => {
                          navigate("/perfis");
                          setIsOpen(false);
                        }}
                        leftIcon={
                          <PiListMagnifyingGlassDuotone color="black" />
                        }
                        justifyContent="flex-start"
                      >
                        <Flex alignItems="center">
                          <Text ml="2" textColor="black">
                            Perfis e Permissões
                          </Text>
                        </Flex>
                      </Button>
                      <hr />
                      <Button
                        size="sm"
                        w="100%"
                        variant="ghost"
                        colorScheme="blackAlpha"
                        leftIcon={<FaRegEdit color="black" />}
                        onClick={() => {
                          navigate("/editar-conta");
                          setIsOpen(false);
                        }}
                        justifyContent="flex-start"
                      >
                        <Flex alignItems="center">
                          <Text ml="2" textColor="black">
                            Editar conta
                          </Text>
                        </Flex>
                      </Button>
                      <hr />
                      <Button
                        size="sm"
                        w="100%"
                        variant="ghost"
                        colorScheme="blackAlpha"
                        onClick={() => {
                          navigate("/contribuidores");
                          setIsOpen(false);
                        }}
                        leftIcon={
                          <IoIosInformationCircleOutline color="black" />
                        }
                        justifyContent="flex-start"
                      >
                        <Flex alignItems="center">
                          <Text ml="2" textColor="black">
                            Sobre
                          </Text>
                        </Flex>
                      </Button>
                      <hr />
                      <Button
                        size="sm"
                        w="100%"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<MdLogout color="black" />}
                        justifyContent="flex-start"
                      >
                        <Flex alignItems="center">
                          <Text
                            ml="2"
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                          >
                            Sair
                          </Text>
                        </Flex>
                      </Button>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
          </>
        ) : (
          <Flex gap={["3", "4"]} alignItems="center" justifyContent="end">
            <HeaderLink href="/">Login</HeaderLink>
            <HeaderLink href="/cadastro">Cadastro</HeaderLink>
            <HeaderLink href="/contribuidores">Sobre</HeaderLink>
          </Flex>
        )}
      </Flex>
      {isLoading && (
        <Progress
          position="absolute"
          top="100%"
          w="100%"
          background="gray.200"
          colorScheme="green"
          isIndeterminate
          height={[2, 2.5]}
        />
      )}
    </Flex>
  );
}
