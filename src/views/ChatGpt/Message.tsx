import React from 'react';
import { Chip, Typography } from '@mui/material';
import { Delete as TrashIcon } from '@mui/icons-material';
import type { ChatGptConversationMessage } from 'types';
import { useContextMenu } from 'hooks';

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

  return (
    <>
      <Chip
        onContextMenu={handleContextMenu}
        label={<Typography variant="body1" sx={{ cursor: 'context-menu' }}>{message.content}</Typography>}
        color={message.role === 'assistant' ? 'default' : 'primary'}
        sx={{
          alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
          maxWidth: '95%',
          // multiline
          height: 'auto',
          '& .MuiChip-label': {
            display: 'block',
            whiteSpace: 'pre-wrap',
            py: '8px',
          },
        }}
      />
      {menu}
    </>
  );
};

export default Message;
