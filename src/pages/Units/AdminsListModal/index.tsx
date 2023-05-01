import { useEffect, useMemo } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { DataTable } from "components/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";

import { getUnitAdmins, removeUnitAdmin } from "services/units";
import { useLoading } from "hooks/useLoading";

interface CreationModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminsListModal({ unit, isOpen, onClose }: CreationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { data, isFetched, refetch } = useQuery({
    queryKey: ["unit-admins", unit.idUnit],
    queryFn: () => getUnitAdmins(unit.idUnit),
  });
  const tableActions = useMemo(
    () => [
      {
        label: "Remover Admin da Unidade",
        icon: <DeleteIcon boxSize={4} />,
        action: async ({ cpf }: { cpf: string }) => {
          handleLoading(true);

          try {
            await removeUnitAdmin({ idUnit: unit.idUnit, cpf });
            handleLoading(false);
            toast({
              id: "adm-removal-success",
              title: "Aministrador removido",
              description: "O usuário não é mais administrador da unidade.",
              status: "success",
              isClosable: true,
            });
            refetch();
          } catch {
            handleLoading(false);
            toast({
              id: "adm-removal-error",
              title: "Erro ao remover administrador",
              description: "Favor tentar novamente.",
              status: "error",
              isClosable: true,
            });
          }
        },
        actionName: "remove-admin-from-unit",
        disabled: false,
      },
    ],
    []
  );
  const admins = useMemo<TableRow<User>[]>(() => {
    if (!isFetched) return [];

    return (
      (data?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { cpf: curr.cpf } },
        ],
        []
      ) as TableRow<User>[]) || []
    );
  }, [data, isFetched]);

  const tableColumnHelper = createColumnHelper<TableRow<User>>();
  const tableColumns = [
    tableColumnHelper.accessor("fullName", {
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

  useEffect(() => {
    refetch();
  }, [unit]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Visualizar Administradores</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="3" pl="4">
            Administradores da unidade {unit?.name}
          </Text>
          <DataTable
            data={admins}
            columns={tableColumns}
            isDataFetching={!isFetched}
            width="100%"
            size="sm"
            emptyTableMessage="Não foi possível encontrar nenhum administrador para esta unidade."
          />
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Voltar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
