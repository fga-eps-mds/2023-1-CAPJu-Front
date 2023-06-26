import { useEffect, useMemo, useState } from "react";
import { Icon } from "@chakra-ui/icons";
import { MdPersonAddAlt1 } from "react-icons/md";
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
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";

import { addUnitAdmin } from "services/units";
import { getAcceptedUsers } from "services/user";
import { useLoading } from "hooks/useLoading";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields/Input";

interface AddAdminModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
}

export function AddAdminModal({ unit, isOpen, onClose }: AddAdminModalProps) {
  const [filter, setFilter] = useState("");
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { data, isFetched, refetch } = useQuery({
    queryKey: ["accepted-users", unit.idUnit],
    queryFn: async () => {
      const res = await getAcceptedUsers(filter);

      return res;
    },
  });
  const tableActions: TableAction[] = [
    {
      label: "Tornar Administrador da Unidade",
      icon: <Icon as={MdPersonAddAlt1} boxSize={4} />,
      action: async ({ cpf }: { cpf: string }) => {
        handleLoading(true);

        try {
          await addUnitAdmin({ idUnit: unit.idUnit, cpf });
          handleLoading(false);
          toast({
            id: "adm-addition-success",
            title: "Aministrador adicionado",
            description:
              "O usuário selecionado se tornou administrador da unidade.",
            status: "success",
            isClosable: true,
          });
          refetch();
        } catch {
          handleLoading(false);
          toast({
            id: "adm-addition-error",
            title: "Erro ao tornar usuário administrador",
            description: "Favor tentar novamente.",
            status: "error",
            isClosable: true,
          });
        }
      },
      actionName: "add-admin-in-unit",
      disabled: false,
    },
  ];
  const admins = useMemo<TableRow<User>[]>(() => {
    if (!isFetched || data?.type === "error" || !data?.value) return [];

    return (
      (data?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
          if (
            curr.idRole === 5 ||
            curr.idUnit !== unit.idUnit ||
            !curr.fullName.toLowerCase().includes(filter.toLowerCase())
          )
            return acc;

          return [
            ...acc,
            { ...curr, tableActions, actionsProps: { cpf: curr.cpf } },
          ];
        },
        []
      ) as TableRow<User>[]) || []
    );
  }, [data, isFetched, filter]);

  const tableColumnHelper = createColumnHelper<TableRow<User>>();
  const tableColumns = [
    tableColumnHelper.accessor("fullName", {
      cell: (info) => info.getValue(),
      header: "Usuários",
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
        <ModalHeader>Adicionar Administradores</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="3">
            Torne usuários administradores da unidade {unit?.name}.
          </Text>
          <Input
            placeholder="Pesquisar usuários"
            value={filter}
            onChange={({ target }) => setFilter(target.value)}
            variant="filled"
            mb="3"
            w="100%"
          />
          <DataTable
            data={admins}
            columns={tableColumns}
            isDataFetching={!isFetched}
            skeletonHeight="28"
            width="100%"
            size="sm"
            emptyTableMessage="Não foram encontrados usuários disponíveis para se tornarem administradores desta unidade."
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
