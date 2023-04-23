import { ChakraProvider } from "@chakra-ui/react";

import { AuthProvider } from "hooks/useAuth";
import { LoadingProvider } from "hooks/useLoading";
import { Router } from "routes";
import { theme } from "styles/theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <LoadingProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </LoadingProvider>
    </ChakraProvider>
  );
}

export default App;
