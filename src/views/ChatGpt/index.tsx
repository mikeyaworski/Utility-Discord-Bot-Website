import React, { useEffect, useState } from 'react';
import get from 'lodash.get';
import { Box, Button, Chip, TextField } from '@mui/material';
import { Delete as TrashIcon } from '@mui/icons-material';
import { ChatGptConversationMessage } from 'types';
import { useAlert } from 'alerts';
import { useConfirmationModal } from 'hooks';
import { fetchApi, getErrorMsg } from 'utils';
import DotPulse from './DotPulse';
import Message from './Message';

const conversationStateKey = 'chatGptConversation';
const conversationStorageLimit = 100;

const ChatGpt: React.FC = () => {
  const alert = useAlert();
  const [conversation, setConversation] = useState<ChatGptConversationMessage[]>(() => JSON.parse(
    window.localStorage.getItem(conversationStateKey) || '[]',
  ));
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');

  const { node: confirmClearConvoModal, open: openConfirmClearConvoModal } = useConfirmationModal({
    confirmText: 'Clear',
    confirmColor: 'error',
  });

  const { node: confirmDeleteMessageModal, open: openConfirmDeleteMessageModal } = useConfirmationModal({
    confirmText: 'Delete',
    confirmColor: 'error',
  });

  function clearQueue() {
    window.localStorage.removeItem(conversationStateKey);
    setConversation([]);
  }

  async function sendMessage(message: string): Promise<void> {
    setBusy(true);
    setInput('');
    setConversation(old => [{ role: 'user', content: message }, ...old]);
    try {
      const chatGptResponse = await fetchApi<string>({
        method: 'POST',
        path: '/chatgpt/message',
        body: JSON.stringify({
          query: message,
          conversation,
        }),
      });
      setConversation(old => [{ role: 'assistant', content: chatGptResponse }, ...old]);
    } catch (err) {
      const errMsg = await getErrorMsg(err);
      alert.error(`${get(err, 'status')}: ${errMsg}`);
      setInput(message);
      setConversation(old => old.slice(1));
    }
    setBusy(false);
  }

  useEffect(() => {
    window.localStorage.setItem(conversationStateKey, JSON.stringify(conversation.slice(0, conversationStorageLimit)));
  }, [conversation]);

  return (
    <>
      {confirmClearConvoModal}
      {confirmDeleteMessageModal}
      <Box
        height="100%"
        width="100%"
        maxWidth="1000px"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        mx="auto"
      >
        <Button
          variant="contained"
          color="error"
          startIcon={<TrashIcon />}
          sx={{
            marginLeft: 'auto',
            mb: 1,
          }}
          onClick={() => openConfirmClearConvoModal({
            title: 'Clear conversation history?',
            details: 'This is stored in your browser local storage.',
            onConfirm: clearQueue,
          })}
        >
          Clear
        </Button>
        <Box
          flexGrow={1}
          width="100%"
          display="flex"
          flexDirection="column-reverse"
          gap={1}
          position="relative"
          border="1px solid rgba(255, 255, 255, 0.23)"
          borderBottom="0px"
          p={2}
          sx={{ overflowY: 'auto' }}
        >
          {busy && (
            <Chip
              label={<DotPulse />}
              color="default"
              sx={{
                alignSelf: 'flex-start',
                '& .MuiChip-label': {
                  py: '8px',
                  px: '12px',
                },
              }}
            />
          )}
          {conversation.map((message, i) => (
            <Message
              // eslint-disable-next-line react/no-array-index-key
              key={message.role + message.content + i}
              message={message}
              onDelete={() => openConfirmDeleteMessageModal({
                title: 'Delete message?',
                onConfirm: () => setConversation(old => old.slice(0, i).concat(old.slice(i + 1))),
              })}
            />
          ))}
        </Box>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (busy) return;
            const data = new FormData(e.currentTarget);
            const message = data.get('message');
            if (message && typeof message === 'string') sendMessage(message);
          }}
          style={{ width: '100%' }}
        >
          <TextField
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 0,
              },
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            name="message"
            placeholder="Type your message..."
            autoFocus
          />
        </form>
      </Box>
    </>
  );
};

export default ChatGpt;
