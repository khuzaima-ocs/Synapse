"use client"

import { useParams, useSearchParams } from "next/navigation"
import { CustomGPTChat } from "@/components/custom-gpt-chat"
import { useEffect, useState } from "react"

export default function CustomGPTEmbedPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check for theme parameter in URL
    const themeParam = searchParams.get('theme')
    console.log('Theme param:', themeParam) // Debug log
    
    if (themeParam === 'dark') {
      setTheme('dark')
      // Apply dark theme to document
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      console.log('Applied dark theme') // Debug log
    } else {
      setTheme('light')
      // Ensure light theme is applied (remove any dark theme classes)
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      console.log('Applied light theme') // Debug log
    }
  }, [searchParams])

  return (
    <div 
      className={`h-screen w-full ${theme === 'dark' ? 'dark' : ''}`}
      style={{
        '--background': theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
        '--foreground': theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
        '--card': theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
        '--card-foreground': theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
        '--muted': theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(210 40% 96%)',
        '--muted-foreground': theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)',
        '--border': theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)',
      } as React.CSSProperties}
    >
      <div className="h-screen w-full bg-background">
        <CustomGPTChat gptId={String(params?.id)} isEmbedMode={true} />
      </div>
    </div>
  )
}
