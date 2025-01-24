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
        <div id="chat-content"></div>
      </body>
    </html>
  );
}
