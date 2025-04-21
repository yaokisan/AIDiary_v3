import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Archive from './pages/Archive';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">ホーム</Link>
            </li>
            <li>
              <Link to="/archive">過去の日記</Link>
            </li>
          </ul>
        </nav>

        <hr />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 