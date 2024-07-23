import type { IdObject, MovieList, MovieListFromServer, MovieWithOrderOnly } from 'types';

import React, { useState, useEffect, useContext } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import uniqBy from 'lodash.uniqby';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Collapse,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchApi, reorder, alertError } from 'utils';
import { useAlert } from 'alerts';
import { GuildContext } from 'contexts/guild';
import { useConfirmationModal } from 'hooks';
import ButtonMenu from 'components/ButtonMenu';
import { error } from 'logging';
import MovieCard from './Movie';
import MovieSkeleton from './MovieSkeleton';
import EditListModal from './EditListModal';
import AddMoviesToListModal from './AddMoviesToListModal';
import { WorkingMovieListsAtom } from './index';
import { orderMovies, useFetchMovies } from './utils';

interface Props {
  list: MovieListFromServer,
  disabled?: boolean,
}

// Strictly for movies within lists to check that the order of the list hasn't changed
function getIsMovieDifferent(movie1: MovieWithOrderOnly, movie2: MovieWithOrderOnly | undefined): boolean {
  if (!movie2) return false;
  return movie1.id !== movie2.id || movie1.order !== movie2.order;
}

function getAreMoviesDifferent(movies1: MovieWithOrderOnly[], movies2: MovieWithOrderOnly[]): boolean {
  return movies1.length !== movies2.length || Boolean(movies1.some((movie, i) => getIsMovieDifferent(movie, movies2[i])));
}

const List: React.FC<Props> = ({
  list,
  disabled,
}) => {
  const queryClient = useQueryClient();
  const { selectedGuildId } = useContext(GuildContext);
  const alert = useAlert(store => store.actions);
  const moviesQuery = useFetchMovies();
  const setWorkingMovieList = useSetAtom(WorkingMovieListsAtom);
  const workingMovieList = useAtomValue(WorkingMovieListsAtom)[list.id] || list.movies;
  const hasStateChanged = getAreMoviesDifferent(workingMovieList, list.movies);

  const [expanded, setExpanded] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMoviesModalOpen, setAddMoviesModalOpen] = useState(false);
  const { node: confirmDeleteListModal, open: openConfirmDeleteListModal } = useConfirmationModal({
    confirmText: 'Delete List',
    confirmColor: 'error',
  });

  const saveChangesMutation = useMutation({
    mutationFn: async () => {
      await fetchApi<MovieList>({
        method: 'PUT',
        path: `/movies/${selectedGuildId}/lists/${list.id}/items`,
        body: JSON.stringify(workingMovieList.map(movie => ({ movieId: movie.id, order: movie.order }))),
      });
    },
    onSuccess: async () => {
      const newList = await fetchApi<MovieList>({
        method: 'GET',
        path: `/movies/${selectedGuildId}/lists/${list.id}`,
      });
      newList.movies?.sort(orderMovies);
      queryClient.setQueryData<MovieList[]>(['movie-lists', selectedGuildId], old => old?.map(l => (l.id === newList.id ? newList : l)));
      queryClient.invalidateQueries({ queryKey: ['movies', selectedGuildId] });
      alert.success('List changes saved');
    },
    onError: err => {
      alertError(err);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async () => {
      await fetchApi<MovieList>({
        method: 'DELETE',
        path: `/movies/${selectedGuildId}/lists/${list.id}`,
      });
    },
    onSuccess: () => {
      alert.success('List deleted');
      queryClient.setQueryData<MovieList[]>(['movie-lists', selectedGuildId], old => old?.filter(l => (l.id !== list.id)));
    },
    onError: err => {
      alertError(err);
    },
  });

  useEffect(() => {
    function warnUnsavedChanges(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = 'Unsaved changes';
    }
    if (hasStateChanged) {
      window.addEventListener('beforeunload', warnUnsavedChanges);
      return () => {
        window.removeEventListener('beforeunload', warnUnsavedChanges);
      };
    }
    return () => {};
  }, [hasStateChanged]);

  const onDragEnd: OnDragEndResponder = async result => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    setWorkingMovieList(old => ({
      ...old,
      [list.id]: reorder(old[list.id] || list.movies, source.index, destination.index).map((movie, i) => ({ ...movie, order: i })),
    }));
  };

  function removeMovieFromList(movieId: string): void {
    setWorkingMovieList(old => ({
      ...old,
      [list.id]: (old[list.id] || list.movies).filter(movie => movie.id !== movieId),
    }));
  }

  async function deleteList() {
    await deleteListMutation.mutateAsync().catch(error);
  }

  function addNewMoviesToList(newMovies: IdObject[]) {
    setWorkingMovieList(old => {
      const oldMovies = old[list.id] || list.movies;
      return {
        ...old,
        [list.id]: uniqBy(oldMovies.concat(newMovies.map((newMovie, i) => ({ ...newMovie, order: oldMovies.length + i + 1 }))), 'id'),
      };
    });
    setAddMoviesModalOpen(false);
  }

  return (
    <>
      <AddMoviesToListModal
        open={addMoviesModalOpen}
        onClose={() => setAddMoviesModalOpen(false)}
        list={{ ...list, movies: workingMovieList }}
        onConfirm={addNewMoviesToList}
      />
      <EditListModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={() => setEditModalOpen(false)}
        list={list}
      />
      {confirmDeleteListModal}
      <Box display="flex" flexDirection="column" width={380}>
        <Paper sx={{ width: '100%', px: 3, py: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflowWrap: 'anywhere' }}>
          <Box display="flex" justifyContent="space-between" sx={{ overflowWrap: 'anywhere' }}>
            <Typography variant="h6">{list.name}</Typography>
            <Box display="flex" gap={1} alignItems="flex-start">
              <Button
                size="small"
                startIcon={<SaveIcon color="primary" />}
                sx={{ whiteSpace: 'nowrap', visibility: hasStateChanged ? 'visible' : 'hidden' }}
                onClick={() => saveChangesMutation.mutate()}
                disabled={!hasStateChanged}
              >
                Save
              </Button>
              <ButtonMenu items={[
                {
                  label: 'Add Movies',
                  icon: AddIcon,
                  iconColor: 'primary',
                  onClick: () => setAddMoviesModalOpen(true),
                },
                {
                  label: 'Edit List Info',
                  icon: EditIcon,
                  onClick: () => setEditModalOpen(true),
                },
                {
                  label: 'Delete List',
                  icon: DeleteIcon,
                  iconColor: 'error',
                  onClick: () => openConfirmDeleteListModal({
                    title: `Delete list ${list.name}?`,
                    details: 'This will not delete movies from the database.',
                    onConfirm: deleteList,
                  }),
                },
              ]}
              />
            </Box>
          </Box>
          <Typography variant="caption">ID: {list.custom_id || list.id}</Typography>
          <Collapse
            sx={{
              mt: 1,
              mr: -2,
              pr: 2,
              maxHeight: 'calc(max(60vh, 330px))',
              overflow: 'auto',
            }}
            in={expanded}
          >
            {workingMovieList && workingMovieList.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={`movie-list-${list.id}`}>
                  {provided => {
                    return (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        display="flex"
                        flexDirection="column"
                        gap={1}
                      >
                        {workingMovieList.map((movie, index) => {
                          const fullMovie = moviesQuery.data.find(m => m.id === movie.id);
                          if (!fullMovie) {
                            return <MovieSkeleton key={movie.id} altBackground />;
                          }
                          return (
                            <Draggable
                              key={movie.id}
                              draggableId={movie.id}
                              index={index}
                              isDragDisabled={disabled}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <MovieCard
                                    provided={provided}
                                    altBackground
                                    movie={fullMovie}
                                    parentList={{
                                      list,
                                      onRemoveFromList: () => removeMovieFromList(movie.id),
                                    }}
                                  />
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Box>
                    );
                  }}
                </Droppable>
              </DragDropContext>
            ) : (
              <Typography variant="body1">There are no movies in this list.</Typography>
            )}
          </Collapse>
        </Paper>
        <Button
          variant="contained"
          color="inherit"
          sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          onClick={() => setExpanded(old => !old)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
      </Box>
    </>
  );
};

export default List;
