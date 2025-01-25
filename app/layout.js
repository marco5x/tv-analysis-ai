import Script from 'next/script'
import "./globals.css";


export const metadata = {
    title: "AT-AF CRYPTO",
    description: "Project for analysis of crypto assets",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <Script src="/static/datafeeds/udf/dist/bundle.js" />
            </head>
            <body className="overflow-hidden">
                {children}
            </body>
        </html>
    );
}
