import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { ModalsProvider } from "contexts/Modals";
import { AuthProvider } from "hooks/useAuth";
import { LoadingProvider } from "hooks/useLoading";
import { Router } from "routes";
import { theme } from "styles/theme";

function App() {
  const queryClient = new QueryClient();

  return (
    <ChakraProvider
      theme={theme}
      toastOptions={{
        defaultOptions: {
          position: "top-right",
          duration: 4000,
          isClosable: true,
        },
      }}
    >
      <ModalsProvider>
        <LoadingProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </QueryClientProvider>
        </LoadingProvider>
      </ModalsProvider>
    </ChakraProvider>
  );
}

export default App;
