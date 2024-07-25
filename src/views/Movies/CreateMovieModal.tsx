import React, { useContext, useState } from 'react';
import uniqBy from 'lodash.uniqby';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { Movie } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';
import { GuildContext } from 'contexts/guild';
import HeartCheckbox from 'components/HeartCheckbox';
import { isImdbId } from './utils';

const CreateMovieModal: React.FC<BaseModalProps> = ({
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const [input, setInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [wasWatched, setWasWatched] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      return fetchApi<Movie>({
        method: 'POST',
        path: `/movies/${selectedGuildId}`,
        body: JSON.stringify({
          isFavorite,
          wasWatched,
          ...isImdbId(input) ? {
            imdbId: input,
          } : {
            title: input,
          },
        }),
      });
    },
    onSuccess: newMovie => {
      queryClient.setQueryData<Movie[]>(
        ['movies', selectedGuildId],
        // If the movie already exists, don't put it at the front
        old => uniqBy([newMovie, ...old!].reverse(), 'id').reverse(),
      );
      queryClient.invalidateQueries({ queryKey: ['movies', selectedGuildId] });
      onConfirm();
      setInput('');
      setIsFavorite(false);
      setWasWatched(false);
      alert.success('Movie created');
    },
    onError: err => {
      alertError(err);
    },
  });

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => mutation.mutate()}
      confirmText="Create"
      canConfirm={Boolean(input)}
      busy={mutation.isPending}
      allowFormSubmission
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Create Movie</Typography>
      <TextField
        variant="outlined"
        label="Movie title or IMDb ID"
        placeholder="IMDb ID is in the URL, e.g. tt8801880"
        fullWidth
        value={input}
        onChange={e => setInput(e.target.value)}
        autoFocus
        sx={{ mb: 2 }}
      />
      <FormControlLabel control={<HeartCheckbox checked={isFavorite} onChange={e => setIsFavorite(e.target.checked)} />} label="Favorite" />
      <FormControlLabel control={<Checkbox checked={wasWatched} onChange={e => setWasWatched(e.target.checked)} />} label="Watched" />
    </BaseModal>
  );
};

export default CreateMovieModal;
