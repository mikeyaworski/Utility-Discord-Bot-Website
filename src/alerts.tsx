import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';
import { IntentionalAny } from 'types';

type AlertFn = (message: string) => void;

export interface AlertContextType {
  success: AlertFn;
  error: AlertFn;
  warning: AlertFn;
  info: AlertFn;
}

export const AlertContext = createContext<AlertContextType>({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

interface Props {
  children: React.ReactNode,
}

export const AlertProvider: React.FC<Props> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(AlertType.SUCCESS);

  const handleOpen = useCallback((newMessage: string, newType: AlertType) => {
    setType(newType);
    setMessage(newMessage);
    setOpen(true);
  }, []);

  const handleClose = useCallback((
    e: Event | React.SyntheticEvent<IntentionalAny, Event>,
    reason: SnackbarCloseReason,
  ) => {
    if (reason === 'timeout') setOpen(false);
  }, []);

  const handleSuccess = useCallback((newMessage: string) => {
    handleOpen(newMessage, AlertType.SUCCESS);
  }, [handleOpen]);

  const handleError = useCallback((newMessage: string) => {
    handleOpen(newMessage, AlertType.ERROR);
  }, [handleOpen]);

  const handleWarning = useCallback((newMessage: string) => {
    handleOpen(newMessage, AlertType.WARNING);
  }, [handleOpen]);

  const handleInfo = useCallback((newMessage: string) => {
    handleOpen(newMessage, AlertType.INFO);
  }, [handleOpen]);

  const value = useMemo(() => ({
    success: handleSuccess,
    error: handleError,
    warning: handleWarning,
    info: handleInfo,
  }), [
    handleSuccess,
    handleError,
    handleWarning,
    handleInfo,
  ]);

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
      <AlertContext.Provider value={value}>
        {children}
      </AlertContext.Provider>
    </>
  );
};

export function useAlert(): AlertContextType {
  const alertContext = useContext(AlertContext);
  return alertContext;
}
