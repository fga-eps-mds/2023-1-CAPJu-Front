import { BrowserRouter } from "react-router-dom";

import { useAuth } from "hooks/useAuth";
import { PublicRouter } from "routes/public";
import { PrivateRouter } from "routes/private";

export function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {!isAuthenticated ? <PublicRouter /> : <PrivateRouter />}
    </BrowserRouter>
  );
}
