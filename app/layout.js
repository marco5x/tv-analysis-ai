import "./globals.css";

export const metadata = {
  title: "AT-AF CRYPTO",
  description: "Project for analysis of crypto assets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  );
}
