import { CascaGestao } from "@/components/gestao/casca";
import { ProvedorGestao } from "@/components/gestao/provedor";

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <ProvedorGestao>
      <CascaGestao>{children}</CascaGestao>
    </ProvedorGestao>
  );
}
