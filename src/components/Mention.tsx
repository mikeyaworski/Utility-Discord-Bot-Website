import React from 'react';
import { Box } from '@mui/material';

interface Props {
  value: string,
}

const Mention: React.FC<Props> = ({ value }) => {
  return (
    <Box
      component="span"
      sx={{
        padding: '1px 4px 2px 4px',
        background: 'hsla(235,85.6%,64.7%,0.3)',
        borderRadius: '3px',
      }}
    >
      {value}
    </Box>
  );
};

export default Mention;
