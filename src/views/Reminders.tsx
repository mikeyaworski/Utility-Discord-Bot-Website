import React, { useContext, useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { Reminder } from 'types';
import { fetchApi } from 'utils';
import { error } from 'logging';

const Reminders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchApi<Reminder[]>({
      path: '/reminders',
    }).then(res => {
      setReminders(res);
    }).catch(err => {
      error(err);
    });
  }, [user]);

  if (user === undefined) {
    return (
      <Skeleton variant="rectangular" width={200} height={80} sx={{ borderRadius: '4px' }} />
    );
  }

  return (
    <div>TODO</div>
  );
};

export default Reminders;
