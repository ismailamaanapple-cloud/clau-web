import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/UserContext";
import { AuthProvider } from "@/lib/AuthContext";
import { Shell } from "@/components/Shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CLAU — Plan your path to FIRE",
  description: "Modern retirement planner with Monte Carlo simulations and portfolio projections.",
  // Edge-to-edge full-screen experience when added to the iOS home screen.
  appleWebApp: {
    capable: true,
    title: "CLAU",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the app paint under the notch / Dynamic Island and home indicator.
  viewportFit: "cover",
  // Matches --background so Safari's bars blend seamlessly into the app.
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          <UserProvider>
            <Shell>{children}</Shell>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
