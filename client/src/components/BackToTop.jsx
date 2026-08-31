import { useEffect, useState } from 'react';
import { IconArrowUp } from '@tabler/icons-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      className="back-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <IconArrowUp size={18} />
    </button>
  );
}