export const measurePerformance = async (name: string, fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
  return duration;
};

export const measureRenderPerformance = (name: string, renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  const duration = end - start;
  console.log(`[PERF-RENDER] ${name}: ${duration.toFixed(2)}ms`);
  return duration;
};
