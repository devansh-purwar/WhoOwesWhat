import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegisterForm } from './components/auth/RegisterForm';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { GroupDetails } from './pages/GroupDetails';

function App() {
  const userId = localStorage.getItem('userId');

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page on root */}
        <Route
          path="/"
          element={userId ? <Navigate to="/dashboard" /> : <LandingPage />}
        />

        {/* Auth Routes */}
        <Route
          path="/register"
          element={userId ? <Navigate to="/dashboard" /> : <RegisterForm />}
        />
        <Route
          path="/login"
          element={userId ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/forgot-password"
          element={userId ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={userId ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />

        {/* Dynamic Group Route */}
        <Route
          path="/groups/:groupId"
          element={userId ? <GroupDetails /> : <Navigate to="/" />}
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={userId ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
