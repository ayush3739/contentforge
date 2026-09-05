import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContentForge AI — Internal Transformation Engine (SIH26154)",
  description: "Cross-platform communication artefact engine with verified provenance",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const stripAttrs = (el) => {
                      if (!el || !el.removeAttribute) return;
                      ['bis_skin_checked', 'bis_register', '__processed_'].forEach(attr => {
                        if (el.hasAttribute && el.hasAttribute(attr)) el.removeAttribute(attr);
                      });
                      if (el.getAttributeNames) {
                        el.getAttributeNames().forEach(name => {
                          if (name.startsWith('__processed_') || name.startsWith('bis_')) el.removeAttribute(name);
                        });
                      }
                    };
                    const observer = new MutationObserver(mutations => {
                      for (const m of mutations) {
                        if (m.type === 'attributes') stripAttrs(m.target);
                        else if (m.type === 'childList') {
                          m.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                              stripAttrs(node);
                              if (node.querySelectorAll) node.querySelectorAll('[bis_skin_checked], [bis_register]').forEach(stripAttrs);
                            }
                          });
                        }
                      }
                    });
                    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body
          className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
          suppressHydrationWarning
        >
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
