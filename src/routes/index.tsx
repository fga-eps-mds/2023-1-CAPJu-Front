import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";

import { PublicRoutes } from "routes/public";
import { PrivateRoutes } from "routes/private";
import { BaseLayout } from "layouts/Base";
import { PageSkeleton } from "components/PageSkeleton";
import { RequireAuth } from "components/RequireAuth";
import { useAuth } from "hooks/useAuth";

const createRoutes = (routes: MenuItem[]): RouteObject[] => {
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
      children: route?.children && createRoutes(route.children),
    } as RouteObject;

    return ret;
  });
};

export function Router() {
  const { isAuthenticated } = useAuth();
  const router = createBrowserRouter([
    {
      path: "/",
      element: <BaseLayout />,
      children: createRoutes(isAuthenticated ? PrivateRoutes : PublicRoutes),
    },
  ]);

  return <RouterProvider router={router} />;
}
