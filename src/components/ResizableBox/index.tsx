import React from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import './styles.css';

const ResizableBoxWrapper: React.FC<ResizableBoxProps> = (props: ResizableBoxProps) => {
  return <ResizableBox {...props} />;
};

export default ResizableBoxWrapper;
