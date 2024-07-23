import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useQueryParam } from 'hooks';
import Navigation from 'components/Navigation';
import { AuthContext } from 'contexts/auth';
import LogIn from 'views/LogIn';
import Home from 'views/Home';
import Reminders from 'views/Reminders';
import Player from 'views/Player';
import Chess from 'views/Chess';
import ChatGpt from 'views/ChatGpt';
import Movies from 'views/Movies';

const AppRouter: React.FC = () => {
  const code = useQueryParam('code');
  const { notLoggedIn } = useContext(AuthContext);

  // If there is a code query param, we assume they are in the process of logging in
  // and are probably just waiting on an API response to log them in
  if (notLoggedIn && !code) {
    return (
      <Router>
        <Navigation>
          <Routes>
            <Route path="*" element={<LogIn />} />
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
          <Route path="/player" element={<Player />} />
          <Route path="/chess" element={<Chess />} />
          <Route path="/chatgpt" element={<ChatGpt />} />
          <Route path="/movies" element={<Movies />} />
        </Routes>
      </Navigation>
    </Router>
  );
};

export default AppRouter;
