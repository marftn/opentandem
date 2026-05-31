import { useEffect, useRef } from 'react';

// Calls onClickOutside whenever the user clicks outside the element referenced by ref.
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
