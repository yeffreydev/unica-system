import { StockProvider } from "./StockContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StockProvider>{children}</StockProvider>;
}
