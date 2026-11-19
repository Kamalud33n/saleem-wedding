import "./globals.css";
import VisualViewportSync from "@/components/VisualViewportSync";
import { IOS_CHROME_BOOT_SCRIPT } from "@/lib/visual-viewport";

export const metadata = {
  title: "Saleem & Barakkath — Nikkah Invitation",
  description:
    "You're invited to celebrate the Nikkah of Saleem & Barakkath. Open the envelope for ceremony details and to send your wishes.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f3d3e",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: IOS_CHROME_BOOT_SCRIPT,
          }}
        />
        <link
          rel="preload"
          as="image"
          href="/gallery/thumbnail.png"
          media="(max-width: 1023px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/gallery/thumbnail-desktop.png"
          media="(min-width: 1024px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href="/gallery/premium-wedding-envelope-reveal.mp4"
          media="(max-width: 1023px)"
          type="video/mp4"
        />
        <link
          rel="preload"
          as="video"
          href="/gallery/premium-wedding-envelope-reveal-desktop.mp4"
          media="(min-width: 1024px)"
          type="video/mp4"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root App Router layout, not a legacy pages/_document.js */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,500&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Cinzel:wght@500;600&family=Manrope:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-parchment text-ink font-body" suppressHydrationWarning>
        <div id="app-visual-frame" className="app-visual-frame" suppressHydrationWarning>
          <div id="app-scroll-region" className="app-scroll-region">
            {children}
          </div>
        </div>
        <VisualViewportSync />
      </body>
    </html>
  );
}
