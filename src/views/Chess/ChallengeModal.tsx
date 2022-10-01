import React, { useEffect, useState } from 'react';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { ReminderModel } from 'types';
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import ChannelInput from 'components/ChannelInput';
import GuildSelector from 'components/GuildSelector';
import MemberInput from 'components/MemberInput';
import { useGuildState } from 'hooks';

export type Payload = Omit<ReminderModel, 'id' | 'guild_id' | 'owner_id' | 'createdAt' | 'updatedAt'> & {
  message: string | null,
};

enum Color {
  WHITE = 'white',
  BLACK = 'black',
  RANDOM = 'random',
}

type Props = Omit<BaseModalProps, 'onConfirm'> & {
  onConfirm: (payload: {
    guildId: string,
    challengedUserId: string,
    channelId: string,
    startingPosition: string | null,
    color: Color | null,
  }) => void,
}

const ChallengeModal: React.FC<Props> = ({
  onConfirm,
  ...baseModalProps
}) => {
  const {
    id: guildId,
    onChange: onGuildChange,
  } = useGuildState({
    fetchGuildData: false,
  });

  const [challengedUserId, setChallengedUserId] = useState<string | null>(null);
  const [startingPosition, setStartingPosition] = useState<string>('');
  const [myColor, setMyColor] = useState<Color | null>(Color.RANDOM);
  const [channelId, setChannelId] = useState<string | null>(null);

  useEffect(() => {
    setChannelId(null);
    setChallengedUserId(null);
  }, [guildId]);

  function handleConfirm() {
    if (challengedUserId && channelId && guildId) {
      onConfirm({
        channelId,
        challengedUserId,
        startingPosition: startingPosition || null,
        color: myColor,
        guildId,
      });
    }
  }

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => handleConfirm()}
      canConfirm={Boolean(challengedUserId && channelId && guildId)}
      disableBackdropDismissal
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Create Chess Challenge</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <GuildSelector dense={false} guildId={guildId} onChange={onGuildChange} />
        <ChannelInput
          channelId={channelId}
          setChannelId={setChannelId}
          guildId={guildId}
        />
        <MemberInput
          memberId={challengedUserId}
          setMemberId={setChallengedUserId}
          guildId={guildId}
        />
        <FormControl>
          <FormLabel id="color-label">Your Color</FormLabel>
          <RadioGroup
            row
            aria-labelledby="color-label"
            value={myColor}
            onChange={e => setMyColor(e.target.value as Color)}
          >
            <FormControlLabel value={Color.WHITE} control={<Radio />} label="White" />
            <FormControlLabel value={Color.BLACK} control={<Radio />} label="Black" />
            <FormControlLabel value={Color.RANDOM} control={<Radio />} label="Random" />
          </RadioGroup>
        </FormControl>
        <TextField
          label="Starting Position (PGN)"
          placeholder="PGN"
          value={startingPosition}
          onChange={e => setStartingPosition(e.target.value)}
          multiline
        />
      </Box>
    </BaseModal>
  );
};

export default ChallengeModal;
