export const useInterval = (callback, delay) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = callback
  })

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => {
        ref.current()
      }, delay)

      return () => {
        clearInterval(interval)
      }
    }
  }, [delay])
}
