import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Link, LinkProps, Text } from "@chakra-ui/react";

export function HeaderLink({ href, ...props }: LinkProps) {
  const location = useLocation();
  const isCurrentPath = useMemo(
    () => href === location.pathname,
    [href, location.pathname]
  );

  return isCurrentPath ? (
    <Text fontWeight="bold" fontSize={["md", "lg"]} color="green.500">
      {props.children}
    </Text>
  ) : (
    <Link href={href} fontSize={["md", "lg"]} {...props} />
  );
}
