import { FileStack } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader title="Templates" description="Marketplace e templates ficam para uma próxima fase." />
      <EmptyState
        icon={<FileStack className="w-5 h-5" />}
        title="Em breve"
        description="Marketplace de templates está fora do escopo do MVP. Por enquanto, opere o funil atual em Funis."
      />
    </>
  );
}
