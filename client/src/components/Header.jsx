import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IconLogout, IconLayoutKanban, IconMenu, IconX, IconPlus } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { to: '/', label: 'Projects', icon: <IconLayoutKanban size={20} />, match: pathname === '/' },
  ];

  const railLinks = links.map((l) => (
    <Link key={l.to} to={l.to} className={`rail-link ${l.match ? 'active' : ''}`}>
      {l.icon} {l.label}
    </Link>
  ));

  return (
    <>
      <aside className="rail rail-dark">
        <Link to="/" className="rail-brand">Boards</Link>
        <nav className="rail-nav" aria-label="Primary">{railLinks}</nav>
        {user && (
          <Link to="/" className="rail-new"><IconPlus size={16} /> New project</Link>
        )}
        <div className="rail-user">
          <span className="rail-avatar">{(user?.name || '?')[0]}</span>
          <div>
            <div className="rail-name">{user?.name}</div>
            <button className="rail-signout" onClick={() => { logout(); navigate('/'); }}>
              <IconLogout size={15} /> Sign out
            </button>
          </div>
        </div>
        <div className="rail-theme"><ThemeToggle /></div>
      </aside>

      <div className="topbar">
        <Link to="/" className="brand">Boards</Link>
        <div className="nav-right">
          <ThemeToggle />
          {user ? (
            <button className="btn btn-sm" onClick={() => { logout(); navigate('/'); }}>
              <IconLogout size={16} /> Sign out
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile" onClick={close}>
          {links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          {user && (
            <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/'); }}>
              <IconLogout size={16} /> Sign out
            </button>
          )}
        </nav>
      )}
    </>
  );
}
