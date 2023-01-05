import React from 'react';
import { DropdownItem } from 'reactstrap';

interface DropdownItemWithIconProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const DropdownItemWithIcon = ({
  icon,
  title,
  onClick,
  disabled,
}: DropdownItemWithIconProps) => {
  return (
    <DropdownItem
      style={{ display: 'flex', alignItems: 'center' }}
      onClick={onClick}
      disabled={disabled}
    >
      <div style={{ marginRight: 10 }}>{icon}</div>
      <div>{title}</div>
    </DropdownItem>
  );
};

export default DropdownItemWithIcon;
