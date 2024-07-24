import React, { useContext, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardActions, CardContent, Checkbox, Collapse, FormControlLabel, Paper, TextField, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';
import { useSet } from 'hooks';
import { error } from 'logging';
import { GuildContext } from 'contexts/guild';
import { Movie, MovieListFromServer } from 'types';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { useFetchLists } from './utils';
import { WorkingMovieListsAtom } from './index';

interface Props extends Omit<BaseModalProps, 'onConfirm'> {
  movie: Movie,
  onConfirm: () => void,
}

const SaveMovieToListsModal: React.FC<Props> = ({
  movie,
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const setWorkingMoviesList = useSetAtom(WorkingMovieListsAtom);

  const [busy, setBusy] = useState(false);
  const [createListName, setCreateListName] = useState('');
  const [createListCustomId, setCreateListCustomId] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);

  const listsQuery = useFetchLists();
  const {
    data: listsSet,
    add: addToList,
    remove: removeFromList,
    setData: setListsSet,
  } = useSet(movie.lists.map(list => list.id));

  useEffect(() => {
    setListsSet(new Set(movie.lists.map(list => list.id)));
    setCreateListName('');
    setCreateListCustomId('');
    setIsCreatingNewList(false);
  }, [baseModalProps.open, movie.lists, setListsSet]);

  const createListMutation = useMutation({
    mutationFn: () => {
      setBusy(true);
      return fetchApi<MovieListFromServer>({
        method: 'POST',
        path: `/movies/${selectedGuildId}/lists`,
        body: JSON.stringify({
          name: createListName,
          customId: createListCustomId,
        }),
      });
    },
    onSuccess: newList => {
      queryClient.setQueryData<MovieListFromServer[]>(
        ['movie-lists', selectedGuildId],
        old => old?.concat(newList),
      );
      setIsCreatingNewList(false);
      setCreateListName('');
      setCreateListCustomId('');
      setBusy(false);
      alert.success('List created');
    },
    onError: err => {
      alertError(err);
      setBusy(false);
    },
  });

  const setMovieListsMutation = useMutation({
    mutationFn: async () => {
      setBusy(true);
      const newListIds = Array.from(listsSet);
      await fetchApi<Movie>({
        method: 'PUT',
        path: `/movies/${selectedGuildId}/${movie.imdb_id}/lists`,
        body: JSON.stringify(newListIds),
      });
      return newListIds;
    },
    onSuccess: async newListIds => {
      // Update working lists as well for convenience
      setWorkingMoviesList(old => {
        let newWorkingList = newListIds.reduce((acc, listId) => {
          if (acc[listId] && !acc[listId].some(m => m.id === movie.id)) {
            acc[listId] = [...acc[listId], { ...movie, order: acc[listId].length + 1 }];
          }
          return acc;
        }, { ...old });
        newWorkingList = Object.keys(newWorkingList).reduce((acc, listId) => {
          if (!newListIds.includes(listId)) {
            delete newWorkingList[listId];
          }
          return newWorkingList;
        }, { ...newWorkingList });
        return newWorkingList;
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['movie-lists', selectedGuildId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['movies', selectedGuildId],
        }),
      ]);
      setIsCreatingNewList(false);
      setCreateListName('');
      setCreateListCustomId('');
      setBusy(false);
      alert.success('Saved lists for movie');
    },
    onError: err => {
      alertError(err);
      setBusy(false);
    },
  });

  async function handleConfirm() {
    await setMovieListsMutation.mutateAsync().catch(error);
    onConfirm();
  }

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={handleConfirm}
      confirmText="Save"
      canConfirm
      busy={busy}
    >
      <Typography variant="h5">Save Movie To Lists</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Movie: {movie.title}</Typography>
      <Paper sx={{
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 300,
        px: 2,
        py: 1,
      }}
      >
        {listsQuery.data.map(list => (
          <FormControlLabel
            key={list.id}
            label={list.name}
            control={(
              <Checkbox
                size="small"
                checked={listsSet.has(list.id)}
                onChange={e => {
                  if (e.target.checked) addToList(list.id);
                  else removeFromList(list.id);
                }}
              />
            )}
          />
        ))}
      </Paper>
      <Button
        variant="text"
        startIcon={isCreatingNewList ? <RemoveIcon /> : <AddIcon />}
        onClick={() => setIsCreatingNewList(old => !old)}
        disabled={busy}
        sx={{ my: 1 }}
      >
        Create New List
      </Button>
      <Collapse in={isCreatingNewList}>
        <form onSubmit={e => {
          e.preventDefault();
          createListMutation.mutate();
        }}
        >
          <Card>
            <CardContent sx={{ pb: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={createListName}
                onChange={e => setCreateListName(e.target.value)}
                autoFocus
              />
              <TextField
                label="Custom ID (optional)"
                placeholder="Identify a list more naturally"
                fullWidth
                value={createListCustomId}
                onChange={e => setCreateListCustomId(e.target.value)}
              />
            </CardContent>
            <CardActions>
              <Button
                sx={{ ml: 'auto' }}
                type="submit"
                disabled={busy}
              >
                Create
              </Button>
            </CardActions>
          </Card>
        </form>
      </Collapse>
    </BaseModal>
  );
};

export default SaveMovieToListsModal;
