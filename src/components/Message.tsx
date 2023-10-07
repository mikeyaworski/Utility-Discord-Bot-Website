import React from 'react';
import { MessagePart, MessagePartType } from 'types';
import Mention from 'components/Mention';
import LinkedText from './LinkedText';

interface Props {
  parts: MessagePart[],
}

const Message: React.FC<Props> = ({ parts }) => {
  return (
    <LinkedText>
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
    </LinkedText>
  );
};

export default Message;
