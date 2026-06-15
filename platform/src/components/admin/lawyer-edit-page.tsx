'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CmsData, Lawyer } from '@/lib/cms/types';
import { slugifyName } from '@/lib/lawyer-slug';
import { SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { applyPlanEntitlementsToLawyer } from '@/lib/subscription-features';
import { LawyerProfileEditor } from '@/components/admin/lawyer-profile-editor';
import { VerificationBadges } from '@/components/lawyer/verification-badges';

type Props = {
  initial: CmsData;
  lawyer: Lawyer;
  isNew?: boolean;
};

export function LawyerEditPage({ initial, lawyer: initialLawyer, isNew = false }: Props) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [lawyer, setLawyer] = useState(initialLawyer);
  const { save, saving, message } = useCmsSave();

  async function handleSave() {
    const normalized = applyPlanEntitlementsToLawyer(
      {
        ...lawyer,
        slug: lawyer.slug?.trim() || slugifyName(lawyer.name),
      },
      cms.subscriptionPlans ?? [],
    );
    const exists = cms.lawyers.some((l) => l.id === normalized.id);
    const list = exists
      ? cms.lawyers.map((l) => (l.id === normalized.id ? normalized : l))
      : [...cms.lawyers, normalized];
    const next = { ...cms, lawyers: list };
    const ok = await save(next);
    if (ok) {
      setCms(next);
      router.push('/admin/lawyers');
      router.refresh();
    }
  }

  return (
    <div>
      <div className="card mb-3">
        <div className="card-body py-3">
          <p className="text-muted fs-12 mb-2">Verification status</p>
          <VerificationBadges lawyer={lawyer} size="md" layout="inline" />
        </div>
      </div>
      <LawyerProfileEditor
        lawyer={lawyer}
        cities={cms.cities}
        practiceAreas={cms.practiceAreas}
        subscriptionPlans={cms.subscriptionPlans}
        onChange={setLawyer}
        onCancel={() => router.push('/admin/lawyers')}
        onApply={handleSave}
      />
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
