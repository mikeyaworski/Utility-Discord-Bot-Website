import React, { Suspense, useState } from 'react';
import { atom } from 'jotai';
import { MovieWithOrderOnly } from 'types';
import Tabs from 'components/Tabs';
import Movies from './Movies';
import MovieLists from './Lists';
import ListSkeleton from './ListSkeleton';
import MoviesSkeleton from './MoviesSkeleton';

type WorkingMovieLists = {
  [listId: string]: MovieWithOrderOnly[],
}

// This atom is lifted here since tab switching should not clobber unsaved list changes
export const WorkingMovieListsAtom = atom<WorkingMovieLists>({});

const MoviesWrapper: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <Tabs
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabsData={[{
        label: 'Movies',
        body: (
          <Suspense fallback={<MoviesSkeleton />}>
            <Movies />
          </Suspense>
        ),
      }, {
        label: 'Lists',
        body: (
          <Suspense fallback={<ListSkeleton />}>
            <MovieLists />
          </Suspense>
        ),
      }]}
    />
  );
};

export default MoviesWrapper;
