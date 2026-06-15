import type { LucideIcon } from 'lucide-react';

const iconBg: Record<string, string> = {
  royal: 'bg-primary-transparent text-primary',
  emerald: 'bg-success-transparent text-success',
  amber: 'bg-warning-transparent text-warning',
  violet: 'bg-info-transparent text-info',
};

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent = 'royal',
}: {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  accent?: keyof typeof iconBg;
}) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex">
            <div>
              <p className="mb-1 text-muted">{label}</p>
              <h3 className="mb-1 number-font">{value}</h3>
              {change && <span className="text-success fs-12">{change}</span>}
            </div>
            <div className="ms-auto">
              <span
                className={`avatar avatar-lg brround d-flex align-items-center justify-content-center ${iconBg[accent]}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
