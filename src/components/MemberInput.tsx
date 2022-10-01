import React, { useContext } from 'react';
import { TextField, Autocomplete, InputAdornment, Avatar } from '@mui/material';
import { GuildContext } from 'contexts/guild';
import type { Option } from 'types';
import MemberOption from 'components/MemberOption';
import { useMembers } from 'hooks';

interface Props {
  memberId: string | null,
  setMemberId: (newMemberId: string) => void,
  guildId?: string | null,
}

const MemberInput: React.FC<Props> = ({
  memberId,
  setMemberId,
  guildId,
}) => {
  const { members: globalMembers } = useContext(GuildContext);
  const localMembers = useMembers(guildId);
  const members = guildId ? localMembers : globalMembers;

  const memberOptions: Option[] = members?.map(member => ({
    label: member.name,
    value: member.id,
  })) || [];

  const selectedOption = memberOptions.find(o => o.value === memberId);
  const member = members?.find(m => m.id === selectedOption?.value);

  return (
    <Autocomplete
      disablePortal
      options={memberOptions}
      autoHighlight
      fullWidth
      disableClearable
      renderOption={(props, option) => {
        const member = members?.find(m => m.id === option.value);
        if (!member) return <li {...props}>{option.label}</li>;
        return (
          <li {...props}>
            <MemberOption member={member} />
          </li>
        );
      }}
      renderInput={params => (
        <TextField
          {...params}
          label="Member"
          InputProps={{
            ...params.InputProps,
            startAdornment: member && member.avatar ? (
              <InputAdornment position="start">
                <Avatar
                  src={member.avatar}
                  sx={{
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                  }}
                  alt=""
                />
              </InputAdornment>
            ) : params.InputProps.startAdornment,
          }}
        />
      )}
      onChange={(event, newValue) => {
        if (newValue) setMemberId(newValue.value);
      }}
      value={selectedOption || { label: '', value: '' }}
    />
  );
};

export default MemberInput;
