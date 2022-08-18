import React from 'react';
import { Button, Box, Modal, Divider } from '@mui/material';

interface Props {
  open: boolean,
  onClose: () => void,
  onConfirm: () => void,
  confirmText?: string,
  confirmColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
  confirmIcon?: React.ReactNode,
  busy?: boolean,
  canConfirm?: boolean,
  children: React.ReactNode,
  disableBackdropDismissal?: boolean,
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
  canConfirm = true,
  disableBackdropDismissal = false,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' || !disableBackdropDismissal) onClose();
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        maxHeight: '95vh',
        overflow: 'auto',
      }}
      >
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
            disabled={busy || !canConfirm}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BaseModal;
