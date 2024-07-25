import React from 'react';
import { Checkbox, TextField, Autocomplete, TextFieldProps } from '@mui/material';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import {
  CheckBox as CheckboxIcon,
  CheckBoxOutlineBlank as CheckboxOutlineBlankIcon,
} from '@mui/icons-material';
import { SetState, Option } from 'types';

interface Props {
  options: Option<string>[],
  value: Option<string>[],
  setValue: SetState<Option<string>[]>,
  inputProps?: Partial<TextFieldProps>,
}

const CheckboxesTags: React.FC<Props> = ({ options, value, setValue, inputProps }) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={options}
      disableCloseOnSelect
      getOptionLabel={option => option.label}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Checkbox
              icon={<CheckboxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckboxIcon fontSize="small" />}
              checked={selected}
            />
            {option.label}
          </li>
        );
      }}
      slotProps={{
        paper: {
          sx: {
            [`& .${autocompleteClasses.listbox} .${autocompleteClasses.option}`]: {
              py: 0,
              px: 0.5,
            },
          },
        },
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      value={value}
      onChange={(event, newOptions) => {
        setValue(newOptions);
      }}
      fullWidth
      renderInput={params => (
        <TextField {...params} {...inputProps} />
      )}
    />
  );
};

export default CheckboxesTags;
