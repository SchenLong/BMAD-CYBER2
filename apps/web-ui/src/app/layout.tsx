import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google"
import "./globals.css"
import "../styles/theme.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"

// Font configurations per UI Design System
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
})

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: 'swap',
  weight: ["500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "BMAD - Mission Orchestration Platform",
  description: "Abdul Orchestrates. You Command. Sophisticated mission orchestration platform for cybersecurity professionals.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <ThemeProvider defaultTheme="dark">
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
