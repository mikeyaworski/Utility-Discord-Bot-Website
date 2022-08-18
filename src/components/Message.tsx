import React from 'react';
import { MessagePart, MessagePartType } from 'types';
import Mention from 'components/Mention';

interface Props {
  parts: MessagePart[],
}

const Message: React.FC<Props> = ({ parts }) => {
  return (
    <>
      {parts.map((part, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={i}>
          {part.type === MessagePartType.RAW
            ? part.value
            : (
              <Mention value={part.value} />
            )}
        </React.Fragment>
      ))}
    </>
  );
};

export default Message;
