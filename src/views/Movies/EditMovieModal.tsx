import React, { useCallback, useContext, useEffect, useState } from 'react';
import uniqBy from 'lodash.uniqby';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { GuildContext } from 'contexts/guild';
import HeartCheckbox from 'components/HeartCheckbox';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { Movie } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';

type MoviePatchFields = Pick<Movie,
'title'
| 'length'
| 'actors'
| 'director'
| 'genre'
| 'year'
| 'rating'
| 'language'
> & {
  isFavorite: Movie['is_favorite'],
  wasWatched: Movie['was_watched'],
  imdbRating: Movie['imdb_rating'],
  metacriticRating: Movie['metacritic_rating'],
  rottenTomatoesRating: Movie['rotten_tomatoes_rating'],
};

type MoviePatchTextFields = Pick<MoviePatchFields,
'title'
| 'actors'
| 'director'
| 'genre'
| 'rating'
| 'language'
>;

type MoviePatchBooleanFields = Pick<MoviePatchFields,
'isFavorite'
| 'wasWatched'
>;

type MoviePatchNumberFields = Pick<MoviePatchFields,
'length'
| 'imdbRating'
| 'metacriticRating'
| 'rottenTomatoesRating'
>;

interface Props extends BaseModalProps {
  movie: Movie,
}

const EditMovieModal: React.FC<Props> = ({
  movie,
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const alert = useAlert(store => store.actions);

  const getMovieInput = useCallback(() => ({
    title: movie.title,
    isFavorite: movie.is_favorite,
    wasWatched: movie.was_watched,
    length: movie.length, // in minutes
    actors: movie.actors, // comma-separated
    director: movie.director,
    genre: movie.genre, // comma-separated
    year: movie.year,
    imdbRating: movie.imdb_rating, // 0-100
    metacriticRating: movie.metacritic_rating, // 0-100
    rottenTomatoesRating: movie.rotten_tomatoes_rating, // 0-100
    rating: movie.rating,
    language: movie.language,
  }), [movie]);

  const [input, setInput] = useState<MoviePatchFields>(() => getMovieInput());
  useEffect(() => setInput(getMovieInput()), [getMovieInput, baseModalProps.open]);

  const mutation = useMutation({
    mutationFn: () => {
      return fetchApi<Movie>({
        method: 'PATCH',
        path: `/movies/${selectedGuildId}/${movie.id}`,
        body: JSON.stringify(input),
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
      alert.success('Movie updated');
    },
    onError: err => {
      alertError(err);
    },
  });

  const setInputField = useCallback(<T extends keyof MoviePatchFields>(key: T, value: MoviePatchFields[T]) => {
    setInput(old => ({
      ...old,
      [key]: value,
    }));
  }, []);
  const setTextInput = useCallback(<T extends keyof MoviePatchTextFields>(key: T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputField(key, e.target.value);
  }, [setInputField]);
  const setCheckedInput = useCallback(<T extends keyof MoviePatchBooleanFields>(key: T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputField(key, e.target.checked);
  }, [setInputField]);
  const setNumberInput = useCallback(<T extends keyof MoviePatchNumberFields>(key: T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputField(key, Number(e.target.value));
  }, [setInputField]);

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => mutation.mutate()}
      confirmText="Save"
      canConfirm={Boolean(input.title)}
      busy={mutation.isPending}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Movie</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Title"
          value={input.title}
          onChange={setTextInput('title')}
          autoFocus
        />
        <Box mt={-1}>
          <FormControlLabel control={<HeartCheckbox checked={input.isFavorite} onChange={setCheckedInput('isFavorite')} />} label="Favorite" />
          <FormControlLabel control={<Checkbox checked={input.wasWatched} onChange={setCheckedInput('wasWatched')} />} label="Watched" />
        </Box>
        <TextField
          label="Actors"
          placeholder="Comma-separated list"
          value={input.actors}
          onChange={setTextInput('actors')}
        />
        <TextField
          label="Directors"
          placeholder="Comma-separated list"
          value={input.director}
          onChange={setTextInput('director')}
        />
        <TextField
          label="IMDb Rating"
          placeholder="0-100"
          value={input.imdbRating}
          onChange={setNumberInput('imdbRating')}
          type="number"
          inputProps={{
            min: 0,
            max: 100,
          }}
        />
        <TextField
          label="Metacritic Rating"
          placeholder="0-100"
          value={input.metacriticRating}
          onChange={setNumberInput('metacriticRating')}
          type="number"
          inputProps={{
            min: 0,
            max: 100,
          }}
        />
        <TextField
          label="Rotten Tomatoes Rating"
          placeholder="0-100"
          value={input.rottenTomatoesRating}
          onChange={setNumberInput('rottenTomatoesRating')}
          type="number"
          inputProps={{
            min: 0,
            max: 100,
          }}
        />
        <TextField
          label="Length (mins)"
          placeholder="In minutes"
          value={input.length}
          onChange={setNumberInput('length')}
          type="number"
          inputProps={{
            min: 1,
          }}
        />
      </Box>
    </BaseModal>
  );
};

export default EditMovieModal;
