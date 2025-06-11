import React, { useContext } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { GuildContext } from 'contexts/guild';
import type { Member, Channel, Role } from 'types';
import { useGuildData } from 'hooks';

enum MentionType {
  ROLE,
  MEMBER,
  CHANNEL,
}

type AtMention = {
  type: MentionType.ROLE,
  data: Role,
  id: string,
  display: string,
} | {
  type: MentionType.MEMBER,
  data: Member,
  id: string,
  display: string,
}

type ChannelMention = {
  type: MentionType.CHANNEL,
  data: Channel,
  id: string,
  display: string,
}

interface Props {
  value: string,
  onChange: (newValue: string) => void,
  guildId?: string | null,
}

const MentionableInput: React.FC<Props> = ({
  value,
  onChange,
  guildId,
}) => {
  const {
    members: localMembers,
    roles: localRoles,
    channels: localChannels,
  } = useGuildData(guildId);
  const theme = useTheme();
  const {
    members: globalMembers,
    roles: globalRoles,
    channels: globalChannels,
  } = useContext(GuildContext);
  const members = guildId !== undefined ? localMembers : globalMembers;
  const roles = guildId !== undefined ? localRoles : globalRoles;
  const channels = guildId !== undefined ? localChannels : globalChannels;

  const mentionRoles = roles
    ?.filter(role => role.mentionable)
    .map(role => ({
      type: MentionType.ROLE as const,
      data: role,
      id: `<@&${role.id}>`,
      display: `@${role.name}`,
    }))
    || [];
  const mentionMembers = members?.map(member => ({
    type: MentionType.MEMBER as const,
    data: member,
    id: `<@!${member.id}>`,
    display: `@${member.name}`,
  })) || [];
  const atMentions: AtMention[] = [
    ...mentionRoles,
    ...mentionMembers,
  ];
  const channelMentions: ChannelMention[] = channels?.map(channel => ({
    type: MentionType.CHANNEL as const,
    data: channel,
    id: `<#${channel.id}>`,
    display: `#${channel.name}`,
  })) || [];

  const optionStyles = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '4px' as const,
    padding: 1 as const,
    color: 'white' as const,
    backgroundColor: '#333' as const,
  } as const;

  return (
    <Box sx={{
      '& .mention-input': {
        width: '100%',
        '& *': {
          // No clue why this library insists on setting the z-index in their inline styles
          zIndex: '2 !important',
        },
        '& > div > div': {
          padding: '19.5px 14px 15.5px 14px',
        },
        '& textarea': {
          border: '1px solid rgba(255, 255, 255, 0.23)',
          padding: '19.5px 14px 15.5px 14px',
          borderRadius: '4px',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#FFFFFF',
          },
          '&:focus': {
            border: `2px solid ${theme.palette.primary.main}`,
            outline: 'unset',
            outlineOffset: 'unset',
            padding: '18.5px 13px 15.5px 13px',
          },
        },
      },
    }}
    >
      <MentionsInput
        className="mention-input"
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        placeholder="Message"
      >
        <Mention
          trigger="@"
          data={(search, cb) => {
            cb(atMentions.filter(mention => {
              switch (mention.type) {
                case MentionType.ROLE: {
                  return mention.data.name.toLowerCase().includes(search.toLowerCase());
                }
                case MentionType.MEMBER: {
                  return mention.data.name.toLowerCase().includes(search.toLowerCase());
                }
                default: {
                  return false;
                }
              }
            }));
          }}
          renderSuggestion={suggestion => {
            const mention = suggestion as AtMention;
            return (
              <Box sx={optionStyles}>
                {mention.type === MentionType.MEMBER && mention.data.avatar && (
                  <Avatar
                    src={mention.data.avatar}
                    sx={{
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                    }}
                    alt=""
                  />
                )}
                <Typography variant="body1">
                  {mention.type !== MentionType.MEMBER || !mention.data.avatar
                    ? `@${mention.data.name}`
                    : mention.data.name}
                </Typography>
              </Box>
            );
          }}
        />
        <Mention
          trigger="#"
          data={channelMentions}
          renderSuggestion={suggestion => {
            const mention = suggestion as ChannelMention;
            return (
              <Box sx={optionStyles}>
                <Typography variant="body1">
                  #{mention.data.name}
                </Typography>
              </Box>
            );
          }}
        />
      </MentionsInput>
    </Box>
  );
};

export default MentionableInput;
