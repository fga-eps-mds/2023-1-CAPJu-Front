import { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "hooks/useAuth";
import { getAllowedTabPath } from "utils/permissions";
import { useQuery } from "react-query";

interface RequireAuthProps {
  children: JSX.Element;
  // eslint-disable-next-line react/require-default-props
  authorizedRoles?: number[];
}

/**
 * Um HOC que renderiza os componentes filhos apenas se
 * o usuário está logado
 *
 * Se não está logado redireciona para /login.
 *
 * Se está logado mas não tem acesso à página,
 * ele é redirecionado para "/".
 *
 * @example
 *   <RequireAuth authorizedRoles={["admin"]}>
 *     {children}
 *   </RequireAuth>;
 *
 * @param authorizedRoles As roles autorizadas a ver a página,
 *   se vem vazio todo mundo pode acessar.
 */

export function RequireAuth({ children, authorizedRoles }: RequireAuthProps) {
  const { validateAuthentication, getUserData } = useAuth();
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });
  const location = useLocation();

  const saveFrom = useMemo(() => ({ from: location }), [location]);

  useEffect(() => validateAuthentication(), []);

  // Sem authorizedRoles, todo mundo é autorizado
  if (!authorizedRoles) return children;

  // Se não é autorizado, é redirecionado para um aba em que seja
  if (
    userData?.value?.idRole &&
    !authorizedRoles.includes(userData?.value?.idRole)
  ) {
    const userAllowedTabPath = getAllowedTabPath(
      userData?.value?.allowedActions || []
    );

    return <Navigate to={userAllowedTabPath} state={saveFrom} replace />;
  }

  return children;
}
