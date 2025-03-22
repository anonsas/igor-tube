import type { ReactNode } from "react";
import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <HomeLayout>{children}</HomeLayout>;
}
