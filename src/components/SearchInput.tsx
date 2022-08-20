import React, { useState } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string,
  onChange: (search: string) => void,
}

const SearchInput: React.FC<Props> = ({
  value,
  onChange,
  ...rest
}) => {
  return (
    <TextField
      {...rest}
      value={value}
      onChange={e => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => onChange('')} disabled={rest.disabled} size="small">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        ...rest.InputProps,
      }}
    />
  );
};

export default SearchInput;
