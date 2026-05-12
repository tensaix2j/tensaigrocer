'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const activeTheme = theme === 'light' || theme === 'dark' ? theme : resolvedTheme
  const isDark = activeTheme === 'dark'

  return (
    <button
      onClick={() =>
        setTheme(isDark ? 'light' : 'dark')
      }
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="
        rounded-lg
        border
        px-2
        py-1
        m-0
        mb-0
        text-sm
        transition
        hover:bg-gray-100
        
        dark:hover:bg-orange-700
        dark:hover:text-white
      "
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
