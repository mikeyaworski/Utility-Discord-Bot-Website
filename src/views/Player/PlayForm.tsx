import React, { useContext, useState, useEffect } from 'react';
import { Favorite, PlayInputs } from 'types';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Tabs from 'components/Tabs';
import { GuildContext } from 'contexts/guild';
import { fetchApi, getErrorMsg, isValidHttpUrl } from 'utils';
import { error } from 'logging';
import { useAlert } from 'alerts';
import { PlayerStatusData } from 'types/sockets';

interface Props {
  playerStatus: PlayerStatusData | null,
}

const PlayForm: React.FC<Props> = ({ playerStatus }) => {
  const { selectedGuildId } = useContext(GuildContext);
  const alert = useAlert();

  const [selectedTab, setSelectedTab] = React.useState(0);
  const [input, setInput] = useState('');
  const [livestreamInput, setLivestreamInput] = useState('');
  const [shuffle, setShuffle] = useState(false);
  const [pushToFront, setPushToFront] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<string | number>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFavoritesLoading(true);
    fetchApi<Favorite[]>({
      path: `/player/${selectedGuildId}/favorites`,
      method: 'GET',
    }).then(res => {
      setFavorites(res);
      setFavoritesLoading(false);
    }).catch(err => {
      error(err);
      setFavoritesLoading(false);
    });
  }, [selectedGuildId]);

  function resetInputs() {
    setInput('');
    setShuffle(false);
    setPushToFront(false);
    setSelectedFavorite('');
  }

  async function onConfirm() {
    const data: Partial<PlayInputs> = {
      shuffle,
      pushToFront,
    };
    switch (selectedTab) {
      case 0: {
        if (input && isValidHttpUrl(input)) {
          data.vodLink = input;
        } else if (input) {
          data.queryStr = input;
        }
        break;
      }
      case 1: {
        if (selectedFavorite != null) {
          data.favoriteId = String(selectedFavorite);
        }
        break;
      }
      case 2: {
        if (livestreamInput) {
          data.streamLink = livestreamInput;
        }
        break;
      }
      default: {
        break;
      }
    }
    if (data.vodLink || data.queryStr || data.favoriteId) {
      setSubmitting(true);
      try {
        await fetchApi({
          path: `/player/${selectedGuildId}/play`,
          method: 'POST',
          body: JSON.stringify(data),
        });
        setSubmitting(false);
        resetInputs();
        alert.success(playerStatus?.currentTrack ? 'Success! Track(s) are being queued.' : 'Success! Track will play momentarily.');
      } catch (err) {
        setSubmitting(false);
        alert.error(await getErrorMsg(err));
      }
    }
  }

  return (
    <Box>
      <Typography variant="h6" mb={2}>Play Audio</Typography>
      <Tabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabsData={[
          {
            label: 'Link or Query',
            body: (
              <TextField
                label="Type here"
                variant="outlined"
                value={input}
                onChange={e => setInput(e.target.value)}
                fullWidth
              />
            ),
          },
          {
            label: 'Favorite',
            disabled: favoritesLoading || favorites.length === 0,
            body: (
              <FormControl variant="filled" fullWidth>
                <InputLabel>Select Favorite</InputLabel>
                <Select
                  value={selectedFavorite}
                  onChange={e => setSelectedFavorite(e.target.value)}
                >
                  {favorites.map(favorite => (
                    <MenuItem
                      value={favorite.custom_id || favorite.id}
                      key={favorite.custom_id || favorite.id}
                    >
                      {favorite.label || favorite.custom_id || favorite.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
          },
          {
            label: 'Live',
            disabled: true,
            body: (
              <TextField
                label="Type here"
                variant="outlined"
                value={livestreamInput}
                onChange={e => setLivestreamInput(e.target.value)}
                fullWidth
              />
            ),
          },
        ]}
      />
      <Box>
        <FormControlLabel
          label="Shuffle"
          control={(
            <Checkbox
              checked={shuffle}
              onChange={e => setShuffle(e.target.checked)}
            />
          )}
        />
      </Box>
      <Box>
        <FormControlLabel
          label="Front of Queue"
          control={(
            <Checkbox
              checked={pushToFront}
              onChange={e => setPushToFront(e.target.checked)}
            />
          )}
        />
      </Box>
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          color="primary"
          startIcon={submitting && (
            <CircularProgress size={14} color="inherit" />
          )}
          onClick={onConfirm}
          disabled={submitting}
          variant="contained"
        >
          {playerStatus?.currentTrack ? 'Add to Queue' : 'Play'}
        </Button>
      </Box>
    </Box>
  );
};

export default PlayForm;
