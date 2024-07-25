import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Typography } from '@mui/material';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { MovieListFromServer } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';
import { GuildContext } from 'contexts/guild';

interface Props extends BaseModalProps {
  list: MovieListFromServer,
}

const EditListModal: React.FC<Props> = ({
  list,
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const [name, setName] = useState<string>(list.name);
  const [customId, setCustomId] = useState<string>(list.custom_id || '');

  useEffect(() => {
    setName(list.name);
    setCustomId(list.custom_id || '');
  }, [list]);

  const mutation = useMutation({
    mutationFn: () => {
      return fetchApi<MovieListFromServer>({
        method: 'PATCH',
        path: `/movies/${selectedGuildId}/lists/${list.id}`,
        body: JSON.stringify({
          name,
          customId,
        }),
      });
    },
    onSuccess: newList => {
      queryClient.setQueryData<MovieListFromServer[]>(
        ['movie-lists', selectedGuildId],
        old => old?.map(l => (l.id === newList.id ? {
          ...l,
          name: newList.name,
          custom_id: newList.custom_id,
        } : l)),
      );
      onConfirm();
      alert.success('List info updated');
    },
    onError: err => {
      alertError(err);
    },
  });

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => mutation.mutate()}
      confirmText="Save"
      canConfirm={Boolean(name)}
      busy={mutation.isPending}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Edit List</Typography>
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

export default EditListModal;
