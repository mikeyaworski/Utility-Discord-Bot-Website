import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  useTheme,
  Typography,
  List,
  ListItem,
  Collapse,
} from '@mui/material';
import ButtonMenu from 'components/ButtonMenu';
import { Field, Row } from './Movie';

interface Props {
  altBackground: boolean,
}

function UnorderedListSkeleton({ size }: { size: number }) {
  return (
    <List sx={{ listStyleType: 'disc', pl: 2, py: 0 }}>
      {Array.from(Array(size).keys()).map(item => (
        <ListItem key={item} sx={{ display: 'list-item', p: 0 }}>
          <Typography variant="body2" fontWeight={400}>
            <Skeleton variant="text" width="70%" height={20} />
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}

const MovieSkeleton: React.FC<Props> = ({ altBackground }) => {
  const theme = useTheme();
  return (
    <Card sx={{ width: '100%', background: altBackground ? theme.palette.altBackground.main : undefined }}>
      <CardHeader
        title={(
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Skeleton variant="text" width="45%" height={30} />
            <ButtonMenu items={[]} disabled />
          </Box>
        )}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Row>
          <Field label="Actors" value={<UnorderedListSkeleton size={3} />} width="50%" />
          <Field label="Directors" value={<UnorderedListSkeleton size={3} />} width="50%" />
        </Row>
        <Row>
          <Field label="Length" value={<Skeleton variant="text" width={70} height={20} />} width="40%" />
          <Field label="Favorite" value={false} width="30%" />
          <Field label="Watched" value={false} width="30%" />
        </Row>
        <Field label="Ratings" value="" />
        <Row>
          <Field label="IMDb" value={<Skeleton variant="text" width={25} height={20} />} width="25%" />
          <Field label="Rotten Tomatoes" value={<Skeleton variant="text" width={25} height={20} />} width="50%" />
          <Field label="Metacritic" value={<Skeleton variant="text" width={25} height={20} />} width="25%" />
        </Row>
        <Collapse />
      </CardContent>
    </Card>
  );
};

export default MovieSkeleton;
