import { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "hooks/useAuth";
import { roles } from "utils/roles";
import { getAllowedTabPath } from "utils/permissions";

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
  const { user, validateAuthentication, handleLogout } = useAuth();
  const location = useLocation();

  const saveFrom = useMemo(() => ({ from: location }), [location]);

  useEffect(() => validateAuthentication(), []);

  // Sem authorizedRoles, todo mundo é autorizado
  if (!authorizedRoles) return children;

  // Para estar logado role precisa ser válida
  if (!roles.some((role) => role.idRole === user?.idRole)) {
    window.location.reload();
    handleLogout();
    return children;
  }

  // Se não é autorizado, é redirecionado para um aba em que seja
  if (user?.idRole && !authorizedRoles.includes(user?.idRole)) {
    const userAllowedTabPath = getAllowedTabPath(user.idRole);

    return <Navigate to={userAllowedTabPath} state={saveFrom} replace />;
  }

  return children;
}
