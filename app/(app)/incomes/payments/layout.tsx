import { PaymentsProvider } from "./PaymentsProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PaymentsProvider>{children}</PaymentsProvider>;
}
