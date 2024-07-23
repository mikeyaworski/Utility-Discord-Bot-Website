import { useContext } from 'react';
import { usePrefetchQuery, useQueryClient, useSuspenseQuery, UseSuspenseQueryResult } from '@tanstack/react-query';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import { Movie, MovieListFromServer, MovieNote, MovieWithOrderOnly } from 'types';
import { parseTimeInput, filterOutFalsy, fetchApi } from 'utils';

export function getTimeFromTimeInput(input: string): number | null {
  try {
    return parseTimeInput(input);
  } catch {
    return null;
  }
}

export function getFilteredTimesFromInput(inputs: (number | string)[]): number[] {
  return filterOutFalsy(inputs.map(input => {
    if (typeof input === 'string') return getTimeFromTimeInput(input);
    return input;
  }));
}

export function orderMovies(a: MovieWithOrderOnly, b: MovieWithOrderOnly): number {
  return a.order - b.order;
}

export function useMyMovieNote(movie: Movie): MovieNote | null | undefined {
  const { user } = useContext(AuthContext);
  return movie.notes?.find(note => note.author_id === user?.id);
}

export async function fetchLists(selectedGuildId: string | null): Promise<MovieListFromServer[]> {
  if (!selectedGuildId) return [];
  const lists = await fetchApi<MovieListFromServer[]>({
    method: 'GET',
    path: `/movies/${selectedGuildId}/lists`,
  });
  lists.forEach(l => l.movies?.sort(orderMovies));
  return lists;
}

export async function fetchMovies(selectedGuildId: string | null): Promise<Movie[]> {
  if (!selectedGuildId) return [];
  const movies = await fetchApi<Movie[]>({
    method: 'GET',
    path: `/movies/${selectedGuildId}`,
  });
  return movies;
}

export function useFetchMovies(): UseSuspenseQueryResult<Movie[], Error> {
  const { selectedGuildId } = useContext(GuildContext);
  return useSuspenseQuery({
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: ['movies', selectedGuildId],
    queryFn: () => fetchMovies(selectedGuildId),
  });
}

export function usePrefetchMovies(): void {
  const { selectedGuildId } = useContext(GuildContext);
  usePrefetchQuery({
    retry: false,
    queryKey: ['movies', selectedGuildId],
    queryFn: () => fetchMovies(selectedGuildId),
  });
}

export function useFetchLists(): UseSuspenseQueryResult<MovieListFromServer[], Error> {
  const { selectedGuildId } = useContext(GuildContext);
  const queryClient = useQueryClient();
  return useSuspenseQuery({
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: ['movie-lists', selectedGuildId],
    queryFn: () => {
      // We know that every time the lists are fetched, movies will also be fetched.
      // Prefetch so that the queries don't waterfall due to the queries in nested components.
      queryClient.prefetchQuery({
        retry: false,
        queryKey: ['movies', selectedGuildId],
        queryFn: () => fetchMovies(selectedGuildId),
      });
      return fetchLists(selectedGuildId);
    },
  });
}

export function usePrefetchLists(): void {
  const { selectedGuildId } = useContext(GuildContext);
  usePrefetchQuery({
    retry: false,
    queryKey: ['movie-lists', selectedGuildId],
    queryFn: () => fetchLists(selectedGuildId),
  });
}

export function isImdbId(input: string): boolean {
  return /^tt\d+$/.test(input);
}
