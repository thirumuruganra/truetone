import type { Metadata } from "next";
import Script from "next/script";
import { Alegreya, Alegreya_Sans } from "next/font/google";
import "./globals.css";

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const themeScript = `
  (() => {
    const storageKey = "truetone-theme";
    const root = document.documentElement;
    const stored = window.localStorage.getItem(storageKey);
    const theme = stored === "dark" ? "dark" : "light";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  })();
`;

export const metadata: Metadata = {
  title: "TrueTone",
  description: "A warm editorial workspace for shaping LinkedIn posts around your own voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${alegreyaSans.variable} ${alegreya.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="truetone-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
