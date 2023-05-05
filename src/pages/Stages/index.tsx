import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { AddIcon, Icon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { hasPermission } from "utils/permissions";
import { getStages, deleteStage } from "../../services/stage";
import { CreationModal } from "./CreationModal";

function Stages() {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const {
    data: stagesData,
    isFetched: isStagesFetched,
    refetch: refetchStages,
  } = useQuery({
    queryKey: ["stages"],
    queryFn: getStages,
    onError: () => {
      toast({
        id: "stages-error",
        title: "Erro ao carregar etapas",
        description:
          "Houve um erro ao carregar etapas, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const tableActions = useMemo(
    () => [
      {
        label: "Excluir Etapa",
        icon: <Icon as={MdDelete} boxSize={5} />,
        action: async ({ stage }: { stage: Stage }) => {
          handleDeleteStage(stage);
        },
        actionName: "view-stages",
        disabled: isActionDisabled("view-stage"),
      },
    ],
    [isStagesFetched, isUserFetched]
  );

  const filteredStages = useMemo<TableRow<Stage>[]>(() => {
    if (!isStagesFetched) return [];

    const value =
      filter !== ""
        ? stagesData?.value?.filter((stage) =>
            stage.name.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : stagesData?.value;

    return (
      (value?.reduce(
        (acc: TableRow<Stage>[] | Stage[], curr: TableRow<Stage> | Stage) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { stage: curr } },
        ],
        []
      ) as TableRow<Stage>[]) || []
    );
  }, [stagesData, filter, isStagesFetched]);

  const tableColumnHelper = createColumnHelper<TableRow<Stage>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Etapas",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("duration", {
      cell: (info) => info.getValue(),
      header: "Duração",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("tableActions", {
      cell: (info) => info.getValue(),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

  const handleDeleteStage = async (stage: Stage) => {
    handleLoading(true);
    const res = await deleteStage(stage.idStage);
    if (res.type === "success") {
      handleLoading(false);
      refetchStages();
      toast({
        id: "login-success",
        title: "Sucesso!",
        description: "Etapa deletada com sucesso!",
        status: "success",
      });
      return;
    }
    handleLoading(false);
    toast({
      id: "delete-error",
      title: "Erro na deleção da etaoa.",
      description: res.error?.message,
      status: "error",
      isClosable: true,
    });
  };

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Etapas
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="green"
            isDisabled={isActionDisabled("create-stage")}
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Criar etapa
          </Button>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar etapas"
            value={filter}
            onChange={({ target }) => setFilter(target.value)}
            variant="filled"
            css={{
              "&, &:hover, &:focus": {
                background: "white",
              },
            }}
          />
        </Flex>
      </Flex>
      <DataTable
        data={filteredStages}
        columns={tableColumns}
        isDataFetching={!isStagesFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas etapas."
      />
      <CreationModal
        user={userData?.value!}
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetchStages}
      />
    </PrivateLayout>
  );
}

export default Stages;
