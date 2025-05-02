// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateSignup from './features/candidate/CandidateSignup';
import Login from './features/common/Login';
import UploadCV from './features/candidate/UploadCV';
import Home from './features/common/Home';


function App() {
  return (
    <Router>
      <Routes>
       <Route path="/signup-candidate" element={<CandidateSignup />} />
       <Route path="/upload-cv" element={<UploadCV />} /> 
       <Route path="/login" element={<Login />} />
       <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
