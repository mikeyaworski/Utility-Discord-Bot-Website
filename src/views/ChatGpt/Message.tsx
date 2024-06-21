import React from 'react';
import { Chip, Box } from '@mui/material';
import { Delete as TrashIcon } from '@mui/icons-material';
import type { ChatGptConversationMessage } from 'types';
import { useContextMenu } from 'hooks';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface Props {
  message: ChatGptConversationMessage,
  onDelete: () => void,
}
// https://github.com/remarkjs/react-markdown/issues/785#issuecomment-1966495891
const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$
  const blockProcessedContent = content.replace(
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

  return (
    <>
      <Chip
        onContextMenu={handleContextMenu}
        label={(
          <Box
            sx={{
              cursor: 'context-menu',
              '& p': {
                whiteSpace: 'pre-wrap',
              },
              '& p, ol, ul': {
                my: 0.5,
              },
              '& h1, h2, h3': {
                my: 1.5,
              },
              '& h4, h5, h6': {
                my: 1,
              },
              '& pre': {
                my: 1.5,
              },
            }}
          >
            <Markdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{preprocessLaTeX(message.content)}
            </Markdown>
          </Box>
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
            py: 0.5,
          },
        }}
      />
      {menu}
    </>
  );
};

export default Message;
