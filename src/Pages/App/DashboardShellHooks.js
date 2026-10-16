import { useEffect, useState } from 'react';

export const useDashboardMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = event => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const closeOnDesktop = event => {
      if (event.matches) setMenuOpen(false);
    };
    const desktopQuery = window.matchMedia('(min-width: 901px)');
    document.addEventListener('keydown', closeOnEscape);
    desktopQuery.addEventListener('change', closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      desktopQuery.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  return [menuOpen, setMenuOpen];
};
