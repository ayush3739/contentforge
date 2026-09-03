import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContentForge AI — Internal Transformation Engine (SIH26154)",
  description: "Cross-platform communication artefact engine with verified provenance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_aG9uZXN0LWFpcmVkYWxlLTE3ODEuY2xlcmsuYWNjb3VudHMuZGV2JA"}
    >
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#090d16] text-slate-100 antialiased`}>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
