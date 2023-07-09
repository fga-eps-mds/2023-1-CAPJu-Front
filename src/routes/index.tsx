import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";

import { PublicRoutes } from "routes/public";
import { PrivateRoutes } from "routes/private";
import { BaseLayout } from "layouts/Base";
import { PageSkeleton } from "components/PageSkeleton";
import { RequireAuth } from "components/RequireAuth";
import { useAuth } from "hooks/useAuth";
import { getAllRoles } from "services/user";
import { useQuery } from "react-query";

const getRoutesWithAuthorizedRoles = (
  routes: MenuItem[],
  roles: Role[]
): (MenuItem & { authorizedRoles: number[] })[] => {
  return routes.reduce((accRoutes: MenuItem[], currRoute: MenuItem) => {
    const authorizedRoles = roles.reduce(
      (accRoles: number[], currRole: Role) => {
        if (
          currRole.allowedActions.some((i) => i === currRoute.actionName) ||
          !currRoute.actionName
        )
          return [...accRoles, currRole.idRole];

        return accRoles;
      },
      []
    );

    return [
      ...accRoutes,
      {
        ...currRoute,
        authorizedRoles,
      },
    ];
  }, []) as (MenuItem & { authorizedRoles: number[] })[];
};

const createRoutes = (
  routes: (MenuItem & { authorizedRoles: number[] })[]
): RouteObject[] => {
  if (!routes) return [];

  return routes.map((route) => {
    const ret = {
      ...route,
      index: route.index || !route?.path,
      ...(route?.element && {
        element: (
          <RequireAuth authorizedRoles={route?.authorizedRoles}>
            <Suspense fallback={<PageSkeleton />}>{route.element}</Suspense>
          </RequireAuth>
        ),
      }),
      children:
        route?.children &&
        createRoutes(
          route.children as (MenuItem & { authorizedRoles: number[] })[]
        ),
    } as RouteObject;

    return ret;
  });
};

export function Router() {
  const { isAuthenticated } = useAuth();
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const router = createBrowserRouter([
    {
      path: "/",
      element: <BaseLayout />,
      children: createRoutes(
        isAuthenticated
          ? getRoutesWithAuthorizedRoles(PrivateRoutes, rolesData?.value || [])
          : (PublicRoutes as (MenuItem & { authorizedRoles: number[] })[])
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}
