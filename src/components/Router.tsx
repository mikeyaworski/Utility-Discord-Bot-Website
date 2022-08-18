import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from 'components/Navigation';
import Reminders from 'views/Reminders';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Navigation>
        <Routes>
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </Navigation>
    </Router>
  );
};

export default AppRouter;
