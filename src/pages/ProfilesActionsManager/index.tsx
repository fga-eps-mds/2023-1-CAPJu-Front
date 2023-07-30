import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Table,
  Tr,
  Td,
  Thead,
  Tbody,
  Text,
  Checkbox,
  useToast,
  Button,
  Flex,
} from "@chakra-ui/react";

import { PrivateLayout } from "layouts/Private";
import { actionsForm } from "utils/permissions";
import { updateRoleAllowedActions, getAllRoles } from "services/role";
import { useLoading } from "hooks/useLoading";

function ProfilesActionsManager() {
  const { handleLoading } = useLoading();
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    data: rolesData,
    isFetched: isRolesFetched,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await getAllRoles();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    onError: () => {
      toast({
        id: "roles-error",
        title: "Erro ao carregar perfis",
        description:
          "Houve um erro ao carregar perfis, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const currentAllowedActions = useMemo<{
    [key: string]: string[];
  }>(() => {
    const value = {} as {
      [key: string]: string[];
    };

    rolesData?.value.forEach((role) => {
      value[role.idRole] = role.allowedActions;
    });

    return value;
  }, [rolesData, isRolesFetched]);
  const [formValues, setFormValues] = useState<{
    [key: string]: string[];
  }>(currentAllowedActions);

  useEffect(() => {
    setFormValues(currentAllowedActions);
  }, [currentAllowedActions]);

  async function handleUpdateRolesAllowedActions() {
    try {
      rolesData?.value?.forEach(async (role) => {
        const formValuesForRole = formValues[role.idRole];
        const allowedActionsForRole = currentAllowedActions[role.idRole];

        if (
          new Set(formValuesForRole).size ===
          new Set(allowedActionsForRole).size
        )
          return;

        handleLoading(true);

        const res = await updateRoleAllowedActions({
          idRole: role.idRole,
          allowedActions: formValuesForRole,
        });

        if (res.type === "error") throw new Error(res.error.message);
      });

      handleLoading(false);

      toast({
        id: "update-actions-success",
        title: "Sucesso!",
        description: "A lista de permissões foi atualizada.",
        status: "success",
      });
    } catch (err: any) {
      handleLoading(false);
      toast({
        id: "update-actions-error",
        title: "Erro ao atualizar permissões",
        description: err?.message,
        status: "error",
        isClosable: true,
      });
    }

    refetchRoles();
  }

  const SaveButton = (
    <Button
      isDisabled={formValues === currentAllowedActions}
      onClick={() => {
        handleUpdateRolesAllowedActions();
        queryClient.invalidateQueries({ queryKey: "user-data" });
      }}
      colorScheme="green"
      size="xs"
      fontSize="sm"
      ml="auto"
    >
      Salvar
    </Button>
  );

  return (
    <PrivateLayout>
      <Flex flexDir="column" gap="5" width="90%" maxWidth={1120} mb="10">
        {SaveButton}
        <Table bgColor="white" w="100%" borderRadius="4">
          <Thead>
            <Tr>
              <Td>
                <Text fontSize="sm">Ações</Text>
              </Td>
              {rolesData?.value.map((role) => {
                return (
                  <Td key={role.name}>
                    <Text fontSize="sm">{role.name}</Text>
                  </Td>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {actionsForm.map((action) => {
              return (
                <Tr key={action.label}>
                  <Td>
                    <Text fontSize="xs">{action.label}</Text>
                  </Td>
                  {rolesData?.value.map((role) => {
                    const roleFormValues = formValues[role.idRole] || [];

                    return (
                      <Td key={`${action.label}-${role.name}`}>
                        <Checkbox
                          size="sm"
                          colorScheme="green"
                          isChecked={roleFormValues.some(
                            (i) => i === action.value
                          )}
                          onChange={({ target }) => {
                            if (!target.checked) {
                              setFormValues({
                                ...formValues,
                                [role.idRole]: roleFormValues.filter(
                                  (i) => i !== action.value
                                ),
                              });
                            } else {
                              setFormValues({
                                ...formValues,
                                [role.idRole]: [
                                  ...roleFormValues,
                                  action.value,
                                ],
                              });
                            }
                          }}
                        />
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {SaveButton}
      </Flex>
    </PrivateLayout>
  );
}

export default ProfilesActionsManager;
