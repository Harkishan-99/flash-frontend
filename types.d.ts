declare module 'lodash' {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
      maxWait?: number;
    }
  ): T;

  // Add any other lodash functions you need here
  
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
    }
  ): T;
} 