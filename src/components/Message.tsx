import React from 'react';
import { Link } from '@mui/material';
import Linkify from 'react-linkify';
import { MessagePart, MessagePartType } from 'types';
import Mention from 'components/Mention';

interface Props {
  parts: MessagePart[],
}

const linkDecorator = (href: string, text: string, key: number): React.ReactNode => {
  return (
    <Link key={key} href={href} target="_blank">
      {text}
    </Link>
  );
};

const Message: React.FC<Props> = ({ parts }) => {
  return (
    <Linkify componentDecorator={linkDecorator}>
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
    </Linkify>
  );
};

export default Message;
