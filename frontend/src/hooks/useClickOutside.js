import { useEffect, useRef } from 'react';

export function useClickOutside(ref, onClickOutside, enabled = true) {
  const callbackRef = useRef(onClickOutside);
  useEffect(() => { callbackRef.current = onClickOutside; });

  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callbackRef.current();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, enabled]);
}
