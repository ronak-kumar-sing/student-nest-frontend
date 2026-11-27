import type { Metadata } from "next";
import { Bricolage_Grotesque, Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader, SiteFooter } from "@/components/site";
import { cn } from "@/lib/utils";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const atkinsonHyperlegibleNext = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  // Next has no metric overrides for this family yet; skip the generated fallback.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    template: "%s | Student Nest",
    default: "Student Nest: rooms near your college, straight from the owner",
  },
  description:
    "Find rooms and PGs near your college in Indore, Bhopal and Pune, listed directly by their owners. No brokers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={cn(
        "h-full",
        "antialiased",
        bricolageGrotesque.variable,
        atkinsonHyperlegibleNext.variable
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:border focus:border-hairline focus:bg-paper focus:px-3 focus:py-1.5 focus:text-sm focus:text-ink focus:shadow-md focus:outline-2 focus:outline-ballpoint"
        >
          Skip to main content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
