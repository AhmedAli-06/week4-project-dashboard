import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import BackToTop from './components/BackToTop.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const isLogin = pathname === '/login';

  const routes = (
    <Routes>
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/project/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  if (isLogin) {
    return (
      <>
        <a href="#main" className="skip">Skip to content</a>
        <main id="main">{routes}</main>
      </>
    );
  }

  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <Header />
      <main id="main" className="shell-main">{routes}</main>
      <BackToTop />
      <CookieBanner />
    </div>
  );
}
