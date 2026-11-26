import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/header";
import AmbientGlow from "@/components/ambient-glow";
import RedRibbon from "@/components/red-ribbon";
import SmoothScroll from "@/components/smooth-scroll";
import CommandPalette from "@/components/command-palette";
import ActiveSectionContextProvider from "@/context/active-section-context";
import Footer from "@/components/footer";
import ThemeSwitch from "@/components/theme-switch";
import ThemeContextProvider from "@/context/theme-context";
import { Toaster } from "react-hot-toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abhayv175.netlify.app"),
  title: "Abhay Verma | Personal Portfolio",
  description:
    "Abhay Verma is a Software Developer and QA engineer with 2 years of experience.",
  openGraph: {
    title: "Abhay Verma | Personal Portfolio",
    description:
      "Abhay Verma is a Software Developer and QA engineer with 2 years of experience.",
    url: "/",
    type: "website",
    siteName: "Abhay Verma Portfolio",
    images: [
      {
        url: "/hero_dark.png",
        width: 1024,
        height: 1024,
        alt: "Abhay Verma | Personal Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abhay Verma | Personal Portfolio",
    description:
      "Abhay Verma is a Software Developer and QA engineer with 2 years of experience.",
    images: ["/hero_dark.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark min-h-[100dvh] w-full ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className="font-sans relative min-h-[100dvh] w-full bg-transparent text-gray-950 dark:text-gray-50 overflow-x-clip"
      >
        <ThemeContextProvider>
          <SmoothScroll>
            <AmbientGlow />
            <RedRibbon />

            <ActiveSectionContextProvider>
              <Header />
              {children}
              <Footer />

              <Toaster position="top-right" />
              <ThemeSwitch />
              <CommandPalette />
            </ActiveSectionContextProvider>
          </SmoothScroll>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
