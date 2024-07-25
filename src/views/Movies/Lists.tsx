import React, { Suspense, useContext, useState } from 'react';
import { Box, Fab } from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import List from './List';
import ListSkeleton from './ListSkeleton';
import CreateListModal from './CreateListModal';
import { useFetchLists } from './utils';

const MovieLists: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { selectedGuildId } = useContext(GuildContext);

  const [createListModalOpen, setCreateListModalOpen] = useState(false);
  const listsQuery = useFetchLists();
  return (
    <>
      <CreateListModal
        open={createListModalOpen}
        onClose={() => setCreateListModalOpen(false)}
        onConfirm={() => setCreateListModalOpen(false)}
      />
      <Box display="flex" flexWrap="wrap" mb={2} gap={2}>
        {listsQuery.data.map(list => (
          <Suspense key={list.id} fallback={<ListSkeleton name={list.name} id={list.custom_id || list.id} />}>
            <List list={list} />
          </Suspense>
        ))}
      </Box>
      <Fab
        title="Create New List"
        color="primary"
        sx={{ position: 'fixed', right: 40, bottom: 40 }}
        onClick={() => setCreateListModalOpen(true)}
        disabled={!selectedGuildId || !user}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default MovieLists;
