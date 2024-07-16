import React, { useCallback } from 'react';
import { create } from 'zustand';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';
import { IntentionalAny } from 'types';

type AlertFn = (message: string) => void;

enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface AlertStore {
  open: boolean,
  setOpen: (open: boolean) => void,
  type: AlertType,
  message: string,
  actions: {
    success: AlertFn;
    error: AlertFn;
    warning: AlertFn;
    info: AlertFn;
  },
}

export const useAlert = create<AlertStore>()(set => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  type: AlertType.SUCCESS,
  message: '',
  actions: {
    success: (message: string) => set({
      open: true,
      type: AlertType.SUCCESS,
      message,
    }),
    error: (message: string) => set({
      open: true,
      type: AlertType.ERROR,
      message,
    }),
    warning: (message: string) => set({
      open: true,
      type: AlertType.WARNING,
      message,
    }),
    info: (message: string) => set({
      open: true,
      type: AlertType.INFO,
      message,
    }),
  },
}));

interface Props {
  children: React.ReactNode,
}

export const AlertProvider: React.FC<Props> = ({ children }) => {
  const open = useAlert(store => store.open);
  const message = useAlert(store => store.message);
  const type = useAlert(store => store.type);
  const setOpen = useAlert(store => store.setOpen);

  const handleClose = useCallback((
    e: Event | React.SyntheticEvent<IntentionalAny, Event>,
    reason: SnackbarCloseReason,
  ) => {
    if (reason === 'timeout') setOpen(false);
  }, [setOpen]);

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={type} variant="filled">{message}</Alert>
      </Snackbar>
      {children}
    </>
  );
};
