import React, { useContext, useEffect, useState } from 'react';
import uniqBy from 'lodash.uniqby';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardActions, CardContent, Collapse, TextField, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { IdObject, Movie, MovieListFromServer, Option } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';
import { GuildContext } from 'contexts/guild';
import CheckboxesTags from 'components/CheckboxesTags';
import { isImdbId, useFetchMovies } from './utils';

interface Props extends Omit<BaseModalProps, 'onConfirm'> {
  list: MovieListFromServer,
  onConfirm: (newMovies: IdObject[]) => void,
}

const AddMoviesToListModal: React.FC<Props> = ({
  list,
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const [newMovies, setNewMovies] = useState<Option<string>[]>([]);
  const [createMovieInput, setCreateMovieInput] = useState('');
  const [isCreatingNewMovie, setIsCreatingNewMovie] = useState(false);

  const moviesQuery = useFetchMovies();

  useEffect(() => {
    setNewMovies([]);
    setCreateMovieInput('');
    setIsCreatingNewMovie(false);
  }, [baseModalProps.open]);

  const createMovieMutation = useMutation({
    mutationFn: () => {
      return fetchApi<Movie>({
        method: 'POST',
        path: `/movies/${selectedGuildId}`,
        body: JSON.stringify(isImdbId(createMovieInput) ? {
          imdbId: createMovieInput,
        } : {
          title: createMovieInput,
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
      setNewMovies(old => [{ label: newMovie.title, value: newMovie.id }, ...old]);
      setIsCreatingNewMovie(false);
      setCreateMovieInput('');
      alert.success('Movie created');
    },
    onError: err => {
      alertError(err);
    },
  });

  const movieOptions = moviesQuery.data
    .filter(movie => !new Set(list.movies.map(m => m.id)).has(movie.id))
    .map(movie => ({ label: movie.title, value: movie.id }));

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => onConfirm(newMovies.map(movie => ({ id: movie.value })))}
      confirmText="Save"
      canConfirm={newMovies.length > 0}
      busy={createMovieMutation.isPending}
    >
      <Typography variant="h5">Add Movies To List</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>List: {list.name}</Typography>
      <CheckboxesTags
        value={newMovies}
        setValue={setNewMovies}
        options={movieOptions}
        inputProps={{
          label: 'Movies',
        }}
      />
      <Button
        variant="text"
        startIcon={isCreatingNewMovie ? <RemoveIcon /> : <AddIcon />}
        onClick={() => setIsCreatingNewMovie(old => !old)}
        disabled={createMovieMutation.isPending}
        sx={{ my: 1 }}
      >
        Create New Movie
      </Button>
      <Collapse in={isCreatingNewMovie}>
        <form onSubmit={e => {
          e.preventDefault();
          createMovieMutation.mutate();
        }}
        >
          <Card>
            <CardContent sx={{ pb: 0 }}>
              <TextField
                variant="outlined"
                label="Movie title or IMDb ID"
                placeholder="IMDb ID is in the URL, e.g. tt8801880"
                fullWidth
                value={createMovieInput}
                onChange={e => setCreateMovieInput(e.target.value)}
              />
            </CardContent>
            <CardActions>
              <Button
                sx={{ ml: 'auto' }}
                type="submit"
                disabled={createMovieMutation.isPending}
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

export default AddMoviesToListModal;
