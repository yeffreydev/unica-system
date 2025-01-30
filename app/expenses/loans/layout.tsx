import { LoansProvider } from "./LoansProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LoansProvider>{children}</LoansProvider>;
}
