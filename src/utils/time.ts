// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: (...args: Parameters<T>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeout: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounced = function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  debounced.flush = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    func(...args);
  };

  return debounced as DebouncedFunction<T>;
}
