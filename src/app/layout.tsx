import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vectra",
    template: "%s · Vectra",
  },
  description:
    "Industrial Monitoring — Downtime response and signed shift handoffs for manufacturing plants.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
    shortcut: ["/logo.png"],
  },
  openGraph: {
    title: "Vectra",
    description:
      "Downtime response and signed shift handoffs for manufacturing plants. AI alert briefs and Solana record attestation.",
    images: ["/logo.png"],
  },
};

const themeInit = `
(function(){
  try {
    var t = localStorage.getItem('vectra_theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.classList.add(t);
    document.documentElement.style.colorScheme = t;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
