import { Routes } from "react-router-dom";

import { PublicLayout } from "layouts/Public";

export function PublicRouter() {
  return (
    <PublicLayout>
      <Routes>{/* <Route path="*" element={<NotFound />} /> */}</Routes>
    </PublicLayout>
  );
}
