/**
 * My name is Nicholas and I was extorted to write this code.
 * I hope a developer who has been hired finds it and realizes how much blood is behind it.
 * * */

import { useQuery } from "react-query";
import { Flex, Text, Button, Input, chakra, useToast } from "@chakra-ui/react";
import { Icon, SearchIcon } from "@chakra-ui/icons";
import { FaEraser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

import { DataTable } from "components/DataTable";
import { Pagination } from "components/Pagination";
import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { PrivateLayout } from "layouts/Private";
import { findAllSessionsPaged, logoutAsAdmin } from "../../../services/user";
import { useAuth } from "../../../hooks/useAuth";
import { formatDateTimeToBrazilian } from "../../../utils/dates";

function UserSessions() {
  const { getUserData, handleLogout } = useAuth();

  const toast = useToast();

  const tableColumnHelper = createColumnHelper<TableRow<any>>();

  const sessionsTableColumns = [
    tableColumnHelper.accessor("userName", {
      cell: (info) => info.getValue(),
      header: "Usuário",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("unit", {
      cell: (info) => info.getValue(),
      header: "Unidade",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("loginTimestamp", {
      cell: (info) => info.getValue(),
      header: "Data login",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("stationIp", {
      cell: (info) => info,
      header: "Estação",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("sessionsTableActions", {
      cell: (info) => ({
        className: "centered-cell",
        children: info.getValue(),
      }),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });

  const sessionsTableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Deslogar usuário",
        icon: <Icon as={IoLogOut} boxSize={6} style={{ marginLeft: "8px" }} />,
        actionName: "see-process",
        action: async ({ session }) => {
          const { sessionId } = session;
          const { sessionId: currentSessionId } = ((await getUserData()) as any)
            .value;
          if (currentSessionId === sessionId) {
            await handleLogout();
          } else {
            const { type } = await logoutAsAdmin(sessionId);
            if (type === "success") {
              refetchSessions().then(() => {
                toast({
                  id: "edit-unit-success",
                  title: "Sucesso!",
                  description: "Usuário deslogado com sucesso",
                  status: "success",
                });
              });
            }
          }
        },
      },
    ],
    [isUserFetched, userData]
  );

  useEffect(() => {
    refetchSessions().finally();
  }, []);

  const [filter, setFilter] = useState<string>("");

  const [
    processesFileTablePaginationInfo,
    setProcessesFileTablePaginationInfo,
  ] = useState<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  }>();

  const [processesFileTableRows, setProcessesFileTableRows] = useState<
    TableRow<UserSession>[]
  >([]);

  const [rawSessions, setRawSessions] = useState<UserSession[]>([]);

  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(true);

  const refetchSessions = async (
    selectedPage?: { selected: number },
    nameOrRecordFilterParam = filter
  ) => {
    const offset = selectedPage ? selectedPage.selected * 10 : 0;
    setIsFetchingFiles(true);
    const result = await findAllSessionsPaged(
      { offset, limit: 10 },
      nameOrRecordFilterParam
    );
    const value = result.value as { data: UserSession[]; pagination: any };
    if (result && result.type === "success") {
      const { data, pagination } = value;
      setProcessesFileTablePaginationInfo(pagination);
      setRawSessions(data);
      const rows = (data || []).map((session) => {
        return {
          userName: session.userInfo?.fullName || "-",
          unit: session.userInfo?.unit?.name || "-",
          loginTimestamp: formatDateTimeToBrazilian(session.loginTimestamp),
          stationIp: session.stationIp,
          sessionsTableActions,
          actionsProps: {
            session,
          },
        };
      });
      setProcessesFileTableRows(rows as any);
    }
    setIsFetchingFiles(false);
  };

  return (
    <>
      <PrivateLayout>
        <Flex w="40%" flexDir="column" gap="3" mb="4" mt="50px">
          <Flex w="100%" mb="2" justifyContent="start" alignItems="baseline">
            {" "}
            {/* Add alignItems here */}
            <Text fontSize="25px" fontWeight="semibold" width="25%">
              Sessões Usuários
            </Text>
            <Flex
              width="100%"
              justifyContent="space-between"
              gap="2"
              flexWrap="wrap"
              mt="25px"
            >
              <Flex
                w="100%"
                justifyContent="flex-start"
                alignItems="center"
                gap="2"
                flexWrap="wrap"
              >
                <chakra.form
                  onSubmit={(e) => {
                    e.preventDefault();
                    refetchSessions().finally();
                  }}
                  width="60%"
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap="2"
                  ml="auto"
                >
                  <Input
                    color="black"
                    placeholder="Pesquise usuários por nome, email ou cpf"
                    variant="filled"
                    onChange={({ target }) => setFilter(target.value)}
                    value={filter}
                    css={{
                      "&, &:hover, &:focus": {
                        background: "white",
                      },
                    }}
                  />
                  <Button
                    aria-label="botão de limpeza"
                    colorScheme="green"
                    justifyContent="center"
                    title={filter && "Limpar filtro"}
                    isDisabled={!filter}
                    onClick={() => {
                      setFilter("");
                      refetchSessions(undefined, "").finally();
                    }}
                  >
                    <Icon as={FaEraser} boxSize={4} />
                  </Button>
                  <Button
                    aria-label="botão de busca"
                    colorScheme="green"
                    justifyContent="center"
                    title="Pesquisar"
                    type="submit"
                  >
                    <SearchIcon boxSize={4} />
                  </Button>
                </chakra.form>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <DataTable
          maxWidth="unset"
          width="40%"
          size="lg"
          data={processesFileTableRows}
          rawData={rawSessions}
          columns={sessionsTableColumns}
          isDataFetching={!isUserFetched || isFetchingFiles}
          emptyTableMessage="Não foram encontradas sessões"
        />
        {processesFileTablePaginationInfo?.totalPages ? (
          <Pagination
            pageCount={processesFileTablePaginationInfo?.totalPages}
            onPageChange={refetchSessions}
          />
        ) : null}
      </PrivateLayout>
    </>
  );
}

export default UserSessions;
