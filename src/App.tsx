import { ChakraProvider } from "@chakra-ui/react";

import { AuthProvider } from "hooks/useAuth";
import { LoadingProvider } from "hooks/useLoading";
import { Router } from "routes";
import { theme } from "styles/theme";

function App() {
  return (
    <ChakraProvider
      theme={theme}
      toastOptions={{
        defaultOptions: {
          position: "top",
          duration: 1500,
          containerStyle: { marginTop: "28" },
        },
      }}
    >
      <LoadingProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </LoadingProvider>
    </ChakraProvider>
  );
}

export default App;
