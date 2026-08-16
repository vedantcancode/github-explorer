import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'hello' }
    });

    expect(result.current).toBe('hello');

    // Change value
    rerender({ val: 'world' });
    
    // Value shouldn't update immediately
    expect(result.current).toBe('hello');

    // Advance time by 250ms - value still shouldn't update
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('hello');

    // Advance by another 250ms (total 500ms) - value should update
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('world');
  });
});
