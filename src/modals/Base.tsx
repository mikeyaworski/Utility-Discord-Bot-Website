import React from 'react';
import { Button, Box, Modal, Divider } from '@mui/material';

const boxStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface Props {
  open: boolean,
  onClose: () => void,
  onConfirm: () => void,
  confirmText?: string,
  confirmColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
  confirmIcon?: React.ReactNode,
  busy?: boolean,
  children: React.ReactNode,
}

export type BaseModalProps = Omit<Props, 'children'>;

const BaseModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  confirmColor = 'primary',
  confirmText = 'Confirm',
  confirmIcon,
  busy = false,
  children,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={boxStyle}>
        {children}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            color={confirmColor}
            startIcon={confirmIcon}
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BaseModal;
