import { Button, Tooltip } from "@chakra-ui/react";

interface ActionButtonProps {
  label: string;
  icon: JSX.Element;
  // eslint-disable-next-line no-unused-vars
  action: (actionProps?: {}) => void;
  disabled?: boolean;
}

export function ActionButton({
  label,
  icon,
  action,
  disabled = true,
}: ActionButtonProps) {
  return (
    <Tooltip label={label} fontSize="xs">
      <Button
        h="5"
        w="7"
        size="xs"
        variant="ghost"
        color="gray.600"
        onClick={action}
        isDisabled={disabled}
        aria-label={label}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}
