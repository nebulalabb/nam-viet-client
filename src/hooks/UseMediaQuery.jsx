import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (e) => setMatches(e.matches)
    
    // Add listener
    media.addEventListener('change', listener)
    
    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
