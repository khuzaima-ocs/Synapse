import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { ApiDataProvider } from "@/lib/api-data-store"
import "./globals.css"

export const metadata: Metadata = {
  title: "Synapse",
  description: "Manage and deploy AI agents and tools",
  generator: "v0.app",
  icons: {
    icon: "/synapse-logo-light.png", 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <ApiDataProvider>
            {children}
          </ApiDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
