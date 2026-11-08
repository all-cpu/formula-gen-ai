import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://formulagen.ai"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FormulaGen AI",
    "url": "https://formulagen.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Build accurate Excel, WPS, and Google Sheets formulas instantly with structured fields.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html>
      <body>
        <LanguageProvider>
        <JsonLd data={webAppJsonLd} />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
