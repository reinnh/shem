import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volunteer Registration | Team Hon. Shemaiah Kong'ani 2027 - 2028",
  description: "Official volunteer mobilization portal for Matungu Constituency (2027 - 2028). Join hands for development, transparency and empowerment.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f6f8] text-[#111827] antialiased selection:bg-[#0071e3]/15">
        {children}
      </body>
    </html>
  );
}

