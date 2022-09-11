import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import type { Member } from 'types';

interface Props {
  member: Member,
}

const MemberOption: React.FC<Props> = ({
  member,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      {member.avatar && (
        <Avatar
          src={member.avatar}
          sx={{
            borderRadius: '50%',
            width: 20,
            height: 20,
          }}
          alt=""
        />
      )}
      <Typography variant="body1">
        {!member.avatar
          ? `@${member.name}`
          : member.name}
      </Typography>
    </Box>
  );
};

export default MemberOption;
