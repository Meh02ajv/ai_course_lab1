import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "StudyBuddy AI — Smart Learning Assistant",
  description: "AI-powered note-taking, summarization, Q&A, and YouTube recommendations from your audio recordings.",
  keywords: ["AI", "study", "notes", "transcription", "summarization", "learning"],
  authors: [{ name: "StudyBuddy AI Team" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-950 text-dark-100 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#272521",
              border: "1px solid #e7e4de",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#0f172a" } },
          }}
        />
        {children}
      </body>
    </html>
  );
}