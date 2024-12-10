import React from 'react';
import { Box, Fab } from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import MovieFilters, { Sort, SortOrder } from './MovieFilters';
import MovieSkeleton from './MovieSkeleton';

const MoviesSkeleton: React.FC = () => {
  return (
    <>
      <MovieFilters
        filters={{
          search: '',
          sort: Sort.NO_SORT,
          sortOrder: SortOrder.DESC,
        }}
        setFilters={() => {}}
        disabled
      />
      <Box display="flex" flexWrap="wrap" alignItems="stretch" gap={2}>
        <Box width={320}>
          <MovieSkeleton altBackground={false} />
        </Box>
        <Box width={320}>
          <MovieSkeleton altBackground={false} />
        </Box>
        <Box width={320}>
          <MovieSkeleton altBackground={false} />
        </Box>
      </Box>
      <Fab
        title="Create New Movie"
        color="primary"
        sx={{
          position: 'fixed',
          right: {
            xs: 20,
            md: 80,
          },
          bottom: {
            xs: 20,
            md: 50,
          },
        }}
        onClick={() => {}}
        disabled
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default MoviesSkeleton;
