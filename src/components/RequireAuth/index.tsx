import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "hooks/useAuth";

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
  const { user } = useAuth();
  const location = useLocation();

  const saveFrom = useMemo(() => ({ from: location }), [location]);

  // // Sem authorizedRoles, todo mundo é autorizado
  if (!authorizedRoles) return children;

  // // Se não é autorizado, é redirecionado para "/"
  if (
    user?.idRole &&
    !authorizedRoles.includes(user?.idRole) &&
    user?.idRole !== 5
  )
    return <Navigate to="/" state={saveFrom} replace />;

  return children;
}
