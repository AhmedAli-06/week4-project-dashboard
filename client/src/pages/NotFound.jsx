import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="wrap page">
      <div className="state">
        <p className="notfound-code">404</p>
        <h1 style={{ fontSize: 24 }}>This page does not exist</h1>
        <p className="muted" style={{ maxWidth: 420, margin: '0 auto 20px' }}>
          The link may be old or mistyped. Your projects are still one click away.
        </p>
        <Link to="/" className="btn btn-primary">Back to projects</Link>
      </div>
    </div>
  );
}