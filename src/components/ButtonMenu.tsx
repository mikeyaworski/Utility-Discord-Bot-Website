import React from 'react';
import { Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';

interface MenuItem {
  icon?: typeof MoreHorizIcon,
  iconColor?: React.ComponentProps<typeof MoreHorizIcon>['color'],
  label: string,
  onClick: () => void,
}

interface DividerItem {
  divider: true,
}

interface Props {
  icon?: typeof MoreHorizIcon,
  iconSize?: number,
  items: (MenuItem | DividerItem)[],
  disabled?: boolean,
}

const ButtonMenu: React.FC<Props> = ({ icon: Icon = MoreHorizIcon, iconSize = 20, disabled, items }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        disabled={disabled}
      >
        <Icon sx={{ width: iconSize, height: iconSize }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 11,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {items.map(item => ('divider' in item ? (
          <Divider />
        ) : (
          <MenuItem key={item.label} onClick={item.onClick}>
            {item.icon && <item.icon fontSize="small" color={item.iconColor} sx={{ mr: 1.5 }} />} {item.label}
          </MenuItem>
        )))}
      </Menu>
    </>
  );
};

export default ButtonMenu;
