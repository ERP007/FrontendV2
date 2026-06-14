import { useEffect, useState } from 'react'

/**
 * 입력값이 delay(ms) 동안 더 바뀌지 않으면 그때 반영한다.
 * 검색어처럼 빠르게 변하는 값으로 매 입력마다 서버를 호출하지 않도록 디바운스한다.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [delay, value])

  return debounced
}
