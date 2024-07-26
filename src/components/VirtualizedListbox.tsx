import React, { forwardRef } from 'react';
import { Virtualizer, CustomItemComponentProps, CustomContainerComponentProps } from 'virtua';
import { Box, List } from '@mui/material';

const Container = forwardRef<HTMLUListElement, CustomContainerComponentProps>(({ children, style }, ref) => {
  return (
    <List dense ref={ref} style={style}>
      {children}
    </List>
  );
});

const Item = forwardRef<HTMLDivElement, CustomItemComponentProps>(({ children, style }, ref) => {
  children = children as React.ReactElement;
  return React.cloneElement(children, {
    ref,
    style: { ...children.props.style, ...style },
  });
});

const VirtualizedListbox = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...listboxProps }, ref) => {
  return (
    <Box
      ref={ref}
      {...listboxProps}
      // sx={{
      //   // Include role in selector for higher specificity
      //   '&[role="listbox"]': {
      //     maxHeight: 320,
      //   },
      // }}
    >
      <Virtualizer as={Container} item={Item}>
        {children}
      </Virtualizer>
    </Box>
  );
});

export default VirtualizedListbox;
