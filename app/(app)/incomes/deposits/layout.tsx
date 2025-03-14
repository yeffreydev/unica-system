import { DepositProvider } from "./DepositProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DepositProvider>{children}</DepositProvider>;
}
