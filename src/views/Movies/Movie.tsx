import type { Movie, MovieListMinimal } from 'types';

import React, { CSSProperties, useContext, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  Typography,
  Link,
  Button,
  Collapse,
  List,
  ListItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckBox as CheckedIcon,
  CheckBoxOutlineBlank as UncheckedIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChatBubble as ChatBubbleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { alertError, fetchApi, filterOutFalsy, humanizeDuration } from 'utils';
import { useConfirmationModal, useGetMemberName } from 'hooks';
import { useAlert } from 'alerts';
import { error } from 'logging';
import ButtonMenu from 'components/ButtonMenu';
import Mention from 'components/Mention';
import { GuildContext } from 'contexts/guild';
import NoteModal from './NoteModal';
import EditMovieModal from './EditMovieModal';
import SaveMovieToListsModal from './SaveMovieToListsModal';

interface MovieCardProps {
  movie: Movie,
  parentList?: {
    list: MovieListMinimal,
    onRemoveFromList: () => void,
  },
  altBackground: boolean,
  provided?: DraggableProvided,
}

type FieldProps = {
  label: string,
  width?: CSSProperties['width'],
} & ({
  value?: React.ReactNode,
  shouldList?: undefined | false,
} | {
  value: string,
  shouldList: true,
})

interface RowProps {
  children: React.ReactNode | React.ReactNode[],
}

export const Row: React.FC<RowProps> = ({ children }) => {
  return (
    <Box display="flex" flexDirection="row" gap={1}>
      {children}
    </Box>
  );
};

export const Field: React.FC<FieldProps> = ({ label, value, shouldList = false, width }) => {
  return (
    <Box width={width}>
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
      {shouldList && value && typeof value === 'string' ? (
        <List sx={{ listStyleType: 'disc', pl: 2, py: 0 }}>
          {value.split(/,\s*/g).map(item => (
            <ListItem key={item} sx={{ display: 'list-item', p: 0 }}>
              <Typography variant="body2" fontWeight={400}>
                {item}
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : typeof value === 'boolean' ? (
        value ? (
          label === 'Favorite' ? <FavoriteIcon color="primary" /> : <CheckedIcon color="primary" />
        ) : (
          label === 'Favorite' ? <FavoriteBorderIcon /> : <UncheckedIcon />
        )
      ) : value == null || typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" fontWeight={400}>
          {value == null ? '-' : value}
        </Typography>
      ) : value}
    </Box>
  );
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, parentList, altBackground, provided }) => {
  const theme = useTheme();
  const alert = useAlert(store => store.actions);
  const queryClient = useQueryClient();
  const { selectedGuildId } = useContext(GuildContext);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saveToListsOpen, setSaveToListsModalOpen] = useState(false);
  const getMemberName = useGetMemberName();
  const { node: confirmDeleteMovieModal, open: openConfirmDeleteMovieModal } = useConfirmationModal({
    confirmText: 'Delete Movie',
    confirmColor: 'error',
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await fetchApi({
        method: 'DELETE',
        path: `/movies/${selectedGuildId}/${movie.imdb_id}`,
      });
    },
    onSuccess: () => {
      alert.success('Movie was deleted');
      // A movie cannot be deleted while it is in a list, so no need to remove it from movie-lists query data
      queryClient.setQueryData<Movie[]>(['movies', selectedGuildId], old => old?.filter(m => m.id !== movie.id));
    },
    onError: err => {
      alertError(err);
    },
  });

  return (
    <Box
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      style={provided?.draggableProps.style}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onConfirm={() => setNoteModalOpen(false)}
        movie={movie}
      />
      {!parentList && confirmDeleteMovieModal}
      <EditMovieModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={() => setEditModalOpen(false)}
        movie={movie}
      />
      <SaveMovieToListsModal
        open={saveToListsOpen}
        onClose={() => setSaveToListsModalOpen(false)}
        onConfirm={() => setSaveToListsModalOpen(false)}
        movie={movie}
      />
      <Card sx={{ width: '100%', background: altBackground ? theme.palette.altBackground.main : undefined, flexGrow: 1 }}>
        <CardHeader
          title={(
            <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body1" fontWeight={500}>
                <Link href={`https://imdb.com/title/${movie.imdb_id}`} target="_blank">
                  {movie.title}
                  {movie.year && ` (${movie.year})`}
                </Link>
              </Typography>
              <ButtonMenu items={filterOutFalsy([
                {
                  label: 'Save To Lists',
                  icon: AddIcon,
                  iconColor: 'primary',
                  onClick: () => setSaveToListsModalOpen(true),
                },
                {
                  icon: ChatBubbleIcon,
                  label: 'Set Note',
                  onClick: () => {
                    setNoteModalOpen(true);
                  },
                },
                {
                  icon: EditIcon,
                  label: 'Edit',
                  onClick: () => setEditModalOpen(true),
                },
                !parentList && {
                  icon: DeleteIcon,
                  iconColor: 'error',
                  label: 'Delete',
                  onClick: () => {
                    openConfirmDeleteMovieModal({
                      title: 'Delete Movie',
                      details: [
                        `Are you sure you want to delete movie "${movie.title}"?`,
                        'This process will fail if the movie belongs to any list.',
                      ].join('\n'),
                      onConfirm: async () => {
                        await deleteMutation.mutateAsync().catch(error);
                      },
                    });
                  },
                },
                parentList && {
                  icon: DeleteIcon,
                  iconColor: 'error',
                  label: 'Remove From List',
                  onClick: () => {
                    parentList.onRemoveFromList();
                  },
                },
              ])}
              />
            </Box>
          )}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Row>
            <Field label="Actors" value={movie.actors || '-'} shouldList={Boolean(movie.actors)} width="50%" />
            <Field label="Directors" value={movie.director || '-'} shouldList={Boolean(movie.director)} width="50%" />
          </Row>
          <Row>
            <Field label="Length" value={movie.length ? `${humanizeDuration(movie.length * 60 * 1000)}` : '-'} width="40%" />
            <Field label="Favorite" value={movie.is_favorite} width="30%" />
            <Field label="Watched" value={movie.was_watched} width="30%" />
          </Row>
          <Field label="Ratings" value="" />
          <Row>
            <Field label="IMDb" value={movie.imdb_rating} width="25%" />
            <Field label="Rotten Tomatoes" value={movie.rotten_tomatoes_rating} width="50%" />
            <Field label="Metacritic" value={movie.metacritic_rating} width="25%" />
          </Row>
          <Collapse in={notesExpanded && Boolean(movie.notes?.length)}>
            <Field label="Notes" value="" />
            <Box display="flex" flexDirection="column" gap={0.5}>
              {movie.notes?.map(note => (
                <Typography key={note.author_id} variant="body2">
                  <Mention value={`@${getMemberName(note.author_id)?.name || note.author_id}`} />: {note.note}
                </Typography>
              ))}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      {movie.notes && movie.notes.length > 0 && (
        <Button
          variant="contained"
          color="inherit"
          sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          onClick={() => setNotesExpanded(old => !old)}
        >
          {notesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          {notesExpanded ? 'Hide ' : 'Show '}
          Notes ({movie.notes?.length})
        </Button>
      )}
    </Box>
  );
};

export default MovieCard;
