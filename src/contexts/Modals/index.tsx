/* eslint-disable no-unused-vars */
import { createContext, useState, useContext, ReactNode, useMemo } from "react";
import { useDisclosure } from "@chakra-ui/react";

type ModalsContextType = {
  isModalOpen: (modalId: string) => boolean;
  handleModalOpen: (modalId: string) => void;
  handleModalClose: () => void;
};

const ModalsContext = createContext({} as ModalsContextType);

export const ModalsProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isModalOpen = (modalId: string) => {
    return isOpen && modalId === modal;
  };

  const handleModalOpen = (modalId: string) => {
    onOpen();
    setModal(modalId);
  };

  const handleModalClose = () => {
    onClose();
    setModal(null);
  };

  const contextValue = useMemo(
    () => ({
      isModalOpen,
      handleModalOpen,
      handleModalClose,
    }),
    [isModalOpen, handleModalOpen, handleModalClose]
  );

  return (
    <ModalsContext.Provider value={contextValue}>
      {children}
    </ModalsContext.Provider>
  );
};

export function useModals() {
  const context = useContext(ModalsContext);

  return context;
}
