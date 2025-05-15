// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateSignup from './features/candidate/CandidateSignup';
import Login from './features/common/Login';
import NavBar from './features/common/NavBar';
import UploadCV from './features/candidate/section/UploadCV';
import ValidateProfile from './features/candidate/ValidateProfile';
import ValidateEmailChange from './features/candidate/ValidateEmailChange';
import RequestPasswordReset from './features/candidate/RequestPasswordReset';
import ResetPassword from './features/candidate/ResetPassword';
import ChangePassword from './features/candidate/ChangePassword';
import DeleteAccount from './features/candidate/DeleteAccount';
import ForumView from './features/candidate/ForumView';
import Home from './features/common/Home';
import ForumDetail from './features/forum/ForumDetail';

import ProfileView from './features/candidate/ProfileView';

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/signup-candidate" element={<CandidateSignup />} />
       <Route path="/upload-cv" element={<UploadCV />} /> 
       <Route path="/login" element={<Login />} />
       <Route path="/navbar" element={<NavBar />} />
       <Route path="/activate/:token" element={<ValidateProfile />} />
       <Route path="/validate-email/:token" element={<ValidateEmailChange />} />
       <Route path="/forgot-password" element={<RequestPasswordReset />} />
       <Route path="/reset-password/:token" element={<ResetPassword />} />
       <Route path="/change-password" element={<ChangePassword />} />
       <Route path="/delete-account" element={<DeleteAccount />} />
       <Route path="/settings" element={<ProfileView />} />
       <Route path="/forums" element={<ForumView />} />
       <Route path="/" element={<Home />} />
       <Route path="/forums/:id" element={<ForumDetail />} />

       <Route path="/profile" element={<ProfileView />} />
      </Routes>
    </Router>
  );
}

export default App;
