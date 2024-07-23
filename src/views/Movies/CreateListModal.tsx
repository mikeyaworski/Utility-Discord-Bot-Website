import React, { useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Typography } from '@mui/material';
import { GuildContext } from 'contexts/guild';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { MovieListFromServer } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';

const CreateListModal: React.FC<BaseModalProps> = ({
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      setBusy(true);
      return fetchApi<MovieListFromServer>({
        method: 'POST',
        path: `/movies/${selectedGuildId}/lists`,
        body: JSON.stringify({
          name,
          customId,
        }),
      });
    },
    onSuccess: newList => {
      queryClient.setQueryData<MovieListFromServer[]>(
        ['movie-lists', selectedGuildId],
        old => old?.concat(newList),
      );
      onConfirm();
      setBusy(false);
      setName('');
      setCustomId('');
      alert.success('List created');
    },
    onError: err => {
      alertError(err);
      setBusy(false);
    },
  });

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => mutation.mutate()}
      confirmText="Create"
      canConfirm={Boolean(name)}
      busy={busy}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Create List</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          variant="outlined"
          label="Name"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <TextField
          variant="outlined"
          label="Custom ID (optional)"
          placeholder="Identify a list more naturally"
          fullWidth
          value={customId}
          onChange={e => setCustomId(e.target.value)}
        />
      </Box>
    </BaseModal>
  );
};

export default CreateListModal;
