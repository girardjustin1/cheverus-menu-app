import { useEffect, useState } from 'react';

/**
 * True once the page is scrolled past `collapseAt`, false again near the top (`expandAt`).
 * The gap between the two stops flicker when the collapsing element changes page height.
 */
export function useScrollCollapse(collapseAt = 160, expandAt = 40) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCollapsed((was) => (was ? y > expandAt : y > collapseAt));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [collapseAt, expandAt]);
  return collapsed;
}
