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
import ForumRecruiterView from './pages/recruiter/ForumRecruiterView';
import ForumOrganizerView from './pages/organizer/ForumOrganizerView';
import RecruiterProfileView from './pages/recruiter/RecruiterProfileView';
import RecruiterDashboard from './pages/recruiter/event/RecruiterDashboard';
import MatchingCandidates from './pages/recruiter/event/MatchingCandidates';
import OrganizerDashboard from './pages/organizer/Event/OrganizerDashboard';
import CompleteRecruiterSetup from './pages/recruiter/CompleteRecruiterSetup';
import CompaniesList from './pages/organizer/Event/CompaniesList';
import CandidatesList from './pages/organizer/Event/CandidatesList';

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
          <Route path="/settings-recruiter" element={<RecruiterProfileView />} />
          <Route path="/recruiter/forums" element={<ForumRecruiterView />} />
          <Route path="/organizer/forums" element={<ForumOrganizerView />} />
          <Route path="/forums" element={<ForumView />} />
          <Route path="/" element={<Home />} />
          <Route path="/forums/event" element={<ForumDetail />} />
          <Route path="/event/candidate/dashboard/" element={<Dashboard />} />
          <Route path="/event/recruiter/dashboard/" element={<RecruiterDashboard />} />
          <Route path="/event/organizer/dashboard/" element={<OrganizerDashboard />} />
          <Route path="/candidate/profile" element={<ProfileView />} />
          <Route path="/public/candidate/:token" element={<PublicProfileView />} />
          <Route path="/matching-candidates" element={<MatchingCandidates />} />
          <Route path="/recruiter/profile" element={<RecruiterProfileView />} />
          <Route path="/organizer/companies" element={<CompaniesList />} />
          <Route path="/organizer/candidates" element={<CandidatesList />} />
          <Route path="/complete-recruiter-setup/:token" element={<CompleteRecruiterSetup />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
