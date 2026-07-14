import type { Metadata } from "next";

import { StudyPlanCard } from "@/components/features/study/study-plan-card";
import { StudyTemplates } from "@/components/features/study/study-templates";
import { PageHeader } from "@/components/features/shell/page-header";
import { listStudyPlanOverviews } from "@/server/services/study";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Estudos",
};

export default async function EstudosPage() {
  const user = await requireUser();
  const plans = await listStudyPlanOverviews(user.id, new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        title={plans.length > 0 ? "Estudos" : "Criar Plano de Estudos"}
        description={
          plans.length > 0
            ? "Acompanhe sua agenda e registre sessões."
            : "Comece com um template pronto e ajuste depois."
        }
      />

      {plans.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <StudyPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      <StudyTemplates />
    </div>
  );
}
