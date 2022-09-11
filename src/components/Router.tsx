import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from 'components/Navigation';
import Home from 'views/Home';
import Reminders from 'views/Reminders';
import Chess from 'views/Chess';

const AppRouter: React.FC = () => {
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
