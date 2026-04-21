import type { Metadata, Viewport } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import { ThemeProvider } from "@/shared/ui/theme-provider"
import { DensityProvider } from "@/shared/ui/density-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "budFin",
  description: "Controle de dívidas sem estresse",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-light.svg", type: "image/svg+xml" },
      { url: "/icons/icon-light-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-light-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-light-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-light-192.png", sizes: "192x192" },
      { url: "/icons/icon-light-512.png", sizes: "512x512" },
    ],
    shortcut: "/icons/icon-light-96.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "budFin",
    startupImage: "/icons/icon-light-512.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)",  color: "#14120e" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrumentSerif.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DensityProvider>
            {children}
          </DensityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
