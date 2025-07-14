import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import { SearchProviderProvider } from "../contexts/SearchProviderContext";
import { BackgroundProvider } from "../contexts/BackgroundContext";
import ConditionalLayout from "../components/layout/ConditionalLayout";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Perplexity",
  description: "Ask anything",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${spaceGrotesk.variable} font-sans antialiased`}
          style={{ backgroundColor: '#fcfcf9' }}
        >
          <SearchProviderProvider>
            <BackgroundProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </BackgroundProvider>
          </SearchProviderProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}