import type { ReactNode } from "react";
import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return <StudioLayout>{children}</StudioLayout>;
}
