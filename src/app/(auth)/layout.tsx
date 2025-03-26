import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <div className="min-h-screen flex items-center justify-center">{children}</div>;
}
