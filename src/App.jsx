import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

//auth Pages
import RegisterPage from "./Pages/RegisterPage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import OAuthSuccessPage from "./Pages/OAuthSuccessPage.jsx";

//main App Pages
import SkillSharingFeed from "./Pages/SkillSharingFeed.jsx";
import LearningProgressPage from "./Pages/LearningProgressPage.jsx";
import LearningPlanPage from "./Pages/LearningPlanPage.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";

//auth Context
import { useAuth } from "./context/auth/useAuth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainLayout from "./layout/MainLayout.jsx";

//event page
import EventsPage from "./Pages/EventsPage.jsx";
import ResourcesPage from "./Pages/ResourcesPage.jsx";

//scrollToTop component to reset scroll position on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* auth Routes */}
        <Route
          path="/register"
          element={!currentUser ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!currentUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        {/* protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* default route redirects to skill sharing feed */}
          <Route
            path="/"
            element={
              <MainLayout activeTab="feed">
                <SkillSharingFeed />
              </MainLayout>
            }
          />
          <Route
            path="/progress"
            element={
              <MainLayout activeTab="progress">
                <LearningProgressPage />
              </MainLayout>
            }
          />
          <Route
            path="/plans"
            element={
              <MainLayout activeTab="plans">
                <LearningPlanPage />
              </MainLayout>
            }
          />
          <Route
            path="/events"
            element={
              <MainLayout activeTab="events">
                <EventsPage />
              </MainLayout>
            }
          />
          <Route
            path="/resources"
            element={
              <MainLayout activeTab="resources">
                <ResourcesPage />
              </MainLayout>
            }
          />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>

        {/* fallback - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
