import { useEffect, useState } from 'react';

const KEY = 'cookie-ok';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie" role="region" aria-label="Cookie notice">
      <p>
        This site stores a few things in your browser: your sign-in session, your cart,
        and your theme choice. No trackers, no third-party cookies.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => { localStorage.setItem(KEY, '1'); setVisible(false); }}
      >
        Got it
      </button>
    </div>
  );
}