import type { SetState } from 'types';

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, IconButton, MenuItem, Popover, TextField } from '@mui/material';
import {
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import SearchInput from 'components/SearchInput';

export enum Sort {
  NO_SORT,
  LENGTH,
  YEAR,
  IMDB_RATING,
  ROTTEN_TOMATOES_RATING,
  METACRITIC_RATING,
}

export enum SortOrder {
  ASC,
  DESC,
}

export enum Comparator {
  GREATER_THAN,
  LESS_THAN,
  EQUAL_TO,
  CONTAINS,
}

type BooleanComparison = {
  value: boolean,
  comparator: Comparator.EQUAL_TO,
}

type NumberComparison = {
  value: number,
  comparator: Comparator.EQUAL_TO | Comparator.GREATER_THAN | Comparator.LESS_THAN,
}

type TextComparison = {
  value: string,
  comparator: Comparator.EQUAL_TO | Comparator.CONTAINS,
}

export interface Filters {
  search: string,

  sort: Sort,
  sortOrder: SortOrder,

  is_favorite?: BooleanComparison,
  was_watched?: BooleanComparison,

  genre?: TextComparison,
  actors?: TextComparison,
  director?: TextComparison,
  language?: TextComparison,

  length?: NumberComparison,
  year?: NumberComparison,
  imdb_rating?: NumberComparison,
  rotten_tomatoes_rating?: NumberComparison,
  metacritic_rating?: NumberComparison,
}

export type DynamicFilters = Omit<Filters, 'search' | 'sort' | 'sortOrder'>;

type FieldKey = keyof DynamicFilters;

type Field = {
  id: FieldKey,
  label: string,
  type: 'text' | 'boolean' | 'number',
}

const FIELD_DATA: Field[] = [
  { id: 'length', label: 'Length (mins)', type: 'number' },
  { id: 'year', label: 'Year', type: 'number' },
  { id: 'imdb_rating', label: 'IMDb Rating', type: 'number' },
  { id: 'rotten_tomatoes_rating', label: 'Rotten Tomatoes Rating', type: 'number' },
  { id: 'metacritic_rating', label: 'Metacritic Rating', type: 'number' },
  { id: 'is_favorite', label: 'Favorite', type: 'boolean' },
  { id: 'was_watched', label: 'Watched', type: 'boolean' },
  { id: 'genre', label: 'Genre', type: 'text' },
  { id: 'actors', label: 'Actors', type: 'text' },
  { id: 'director', label: 'Directors', type: 'text' },
  { id: 'language', label: 'Language', type: 'text' },
];

interface Props {
  filters: Filters,
  setFilters: SetState<Filters>,
  disabled?: boolean,
}

function getComparatorSymbol(comparator: Comparator): string {
  switch (comparator) {
    case Comparator.CONTAINS: {
      return 'has';
    }
    case Comparator.EQUAL_TO: {
      return '=';
    }
    case Comparator.GREATER_THAN: {
      return '>';
    }
    case Comparator.LESS_THAN: {
      return '<';
    }
    default: {
      return '';
    }
  }
}

function getFilterDisplayValue(value: string | number | boolean): string {
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

const MovieFilters: React.FC<Props> = ({ filters, setFilters, disabled = false }) => {
  const [filterAnchor, setFilterAnchor] = useState<Element | null>(null);

  const [filterFieldKey, setFilterFieldKey] = useState<FieldKey>('length');
  const [filterFieldValue, setFilterFieldValue] = useState<string | number | boolean>('');
  const [filterFieldComparator, setFilterFieldComparator] = useState(Comparator.EQUAL_TO);

  const filterFieldType = FIELD_DATA.find(field => field.id === filterFieldKey)!.type;

  useEffect(() => {
    switch (filterFieldType) {
      case 'number': {
        setFilterFieldValue(0);
        setFilterFieldComparator(Comparator.GREATER_THAN);
        break;
      }
      case 'boolean': {
        setFilterFieldValue(true);
        setFilterFieldComparator(Comparator.EQUAL_TO);
        break;
      }
      case 'text':
      default: {
        setFilterFieldValue('');
        setFilterFieldComparator(Comparator.CONTAINS);
        break;
      }
    }
  }, [filterFieldType]);

  const setFilterProperty = useCallback(<T extends keyof Filters>(key: T, value: Filters[T]) => {
    setFilters(old => ({
      ...old,
      [key]: value,
    }));
  }, [setFilters]);

  function addFilter() {
    // @ts-ignore TODO: Improve the typing
    setFilterProperty(filterFieldKey, {
      value: filterFieldValue,
      comparator: filterFieldComparator,
    });
    setFilterAnchor(null);
  }

  function removeFilter(key: FieldKey) {
    setFilters(old => {
      const newFilters = { ...old };
      delete newFilters[key];
      return newFilters;
    });
  }

  return (
    <>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={1} gap={2}>
        <SearchInput
          value={filters.search}
          onChange={newValue => setFilters(old => ({
            ...old,
            search: newValue,
          }))}
          variant="outlined"
          label="Search"
          sx={{
            width: '100%',
            maxWidth: 320,
          }}
          disabled={disabled}
        />
        <TextField
          select
          disabled={disabled}
          value={filters.sort}
          label="Sort By"
          onChange={e => setFilterProperty('sort', e.target.value as unknown as Sort)}
        >
          <MenuItem value={Sort.NO_SORT}>No sort</MenuItem>
          <MenuItem value={Sort.LENGTH}>Length</MenuItem>
          <MenuItem value={Sort.YEAR}>Year</MenuItem>
          <MenuItem value={Sort.IMDB_RATING}>IMDb Rating</MenuItem>
          <MenuItem value={Sort.ROTTEN_TOMATOES_RATING}>Rotten Tomatoes Rating</MenuItem>
          <MenuItem value={Sort.METACRITIC_RATING}>Metacritic Rating</MenuItem>
        </TextField>
        <TextField
          select
          value={filters.sortOrder}
          label="Sort Order"
          onChange={e => setFilterProperty('sortOrder', e.target.value as unknown as SortOrder)}
          disabled={disabled || filters.sort === Sort.NO_SORT}
        >
          <MenuItem value={SortOrder.ASC}>Ascending</MenuItem>
          <MenuItem value={SortOrder.DESC}>Descending</MenuItem>
        </TextField>
        <IconButton onClick={e => setFilterAnchor(e.currentTarget)} title="Add filter" disabled={disabled}>
          <FilterListIcon />
        </IconButton>
        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="stretch" gap={1} mb={2}>
              <TextField
                size="small"
                select
                value={filterFieldKey}
                label="Field"
                onChange={e => setFilterFieldKey(e.target.value as unknown as FieldKey)}
              >
                {FIELD_DATA.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>{label}</MenuItem>
                ))}
              </TextField>
              {filterFieldType === 'boolean' && (
                <FormControlLabel
                  label="True"
                  control={(
                    <Checkbox checked={Boolean(filterFieldValue)} onChange={e => setFilterFieldValue(e.target.checked)} />
                  )}
                  sx={{ ml: 0 }}
                />
              )}
              {filterFieldType === 'number' && (
                <>
                  <TextField
                    size="small"
                    select
                    value={filterFieldComparator}
                    label="Comparator"
                    onChange={e => setFilterFieldComparator(e.target.value as unknown as Comparator)}
                  >
                    <MenuItem value={Comparator.GREATER_THAN}>Greater Than</MenuItem>
                    <MenuItem value={Comparator.LESS_THAN}>Less Than</MenuItem>
                    <MenuItem value={Comparator.EQUAL_TO}>Equals</MenuItem>
                  </TextField>
                  <TextField
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    value={filterFieldValue}
                    label="Value"
                    onChange={e => setFilterFieldValue(Number(e.target.value))}
                  />
                </>
              )}
              {filterFieldType === 'text' && (
                <>
                  <TextField
                    size="small"
                    select
                    value={filterFieldComparator}
                    label="Comparator"
                    onChange={e => setFilterFieldComparator(e.target.value as unknown as Comparator)}
                  >
                    <MenuItem value={Comparator.CONTAINS}>Contains</MenuItem>
                    <MenuItem value={Comparator.EQUAL_TO}>Equals</MenuItem>
                  </TextField>
                  <TextField
                    size="small"
                    sx={{ width: 100 }}
                    value={filterFieldValue}
                    label="Value"
                    onChange={e => setFilterFieldValue(e.target.value)}
                  />
                </>
              )}
            </Box>
            <Button variant="contained" onClick={addFilter}>
              Add Filter
            </Button>
          </Box>
        </Popover>
      </Box>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={2} gap={1}>
        {Object.entries(filters).filter(([key]) => !['search', 'sort', 'sortOrder'].includes(key)).map(([filterKey, { value, comparator }]) => {
          const field = FIELD_DATA.find(f => f.id === filterKey)!;
          return (
            <Chip
              key={filterKey}
              label={`${field.label} ${getComparatorSymbol(comparator)} ${getFilterDisplayValue(value)}`}
              onDelete={() => removeFilter(filterKey as FieldKey)}
            />
          );
        })}
      </Box>
    </>
  );
};

export default MovieFilters;
