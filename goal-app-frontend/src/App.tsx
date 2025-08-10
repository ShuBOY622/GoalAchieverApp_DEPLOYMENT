import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store, RootState } from './store';
import { loadUserFromStorage } from './store/authSlice';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import { Friends } from './pages/Friends';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';

import { ChallengesPage } from './pages/ChallengePage';

// Components
import { Sidebar } from './components/common/Sidebar';

// Styles
import './styles/globals.css';

// ✅ Memoized AppContent to prevent unnecessary re-renders
const AppContent: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // ✅ Stable useEffect - only runs once
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isAuthenticated = user && token;

  return (
    <Router>
      <div className="App">
        {/* ✅ Only render Sidebar when authenticated */}
        {isAuthenticated && <Sidebar />}
        
        <Routes>
          {/* ✅ Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* ✅ Protected routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/goals" 
            element={isAuthenticated ? <Goals /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/friends" 
            element={isAuthenticated ? <Friends /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
          />
          {/* ✅ Route for viewing other users' profiles */}
          <Route 
            path="/profile/:userId" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
          />
          {/* ✅ Notifications route */}
         
          {/* ✅ Challenges route */}
          <Route 
            path="/challenges" 
            element={isAuthenticated ? <ChallengesPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/leaderboard" 
            element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" replace />} 
          />
          
          {/* ✅ Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>

        {/* ✅ Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="mt-16"
        />
      </div>
    </Router>
  );
});

// ✅ Set display name for debugging
AppContent.displayName = 'AppContent';

// ✅ Main App component with portal container
function App() {
  return (
    <Provider store={store}>
      <AppContent />
      {/* ✅ Add notification portal container for NotificationBell */}
      <div id="notification-portal"></div>
    </Provider>
  );
}

export default App;
