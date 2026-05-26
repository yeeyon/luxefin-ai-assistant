import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

export const dynamic = "force-dynamic"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Embed Chat Console",
  description: "Configurable embed AI chat with admin CRM",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen`}>{children}</body>
    </html>
  )
}
