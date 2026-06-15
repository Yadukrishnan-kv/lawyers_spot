import { AdminShell } from '@/components/admin/admin-shell';
import { SettingsProvider } from '@/components/admin/settings/settings-context';
import { SettingsLayoutBody } from '@/components/admin/settings/settings-layout-body';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const cms = await getAdminCmsData();

  return (
    <AdminShell
      title="Settings"
      subtitle="General, email, payments, and messaging integrations"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
    >
      <SettingsProvider initial={cms}>
        <SettingsLayoutBody>{children}</SettingsLayoutBody>
      </SettingsProvider>
    </AdminShell>
  );
}
