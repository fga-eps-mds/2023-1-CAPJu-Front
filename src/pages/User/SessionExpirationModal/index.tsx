import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Progress,
} from '@chakra-ui/react';

interface SessionExpirationModalProps {
    isOpen: boolean;
    initialCountdown: number;
    onClose: () => void;
}

export const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({ isOpen, initialCountdown, onClose }) => {

    const [countdown, setCountdown] = useState(initialCountdown);

    useEffect(() => {
        if (!isOpen) return;

        setCountdown(initialCountdown);

        const interval = setInterval(() => {
            setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, initialCountdown]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Aviso expiração sessão</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text mb={4}>Sua sessão será encerrada em {countdown} segundos.</Text>
                    <Progress
                        height={[2, 2.5]}
                        background="gray.200"
                        colorScheme="green"
                        value={(countdown / initialCountdown) * 100} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
