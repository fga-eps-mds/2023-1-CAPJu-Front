import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button } from "@chakra-ui/react";
import { AddIcon, ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { hasPermission } from "utils/permissions";
import { getStages } from "../../services/stage";

function Stages() {
  const toast = useToast();
  const [selectedStage, selectStage] = useState<Unit | null>(null);
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const {
    data: stagesData,
    isFetched: isStagesFetched,
    // refetch: refetchStages,
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
        label: "Visualizar Etapas",
        icon: <ViewIcon boxSize={4} />,
        action: ({ stage }: { stage: Stage }) => {
          selectStage(stage);
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
      header: "Unidades",
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

  console.log("SELECTED STAGE", selectedStage);

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
            onClick={() => console.log("Criar Etapa")}
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
    </PrivateLayout>
  );
}

export default Stages;
