import type { IdObject, MovieList, MovieListFromServer, MovieWithOrderOnly } from 'types';

import React, { useState, useEffect, useContext, useLayoutEffect, forwardRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import uniqBy from 'lodash.uniqby';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import { Virtualizer, CustomItemComponentProps } from 'virtua';
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

const ITEM_HEIGHT = 50;

const Item = ({
  id,
  isDragging,
  provided,
}: {
  id: string;
  isDragging: boolean;
  provided: DraggableProvided;
}) => {
  return (
    <div
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={{
        height: ITEM_HEIGHT,
        color: 'white',
        borderBottom: 'solid 1px #ccc',
        background: isDragging ? 'skyblue' : undefined,
        ...provided.draggableProps.style,
      }}
    >
      TODO: {id}
    </div>
  );
};

const ItemWithMinHeight = forwardRef<HTMLDivElement, CustomItemComponentProps>(
  ({ children, style }, ref) => {
    return (
      <div ref={ref} style={{ ...style, minHeight: ITEM_HEIGHT }}>
        {children}
      </div>
    );
  },
);

// TODO: Just use forwardRef for this
/* eslint-disable max-len */
// const VirtualList = forwardRef<HTMLElement, { children: React.ReactElement[], isUsingPlaceholder: boolean }>(({
const VirtualList = (({
  innerRef,
  children,
  isUsingPlaceholder,
  ...droppableProps
}: {
  children: React.ReactElement[];
  isUsingPlaceholder: boolean,
  innerRef: DroppableProvided['innerRef'];
}) => {
  // https://github.com/inokawa/virtua/blob/0ff7834c4f7891a0f2fe9223b6ae6a2426f87505/stories/react/advanced/With%20react-beautiful-dnd.stories.tsx#L61-L77
  useLayoutEffect(() => {
    // Ignore ResizeObserver errors because ResizeObserver used in virtua can cause error on window
    // (https://github.com/inokawa/virtua#what-is-resizeobserver-loop-completed-with-undelivered-notifications-error)
    // and react-beautiful-dnd aborts dragging when it detects any errors on window.
    // (https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/setup-problem-detection-and-error-recovery.md#error-is-caught-by-window-error-listener)
    //
    // Set event listener here in this example because useLayoutEffect/componentDidMount will be called from children to parent usually.
    const onError = (e: ErrorEvent) => {
      if (e.message.includes('ResizeObserver')) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('error', onError);
    };
  }, []);

  console.log('isUsingPlaceholder', isUsingPlaceholder);

  return (
    <Box
      // ref={ref}
      ref={innerRef}
      // TODO: Use autosizer to get this height
      style={{
        overflowY: 'auto',
        // width: '100%',
        height: 600,
      }}
      {...droppableProps}
    >
      {/* <Virtualizer item={ItemWithMinHeight}>{children}</Virtualizer> */}
      {/* <Virtualizer count={children.length}> */}
      <Virtualizer count={isUsingPlaceholder ? children.length + 1 : children.length}>
        {index => children[index]}
      </Virtualizer>
    </Box>
  );
});
/* eslint-enable max-len */

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

  const [items, setItems] = useState(() => Array.from({ length: 1000 }, (_, i) => String(i + 1)));

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
                startIcon={<SaveIcon color={saveChangesMutation.isPending ? 'inherit' : 'primary'} />}
                sx={{ whiteSpace: 'nowrap', visibility: hasStateChanged ? 'visible' : 'hidden' }}
                onClick={() => saveChangesMutation.mutate()}
                disabled={saveChangesMutation.isPending}
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
              // overflow: 'auto',
            }}
            in={expanded}
          >
            {workingMovieList && workingMovieList.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId={`movie-list-${list.id}`}
                  mode="virtual"
                  renderClone={(provided, snapshot, rubric) => {
                    const movie = workingMovieList[rubric.source.index];
                    const fullMovie = moviesQuery.data.find(m => m.id === movie.id) || moviesQuery.data[0];
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
                    // return (
                    //   <Item
                    //     id={workingMovieList[rubric.source.index].id}
                    //     isDragging={snapshot.isDragging}
                    //     provided={provided}
                    //   />
                    // );
                  }}
                >
                  {(provided, snapshot) => {
                    return (
                      <VirtualList
                        innerRef={provided.innerRef}
                        isUsingPlaceholder={snapshot.isUsingPlaceholder}
                        {...provided.droppableProps}
                      >
                        {/* {items.map((id, i) => (
                          <Draggable key={id} draggableId={id} index={i}>
                            {provided => (
                              <Item id={id} isDragging={false} provided={provided} />
                            )}
                          </Draggable>
                        ))} */}
                        {workingMovieList.map((movie, index) => {
                          const fullMovie = moviesQuery.data.find(m => m.id === movie.id);
                          if (!fullMovie) {
                            return <MovieSkeleton key={movie.id} altBackground />;
                          }
                          return (
                            <Draggable key={movie.id} draggableId={movie.id} index={index} isDragDisabled={disabled}>
                              {(provided, snapshot) => (
                                <MovieCard
                                  provided={provided}
                                  altBackground
                                  movie={fullMovie}
                                  parentList={{
                                    list,
                                    onRemoveFromList: () => removeMovieFromList(movie.id),
                                  }}
                                />
                              )}
                            </Draggable>
                          );
                        })}
                      </VirtualList>
                    );
                    // return (
                    //   <Box
                    //     {...provided.droppableProps}
                    //     ref={provided.innerRef}
                    //     display="flex"
                    //     flexDirection="column"
                    //     gap={1}
                    //   >
                    //     {workingMovieList.map((movie, index) => {
                    //       const fullMovie = moviesQuery.data.find(m => m.id === movie.id);
                    //       if (!fullMovie) {
                    //         return <MovieSkeleton key={movie.id} altBackground />;
                    //       }
                    //       return (
                    //         <Draggable
                    //           key={movie.id}
                    //           draggableId={movie.id}
                    //           index={index}
                    //           isDragDisabled={disabled}
                    //         >
                    //           {(provided, snapshot) => {
                    //             return (
                    //               <MovieCard
                    //                 provided={provided}
                    //                 altBackground
                    //                 movie={fullMovie}
                    //                 parentList={{
                    //                   list,
                    //                   onRemoveFromList: () => removeMovieFromList(movie.id),
                    //                 }}
                    //               />
                    //             );
                    //           }}
                    //         </Draggable>
                    //       );
                    //     })}
                    //     {provided.placeholder}
                    //   </Box>
                    // );
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
