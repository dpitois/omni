import { useEffect, useRef } from 'preact/hooks';

export function useRenderLog(componentName: string, props?: unknown) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderCountRef.current++;
      console.log(`[Render] ${componentName}: ${renderCountRef.current}`, props);
    }
  });
}
