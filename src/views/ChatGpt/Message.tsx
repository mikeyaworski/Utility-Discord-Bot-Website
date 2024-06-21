import React from 'react';
import { Chip, Typography } from '@mui/material';
import { Delete as TrashIcon } from '@mui/icons-material';
import type { ChatGptConversationMessage } from 'types';
import { useContextMenu } from 'hooks';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

interface Props {
  message: ChatGptConversationMessage,
  onDelete: () => void,
}

const Message: React.FC<Props> = ({ message, onDelete }) => {
  const { menu, handleContextMenu } = useContextMenu([
    {
      label: 'Delete',
      onClick: onDelete,
      icon: <TrashIcon color="error" fontSize="small" />,
    },
  ], {
    x: 2,
    y: -6,
  });

  // https://github.com/remarkjs/react-markdown/issues/785#issuecomment-1966495891
  const preprocessLaTeX = (content: string) => {
    // Replace block-level LaTeX delimiters \[ \] with $$ $$
    const blockProcessedContent = message.content.replace(
      /\\\[(.*?)\\\]/gs,
      (_, equation) => `$$${equation}$$`,
    );
    // Replace inline LaTeX delimiters \( \) with $ $
    const inlineProcessedContent = blockProcessedContent.replace(
      /\\\((.*?)\\\)/gs,
      (_, equation) => `$${equation}$`,
    );
    return inlineProcessedContent;
  };

  return (
    <>
      <Chip
        onContextMenu={handleContextMenu}
        label={(
          <Typography variant="body1" sx={{ cursor: 'context-menu' }}>
            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{preprocessLaTeX(message.content)}
            </Markdown>
          </Typography>
)}
        color={message.role === 'assistant' ? 'default' : 'primary'}
        sx={{
          alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
          maxWidth: '95%',
          // multiline
          height: 'auto',
          '& .MuiChip-label': {
            display: 'block',
            whiteSpace: 'normal',
          },
        }}
      />
      {menu}
    </>
  );
};

export default Message;
