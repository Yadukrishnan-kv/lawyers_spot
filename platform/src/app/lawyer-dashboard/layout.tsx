import { LawyerDashboardShell } from '@/components/lawyer/lawyer-dashboard-shell';

export default function LawyerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <LawyerDashboardShell>{children}</LawyerDashboardShell>;
}
