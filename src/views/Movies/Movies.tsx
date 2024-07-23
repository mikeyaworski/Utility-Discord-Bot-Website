import type { IntentionalAny, Movie } from 'types';

import React, { useContext, useState } from 'react';
import {
  Box,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import { useFetchMovies } from './utils';
import MovieCard from './Movie';
import CreateMovieModal from './CreateMovieModal';
import MovieFilters, { Comparator, Filters, DynamicFilters, Sort, SortOrder } from './MovieFilters';

// TODO: Improve typing
function compare(a: IntentionalAny, b: IntentionalAny, comparator: Comparator): boolean {
  switch (comparator) {
    case Comparator.EQUAL_TO: {
      return a === b;
    }
    case Comparator.CONTAINS: {
      return a.toLowerCase().trim().includes(b.toLowerCase().trim());
    }
    case Comparator.GREATER_THAN: {
      return a > b;
    }
    case Comparator.LESS_THAN: {
      return a < b;
    }
    default: {
      return true;
    }
  }
}

function filterMovie(movie: Movie, filters: Filters): boolean {
  let isMatch = true;
  const searchLower = filters.search.trim().toLowerCase();
  if (searchLower && !(movie.title.toLowerCase().includes(searchLower) || movie.imdb_id?.toLowerCase().includes(searchLower))) {
    isMatch = false;
  }
  const filterKeys: (keyof DynamicFilters)[] = [
    'is_favorite',
    'was_watched',
    'imdb_rating',
    'rotten_tomatoes_rating',
    'metacritic_rating',
    'length',
    'year',
    'actors',
    'director',
    'genre',
    'language',
  ];
  filterKeys.forEach(filterKey => {
    const filter = filters[filterKey];
    if (filter != null && !compare(movie[filterKey], filter.value, filter.comparator)) {
      isMatch = false;
    }
  });
  return isMatch;
}

const sortMovies = (filters: Filters) => (a: Movie, b: Movie): number => {
  const x = filters.sortOrder === SortOrder.ASC ? a : b;
  const y = filters.sortOrder === SortOrder.ASC ? b : a;
  let compProperty: 'length' | 'year' | 'imdb_rating' | 'rotten_tomatoes_rating' | 'metacritic_rating' = 'length';
  switch (filters.sort) {
    case Sort.LENGTH: {
      compProperty = 'length';
      break;
    }
    case Sort.YEAR: {
      compProperty = 'year';
      break;
    }
    case Sort.IMDB_RATING: {
      compProperty = 'imdb_rating';
      break;
    }
    case Sort.ROTTEN_TOMATOES_RATING: {
      compProperty = 'rotten_tomatoes_rating';
      break;
    }
    case Sort.METACRITIC_RATING: {
      compProperty = 'metacritic_rating';
      break;
    }
    case Sort.NO_SORT:
    default: {
      return 0;
    }
  }
  const xProperty = x[compProperty];
  const yProperty = y[compProperty];
  if (xProperty == null) return filters.sortOrder === SortOrder.ASC ? 1 : -1;
  if (yProperty == null) return filters.sortOrder === SortOrder.ASC ? -1 : 1;
  return xProperty - yProperty;
};

const Movies: React.FC = () => {
  const { selectedGuildId } = useContext(GuildContext);
  const { user } = useContext(AuthContext);
  const moviesQuery = useFetchMovies();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    sort: Sort.NO_SORT,
    sortOrder: SortOrder.DESC,
  });

  return (
    <>
      <CreateMovieModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={() => setCreateModalOpen(false)}
      />
      <MovieFilters filters={filters} setFilters={setFilters} />
      <Box display="flex" flexWrap="wrap" alignItems="stretch" gap={2}>
        {moviesQuery.data.filter(movie => filterMovie(movie, filters)).sort(sortMovies(filters)).map(movie => (
          <Box key={movie.id} width={320}>
            <MovieCard key={movie.id} movie={movie} altBackground={false} />
          </Box>
        ))}
      </Box>
      <Fab
        title="Create New List"
        color="primary"
        sx={{ position: 'fixed', right: 40, bottom: 40 }}
        onClick={() => setCreateModalOpen(true)}
        disabled={!selectedGuildId || !user}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default Movies;
