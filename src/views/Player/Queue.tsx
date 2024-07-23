import React, { useContext } from 'react';
import { fetchApi, reorder } from 'utils';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';
import { PlayerStatusData } from 'types/sockets';
import { GuildContext } from 'contexts/guild';
import { SetState } from 'types';
import { Box } from '@mui/material';
import QueueItem from './QueueItem';
import { useTryUpdate } from './utils';

interface Props {
  disabled: boolean,
  setBusy: SetState<boolean>,
  playerStatus: PlayerStatusData,
  setPlayerStatus: SetState<PlayerStatusData | null>,
}

// TODO: Implement a virtual list that isn't buggy and render the full queue
const Queue: React.FC<Props> = ({ disabled, setBusy, playerStatus, setPlayerStatus }) => {
  const { selectedGuildId } = useContext(GuildContext);

  const tryUpdate = useTryUpdate({ playerStatus, setPlayerStatus, setBusy });

  // Until a virtual list is implemented,
  // cap the rendered queue size to 20
  const renderableQueue = playerStatus.queue.slice(0, 20);

  const onDragEnd: OnDragEndResponder = async result => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    tryUpdate(async () => {
      setPlayerStatus(old => {
        if (!old) return old;
        return {
          ...old,
          queue: reorder(old.queue, source.index, destination.index),
        };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/move`,
        method: 'POST',
        body: JSON.stringify({
          from: source.index,
          to: destination.index,
        }),
      });
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="queue">
        {provided => {
          return (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {renderableQueue.map((track, index) => (
                <Draggable
                  key={track.id}
                  draggableId={track.id}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(provided, snapshot) => (
                    <QueueItem
                      provided={provided}
                      data={track}
                      disabled={disabled}
                      setBusy={setBusy}
                      playerStatus={playerStatus}
                      setPlayerStatus={setPlayerStatus}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};

export default Queue;
