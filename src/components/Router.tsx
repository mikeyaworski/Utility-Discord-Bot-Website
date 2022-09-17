import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from 'components/Navigation';
import { AuthContext } from 'contexts/auth';
import NotLoggedIn from 'views/NotLoggedIn';
import Home from 'views/Home';
import Reminders from 'views/Reminders';
import Chess from 'views/Chess';

const AppRouter: React.FC = () => {
  const { notLoggedIn } = useContext(AuthContext);
  if (notLoggedIn) {
    return (
      <Router>
        <Navigation>
          <Routes>
            <Route path="*" element={<NotLoggedIn />} />
          </Routes>
        </Navigation>
      </Router>
    );
  }
  return (
    <Router>
      <Navigation>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/chess" element={<Chess />} />
        </Routes>
      </Navigation>
    </Router>
  );
};

export default AppRouter;
