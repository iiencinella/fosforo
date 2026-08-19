import { useLayoutEffect, useRef } from "react";

/**
 * Oculta el hermano anterior con `data-portal-skeleton` al hidratar (islas client:only).
 */
export function useHideHydrationSkeleton<E extends HTMLElement = HTMLElement>() {
  const ref = useRef<E | null>(null);

  useLayoutEffect(() => {
    const prev = ref.current?.previousElementSibling;
    if (prev instanceof HTMLElement && prev.hasAttribute("data-portal-skeleton")) {
      prev.hidden = true;
    }
  }, []);

  return ref;
}
