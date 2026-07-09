export const metadata = {
  title: "Fintech Transfer — Junior Task",
  description: "Внутрішні P2P-перекази",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 640,
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        {children}
      </body>
    </html>
  );
}
