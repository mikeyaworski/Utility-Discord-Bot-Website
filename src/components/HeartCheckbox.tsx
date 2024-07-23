import React from 'react';
import { Checkbox, CheckboxProps } from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

const HeartCheckbox: React.FC<CheckboxProps> = props => {
  return (
    <Checkbox icon={<FavoriteBorderIcon />} checkedIcon={<FavoriteIcon />} {...props} />
  );
};

export default HeartCheckbox;
