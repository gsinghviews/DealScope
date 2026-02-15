import "./globals.css";

export const metadata = {
  title: "DealScope AI — Private Equity Deal Analysis",
  description:
    "Upload a CIM. Screen against your criteria, run deep dive analysis, and model LBO returns — powered by Claude.",
  openGraph: {
    title: "DealScope AI",
    description:
      "AI-powered private equity deal screening, analysis, and LBO modeling.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
