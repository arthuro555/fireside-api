import { Inter } from "next/font/google";

export const metadata = {
  title: "Fireside API",
  description:
    "The Fireside API is an exclusive API for members of the GameDev Fireside community.",
  category: "technology",
  keywords: ["api", "gamedev", "fireside", "discord", "community"],
  creator: "arthuro555",
  authors: [{ name: "arthuro555" }, { name: "Oxey405" }],
  robots: { index: true },
  twitter: { creator: "@arthuro555" },
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body {...inter}>
        <div style={{ maxWidth: "900px" }}>{children}</div>
      </body>
    </html>
  );
}
