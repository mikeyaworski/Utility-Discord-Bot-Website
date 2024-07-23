import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Collapse,
  Skeleton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import ButtonMenu from 'components/ButtonMenu';
import MovieSkeleton from './MovieSkeleton';

interface Props {
  name?: string,
  id?: string,
}

const ListSkeleton: React.FC<Props> = ({ name, id }) => {
  return (
    <Box display="flex" flexDirection="column" width={380}>
      <Paper sx={{ width: '100%', px: 3, py: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflowWrap: 'anywhere' }}>
        <Box display="flex" justifyContent="space-between" sx={{ overflowWrap: 'anywhere' }}>
          {name ? (
            <Typography variant="h6">{name}</Typography>
          ) : (
            <Skeleton variant="text" width={250} height={32} />
          )}
          <ButtonMenu items={[]} disabled />
        </Box>
        {id ? (
          <Typography variant="caption">ID: {id}</Typography>
        ) : (
          <Skeleton variant="text" width={100} height={24} />
        )}
        <Collapse
          sx={{
            mt: 1,
            mr: -2,
            pr: 2,
            maxHeight: 'calc(max(60vh, 330px))',
            overflow: 'auto',
          }}
          in
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <MovieSkeleton altBackground />
            <MovieSkeleton altBackground />
            <MovieSkeleton altBackground />
          </Box>
        </Collapse>
      </Paper>
      <Button
        variant="contained"
        color="inherit"
        sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        disabled
      >
        <ExpandMoreIcon />
      </Button>
    </Box>
  );
};

export default ListSkeleton;
