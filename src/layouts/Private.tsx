import React, { ReactNode } from "react";
import { Flex } from '@chakra-ui/react';
import { useAuth } from 'hooks/useAuth';
import DataUpdateModal from 'components/DataUpdateModal';
import { handleVerifyInDefaultEmail } from 'utils/defaultEmails';
import { Tutorial } from 'components/Tutorial';

interface BaseLayoutProps {
  children?: ReactNode;
}

export function PrivateLayout({ children }: BaseLayoutProps) {
  const { user } = useAuth();

  const childrenWithStyle = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        style: { ...child.props.style, marginTop: '30px' }
      });
    }
    return child;
  });

  return (
    <Flex
      w="150%"
      flex="1"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      pb="8"

    >

      {childrenWithStyle}

      {user?.firstLogin &&
        user?.email &&
        handleVerifyInDefaultEmail(user.email) && (
          <DataUpdateModal user={user} />
        )}
      <Tutorial />
    </Flex>
  );
}
