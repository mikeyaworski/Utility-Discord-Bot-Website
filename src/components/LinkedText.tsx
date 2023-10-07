import React from 'react';
import { Link } from '@mui/material';
import Linkify from 'react-linkify';

interface Props {
  children: React.ReactNode,
}

const linkDecorator = (href: string, text: string, key: number): React.ReactNode => {
  return (
    <Link key={key} href={href} target="_blank">
      {text}
    </Link>
  );
};

const LinkedText: React.FC<Props> = ({ children }) => {
  return (
    <Linkify componentDecorator={linkDecorator}>
      {children}
    </Linkify>
  );
};

export default LinkedText;
