import React, { ReactNode, forwardRef, useLayoutEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
} from 'react-beautiful-dnd';
import { CustomItemComponentProps, Virtualizer } from 'virtua';
import MovieSkeleton from './MovieSkeleton';

// This component works well when the height is static. But dynamic heights break it.
const ITEM_HEIGHT = 50;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
        // height: ITEM_HEIGHT,
        // height: getRandomInt(30, 60),
        borderBottom: 'solid 1px #ccc',
        background: isDragging ? 'skyblue' : 'transparent',
        ...provided.draggableProps.style,
      }}
    >
      <MovieSkeleton altBackground />
    </div>
  );
};

const ItemWithMinHeight = forwardRef<HTMLDivElement, CustomItemComponentProps>(
  ({ children, style }, ref) => {
    return (
      // <div ref={ref} style={{ ...style, minHeight: ITEM_HEIGHT }}>
      <div ref={ref} style={style}>
        {children}
      </div>
    );
  },
);

const VirtualList = ({
  children,
  innerRef: droppableRef,
}: {
  children: ReactNode;
  innerRef: DroppableProvided['innerRef'];
}) => {
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

  return (
    <div
      ref={droppableRef}
      style={{ overflowY: 'auto', width: 400, height: 600 }}
    >
      <Virtualizer item={ItemWithMinHeight}>{children}</Virtualizer>
    </div>
  );
};

function VirtualizedList() {
  const [items, setItems] = useState(() => Array.from({ length: 1000 }, (_, i) => String(i + 1)));

  return (
    <DragDropContext
      onDragEnd={({ source, destination }) => {
        if (!destination) {
          return;
        }
        if (source.index === destination.index) {
          return;
        }

        const startIndex = source.index;
        const endIndex = destination.index;

        setItems(items => {
          const result = Array.from(items);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);

          return result;
        });
      }}
    >
      <Droppable
        droppableId="droppable"
        mode="virtual"
        renderClone={(provided, snapshot, rubric) => (
          <Item
            id={items[rubric.source.index]}
            isDragging={snapshot.isDragging}
            provided={provided}
          />
        )}
      >
        {provided => (
          <VirtualList innerRef={provided.innerRef}>
            {items.map((id, i) => (
              <Draggable key={id} draggableId={id} index={i}>
                {provided => (
                  <Item id={id} isDragging={false} provided={provided} />
                )}
              </Draggable>
            ))}
          </VirtualList>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default VirtualizedList;
