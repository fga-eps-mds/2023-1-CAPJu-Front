import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  Flex,
  useToast,
  Text,
  Button,
  useDisclosure,
  chakra,
} from "@chakra-ui/react";
import { AddIcon, Icon, SearchIcon } from "@chakra-ui/icons";
import { MdDelete, MdEdit } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";
import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { isActionAllowedToUser } from "utils/permissions";
import { Pagination } from "components/Pagination";
import { getStages } from "../../services/processManagement/stage";
import { CreationModal } from "./CreationModal";
import { DeletionModal } from "./DeletionModal";
import { EditionModal } from "./EditionModal";

function Stages() {
  const toast = useToast();
  const [selectedStage, selectStage] = useState<Stage>();
  const [filter, setFilter] = useState<
    { type: string; value: string } | undefined
  >(undefined);
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();
  const {
    isOpen: isDeletionOpen,
    onOpen: onDeletionOpen,
    onClose: onDeletionClose,
  } = useDisclosure();
  const {
    isOpen: isEditionOpen,
    onOpen: onEditionOpen,
    onClose: onEditionClose,
  } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });
  const {
    data: stagesData,
    isFetched: isStagesFetched,
    refetch: refetchStages,
  } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await getStages(
        { offset: currentPage * 10, limit: 10 },
        filter
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
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
    refetchOnWindowFocus: false,
  });

  const tableActions = useMemo(
    () => [
      {
        label: "Editar etapa",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ stage }: { stage: Stage }) => {
          selectStage(stage);
          onEditionOpen();
        },
        actionName: "edit-stage",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "edit-stage"
        ),
      },
      {
        label: "Excluir Etapa",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: async ({ stage }: { stage: Stage }) => {
          selectStage(stage);
          onDeletionOpen();
        },
        actionName: "delete-stage",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "delete-stage",
          // @ts-ignore
          userData
        ),
      },
    ],
    [isStagesFetched, isUserFetched, userData]
  );
  const filteredStages = useMemo<TableRow<Stage>[]>(() => {
    if (!isStagesFetched) return [];

    const value = stagesData?.value;

    return (
      (value?.reduce(
        (acc: TableRow<Stage>[] | Stage[], curr: TableRow<Stage> | Stage) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { stage: curr } },
        ],
        []
      ) as TableRow<Stage>[]) || []
    );
  }, [
    stagesData,
    filter,
    isStagesFetched,
    isUserFetched,
    userData,
    tableActions,
  ]);

  const tableColumnHelper = createColumnHelper<TableRow<Stage>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Etapa",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("duration", {
      cell: (info) => info.getValue(),
      header: "Duração (em dias)",
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

  useEffect(() => {
    refetchStages();
  }, [currentPage]);

  return (
    <PrivateLayout>
      <Flex w="40%" flexDir="column" gap="3" mb="4" mt="50px">
        <Flex w="50%" mb="2" justifyContent="start">
          <Text fontSize="25px" fontWeight="semibold">
            Etapas
          </Text>
        </Flex>
        <Flex justifyContent="space-between" gap="2" mb="15px">
          <Flex
            alignItems="center"
            justifyContent="start"
            gap="2"
            flexWrap="wrap"
          >
            <Button
              colorScheme="green"
              isDisabled={
                !isActionAllowedToUser(
                  userData?.value?.allowedActions || [],
                  "create-stage"
                )
              }
              onClick={onCreationOpen}
            >
              <AddIcon mr="2" boxSize={3} /> Criar Etapa
            </Button>
          </Flex>
          <Flex w="50%">
            <chakra.form
              onSubmit={(e) => {
                e.preventDefault();
                refetchStages();
              }}
              w="100%"
              display="flex"
              flexDirection="row"
            >
              <Input
                placeholder="Pesquisar etapas"
                value={filter?.value}
                onChange={({ target }) =>
                  setFilter({ type: "stage", value: target.value })
                }
                variant="filled"
                css={{
                  "&, &:hover, &:focus": {
                    background: "white",
                  },
                }}
              />
              <Button
                aria-label="botão de busca"
                colorScheme="green"
                marginLeft="2"
                justifyContent="center"
                type="submit"
              >
                <SearchIcon boxSize={4} />
              </Button>
            </chakra.form>
          </Flex>
        </Flex>
      </Flex>
      <DataTable
        data={filteredStages}
        columns={tableColumns}
        isDataFetching={!isStagesFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas etapas."
      />
      {![undefined, 0, null].includes(stagesData?.totalPages) ? (
        <Pagination
          // @ts-ignore
          pageCount={stagesData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
      <CreationModal
        user={userData?.value!}
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetchStages}
      />
      {selectedStage && (
        <DeletionModal
          stage={selectedStage}
          isOpen={isDeletionOpen}
          onClose={onDeletionClose}
          refetchStages={refetchStages}
        />
      )}
      {selectedStage ? (
        <EditionModal
          stage={selectedStage}
          isOpen={isEditionOpen}
          onClose={onEditionClose}
          afterSubmission={refetchStages}
        />
      ) : null}
    </PrivateLayout>
  );
}

export default Stages;
