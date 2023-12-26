// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
import HomeServices from './components/HomeServices';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-light">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/home-services" element={<HomeServices />} />
            {/* Define other routes as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
