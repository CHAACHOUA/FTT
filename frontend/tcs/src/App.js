import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';

import CandidateSignup from './pages/candidate/CandidateSignup';
import Login from './pages/common/Login';
import NavBar from './pages/common/NavBar';
import UploadCV from './pages/candidate/section/UploadCV';
import ValidateProfile from './pages/candidate/ValidateProfile';
import ValidateEmailChange from './pages/candidate/ValidateEmailChange';
import RequestPasswordReset from './pages/candidate/RequestPasswordReset';
import ResetPassword from './pages/candidate/ResetPassword';
import ChangePassword from './pages/candidate/ChangePassword';
import DeleteAccount from './pages/candidate/DeleteAccount';
import ForumView from './pages/candidate/ForumView';
import Home from './pages/common/Home';
import ForumDetail from './pages/candidate/ForumDetail';
import ProfileView from './pages/candidate/ProfileView';
import PublicProfileView from './pages/candidate/PublicProfileView';
import Dashboard from './pages/candidate/Event/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
          <Route path="/forums/event" element={<ForumDetail />} />
          <Route path="/event/dashboard/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/public/candidate/:token" element={<PublicProfileView />} />


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
