import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, Typography } from '@mui/material';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { Movie, MovieNote } from 'types';
import { alertError, fetchApi } from 'utils';
import { useAlert } from 'alerts';
import { GuildContext } from 'contexts/guild';
import { useMyMovieNote } from './utils';

enum NoteChangeStatus {
  SET,
  DELETED,
}

type Props = BaseModalProps & {
  movie: Movie,
}

const NoteModal: React.FC<Props> = ({
  movie,
  onConfirm,
  ...baseModalProps
}) => {
  const alert = useAlert(store => store.actions);
  const [busy, setBusy] = useState(false);
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  const existingNote = useMyMovieNote(movie);
  const [input, setInput] = useState(existingNote?.note || '');
  useEffect(() => {
    setInput(existingNote?.note || '');
  }, [existingNote, baseModalProps.open]);
  const isDeleting = existingNote && input === '';

  const mutation = useMutation({
    mutationFn: async () => {
      setBusy(true);
      if (input) {
        const newNote = await fetchApi<MovieNote>({
          method: 'PUT',
          path: `/movies/${selectedGuildId}/${movie.imdb_id}/notes`,
          body: JSON.stringify({
            note: input,
          }),
        });
        // Optimistically update the state
        // queryClient.setQueryData<Movie[]>(
        //   ['movies', selectedGuildId],
        //   old => old?.map(m => (m.id === movie.id ? ({
        //     ...m,
        //     notes: m.notes?.find(n => n.author_id === user?.id)
        //       ? m.notes?.map(note => (note.author_id === user?.id ? newNote : note))
        //       : m.notes?.concat(newNote) || [newNote],
        //   }) : m)),
        // );
        await queryClient.invalidateQueries({ queryKey: ['movies', selectedGuildId] });
        return NoteChangeStatus.SET;
      }
      await fetchApi({
        method: 'DELETE',
        path: `/movies/${selectedGuildId}/${movie.imdb_id}/notes`,
      });
      // Optimistically update the state
      // queryClient.setQueryData<Movie[]>(
      //   ['movies', selectedGuildId],
      //   old => old?.map(m => (m.id === movie.id ? ({
      //     ...m,
      //     notes: m.notes?.filter(note => note.author_id !== user?.id),
      //   }) : m)),
      // );
      await queryClient.invalidateQueries({ queryKey: ['movies', selectedGuildId] });
      return NoteChangeStatus.DELETED;
    },
    onSuccess: changeStatus => {
      onConfirm();
      setBusy(false);
      switch (changeStatus) {
        case NoteChangeStatus.SET: {
          alert.success('Note saved');
          break;
        }
        case NoteChangeStatus.DELETED: {
          alert.success('Note deleted');
          break;
        }
        default: break;
      }
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
      confirmText={isDeleting ? 'Delete Note' : 'Set Note'}
      canConfirm={Boolean(existingNote || input)}
      confirmColor={isDeleting ? 'error' : 'primary'}
      busy={busy}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Set Note</Typography>
      <TextField
        variant="outlined"
        label="Note"
        multiline
        fullWidth
        rows={3}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
    </BaseModal>
  );
};

export default NoteModal;
