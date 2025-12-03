import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import CandidateSignup from './pages/candidate/auth/registration/CandidateSignup';
import Login from './pages/auth/Login';
import NavBar from './components/loyout/NavBar';
import UploadCV from './components/card/candidate/profile_section/UploadCV';
import ValidateProfile from './pages/candidate/auth/account/ValidateProfile';
import ValidateEmailChange from './pages/candidate/auth/account/ValidateEmailChange';
import RequestPasswordReset from './pages/candidate/auth/account/RequestPasswordReset';
import ResetPassword from './pages/candidate/auth/account/ResetPassword';
import ChangePassword from './pages/candidate/auth/account/ChangePassword';
import DeleteAccount from './pages/candidate/auth/account/DeleteAccount';
import ForumView from './pages/candidate/Event/common/ForumView';
import Home from './components/loyout/Home';
import ForumDetail from './pages/candidate/Event/common/ForumDetail';
import ProfileView from './pages/candidate/profile/ProfileView';
import PublicProfileView from './pages/candidate/profile/PublicProfileView';
import Dashboard from './pages/candidate/Event/common/Dashboard';
import CompanyDetail from './pages/candidate/Event/common/CompanyDetail';
import CandidateApplicationPage from './pages/candidate/Event/virtual/CandidateApplicationPage';
import CandidateApplications from './pages/candidate/Event/virtual/CandidateApplications';
import RecruiterApplications from './pages/recruiter/event/virtual/RecruiterApplications';
import ForumRecruiterView from './pages/recruiter/forums/ForumRecruiterView';
import ForumOrganizerView from './pages/organizer/Event/forum/ForumOrganizerView';
import RecruiterProfileView from './pages/recruiter/profile/RecruiterProfileView';
import RecruiterDashboard from './pages/recruiter/event/common/RecruiterDashboard';
import MatchingCandidates from './pages/recruiter/event/common/MatchingCandidates';
import OrganizerDashboard from './pages/organizer/Event/common/OrganizerDashboard';
import OrganizerProfileView from './pages/organizer/profile/OrganizerProfileView';
import ForumInfoEdit from './pages/organizer/Event/forum/ForumInfoEdit';
import VirtualStatistics from './pages/organizer/Event/virtual/VirtualStatistics';
import OfferDetail from './components/loyout/OfferDetail';
import MatchingDetail from './pages/recruiter/event/common/MatchingDetail';
import CompleteRecruiterSetup from './pages/recruiter/profile/CompleteRecruiterSetup';
import CompaniesList from './pages/organizer/Event/companies/CompaniesList';
import CandidatesList from './pages/organizer/Event/candidates/CandidatesList';
import OffersList from './pages/organizer/Event/offers/OffersList';
import ForumProgrammeManagement from './pages/organizer/Event/programmes/ForumProgrammeManagement';
import SpeakerManagementPage from './pages/organizer/Event/programmes/SpeakerManagementPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={5000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={5}
          enableMultiContainer={false}
          style={{ top: '80px' }}
        />
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
          <Route path="/candidate/forums" element={<ForumView />} />
          <Route path="/forums" element={<ForumView />} />
          <Route path="/" element={<Home />} />
          <Route path="/forums/event" element={<ForumDetail />} />
          <Route path="/forums/event/application" element={<CandidateApplicationPage />} />
          <Route path="/forums/:forumId/applications/candidate" element={<CandidateApplications />} />
          <Route path="/forums/:forumId/applications/recruiter" element={<RecruiterApplications />} />
          <Route path="/event/candidate/dashboard/" element={<Dashboard />} />
          <Route path="/candidate/event/company/:companyId" element={<CompanyDetail />} />
          <Route path="/event/recruiter/dashboard/" element={<RecruiterDashboard />} />
          <Route path="/event/organizer/dashboard/" element={<OrganizerDashboard />} />
          <Route path="/candidate/profile" element={<ProfileView />} />
          <Route path="/public/candidate/:token" element={<PublicProfileView />} />
          <Route path="/offer/detail" element={<OfferDetail />} />
          <Route path="/matching/detail" element={<MatchingDetail />} />
          <Route path="/matching-candidates" element={<MatchingCandidates />} />
          <Route path="/recruiter/profile" element={<RecruiterProfileView />} />
          <Route path="/organizer/companies" element={<CompaniesList />} />
          <Route path="/organizer/candidates" element={<CandidatesList />} />
          <Route path="/organizer/offers" element={<OffersList />} />
          <Route path="/organizer/profile" element={<OrganizerProfileView />} />
          <Route path="/settings-organizer" element={<OrganizerProfileView />} />
          <Route path="/organizer/forum-info" element={<ForumInfoEdit />} />
          <Route path="/organizer/programmes" element={<ForumProgrammeManagement />} />
          <Route path="/organizer/speakers" element={<SpeakerManagementPage />} />
          <Route path="/organizer/statistics" element={<VirtualStatistics />} />
          <Route path="/complete-recruiter-setup/:token" element={<CompleteRecruiterSetup />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
