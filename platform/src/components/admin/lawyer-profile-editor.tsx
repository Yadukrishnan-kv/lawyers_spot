'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { Lawyer, LawyerReview, LawyerProfileFaq, SubscriptionPlan } from '@/lib/cms/types';
import { formatPlanPrice } from '@/lib/subscription';
import {
  applyPlanEntitlementsToLawyer,
  featureLabel,
  getPlanForLawyer,
  normalizeFeatureIds,
  planHasFeature,
} from '@/lib/subscription-features';
import { lawyerProfilePath } from '@/lib/lawyer-slug';
import { AdminInput } from '@/components/admin/cms-editor';
import { LawyerPhotoField } from '@/components/admin/lawyer-photo-field';

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(list: string[] | undefined): string {
  return (list ?? []).join('\n');
}

type Props = {
  lawyer: Lawyer;
  cities: { slug: string; name: string }[];
  practiceAreas: { slug: string; name: string }[];
  subscriptionPlans?: SubscriptionPlan[];
  onChange: (lawyer: Lawyer) => void;
  onCancel: () => void;
  onApply: () => void;
};

export function LawyerProfileEditor({
  lawyer,
  cities,
  practiceAreas,
  subscriptionPlans = [],
  onChange,
  onCancel,
  onApply,
}: Props) {
  const [section, setSection] = useState<'overview' | 'about' | 'experience' | 'reviews' | 'faq'>('overview');

  const update = (patch: Partial<Lawyer>) => onChange({ ...lawyer, ...patch });

  const activePlan = getPlanForLawyer(subscriptionPlans, lawyer);
  const planFeatures = normalizeFeatureIds(activePlan?.features);

  function changePlan(planId: string) {
    onChange(
      applyPlanEntitlementsToLawyer({ ...lawyer, subscriptionPlanId: planId }, subscriptionPlans),
    );
  }

  const sections = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'about' as const, label: 'About' },
    { id: 'experience' as const, label: 'Experience' },
    { id: 'reviews' as const, label: 'Reviews' },
    { id: 'faq' as const, label: 'FAQ' },
  ];

  return (
    <div className="card mt-4">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">Edit profile — {lawyer.name}</h3>
          <p className="text-muted mb-0 fs-12">All fields shown on the public lawyer profile page</p>
        </div>
        <Link
          href={lawyerProfilePath(lawyer)}
          target="_blank"
          className="btn btn-sm btn-outline-secondary"
        >
          <ExternalLink className="h-4 w-4 me-1 d-inline" />
          View live profile
        </Link>
      </div>
      <div className="card-body">
        <ul className="nav nav-tabs mb-4">
          {sections.map((s) => (
            <li key={s.id} className="nav-item">
              <button
                type="button"
                className={`nav-link ${section === s.id ? 'active' : ''}`}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        {section === 'overview' && (
          <div className="row g-3">
            <div className="col-md-3">
              <LawyerPhotoField
                lawyerId={lawyer.id}
                imageUrl={lawyer.image}
                onChange={(url) => update({ image: url })}
              />
            </div>
            <div className="col-md-9">
              <div className="row g-3">
                <div className="col-md-6">
                  <AdminInput label="Full name" value={lawyer.name} onChange={(v) => update({ name: v })} />
                </div>
                <div className="col-md-6">
                  <AdminInput
                    label="URL slug"
                    value={lawyer.slug ?? ''}
                    onChange={(v) => update({ slug: v })}
                  />
                </div>
                <div className="col-md-6">
                  <AdminInput label="Location" value={lawyer.location} onChange={(v) => update({ location: v })} />
                </div>
                <div className="col-md-6">
                  <AdminInput label="Address" value={lawyer.address ?? ''} onChange={(v) => update({ address: v })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City (for filters)</label>
                  <select
                    className="form-select"
                    value={lawyer.citySlug ?? ''}
                    onChange={(e) => update({ citySlug: e.target.value || undefined })}
                  >
                    <option value="">— Select city —</option>
                    {cities.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Practice area key</label>
                  <select
                    className="form-select"
                    value={lawyer.practice}
                    onChange={(e) => update({ practice: e.target.value })}
                  >
                    {practiceAreas.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <AdminInput label="Email" type="email" value={lawyer.email ?? ''} onChange={(v) => update({ email: v })} />
                </div>
                <div className="col-md-6">
                  <AdminInput label="Phone" value={lawyer.phone ?? ''} onChange={(v) => update({ phone: v })} />
                </div>
                <div className="col-12">
                  <div className="rounded border bg-light p-3">
                    <p className="fw-semibold mb-2 fs-13">Contact verification</p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-check mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={Boolean(lawyer.emailVerified)}
                            onChange={(e) => update({ emailVerified: e.target.checked })}
                          />
                          <span className="form-check-label">Email verified</span>
                        </label>
                      </div>
                      <div className="col-md-6">
                        <label className="form-check mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={Boolean(lawyer.phoneVerified)}
                            onChange={(e) => update({ phoneVerified: e.target.checked })}
                          />
                          <span className="form-check-label">Mobile number verified</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <AdminInput label="Law firm" value={lawyer.firm ?? ''} onChange={(v) => update({ firm: v })} />
                </div>
                <div className="col-md-4">
                  <AdminInput
                    label="Rating (1–5)"
                    type="number"
                    value={String(lawyer.rating)}
                    onChange={(v) => update({ rating: Number(v) || 0 })}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput
                    label="Review count"
                    type="number"
                    value={String(lawyer.reviews)}
                    onChange={(v) => update({ reviews: Number(v) || 0 })}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput
                    label="Experience (years)"
                    type="number"
                    value={String(lawyer.experience)}
                    onChange={(v) => update({ experience: Number(v) || 0 })}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput
                    label="Consultation fee"
                    type="number"
                    value={String(lawyer.fee ?? '')}
                    onChange={(v) => update({ fee: Number(v) || undefined })}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput label="Currency" value={lawyer.currency ?? 'INR'} onChange={(v) => update({ currency: v })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Specialization tags (header badges)</label>
                  <textarea
                    className="form-control font-monospace"
                    rows={2}
                    value={listToLines(lawyer.specialization)}
                    onChange={(e) => update({ specialization: linesToList(e.target.value) })}
                    placeholder="GST&#10;Income Tax&#10;Tax Appeals"
                  />
                  <p className="text-muted fs-12">One per line — shown under the lawyer name on the profile</p>
                </div>
                <div className="col-12">
                  <label className="form-label">Languages</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={listToLines(lawyer.languages)}
                    onChange={(e) => update({ languages: linesToList(e.target.value) })}
                    placeholder="English&#10;Hindi"
                  />
                </div>
                {subscriptionPlans.length > 0 && (
                  <div className="col-12">
                    <label className="form-label">Subscription plan</label>
                    <select
                      className="form-select"
                      value={lawyer.subscriptionPlanId ?? 'basic'}
                      onChange={(e) => changePlan(e.target.value)}
                    >
                      {subscriptionPlans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatPlanPrice(p)}
                        </option>
                      ))}
                    </select>
                    {planFeatures.length > 0 && (
                      <p className="text-muted fs-12 mt-2 mb-0">
                        Plan includes: {planFeatures.map(featureLabel).join(' · ')}
                      </p>
                    )}
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={lawyer.verified}
                      onChange={(e) => update({ verified: e.target.checked })}
                    />
                    <span className="form-check-label">Verified lawyer badge</span>
                  </label>
                </div>
                <div className="col-md-6">
                  <label className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={lawyer.online}
                      onChange={(e) => update({ online: e.target.checked })}
                    />
                    <span className="form-check-label">Show as online</span>
                  </label>
                </div>
                <div className="col-12">
                  <div className="rounded border bg-light p-3">
                    <p className="fw-semibold mb-2 fs-13">Plan-managed visibility</p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-check mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={Boolean(lawyer.topRated)}
                            disabled
                            readOnly
                          />
                          <span className="form-check-label">
                            Top Rated Lawyer
                            {!planHasFeature(activePlan, 'top_rated_badge') && (
                              <span className="text-muted d-block fs-11">
                                Requires &quot;Top Rated Lawyer badge&quot; on plan
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-muted fs-11 mb-0 mt-2">
                      Controlled by subscription plan — edit features under Admin → Subscriptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'about' && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">About (bio)</label>
              <textarea
                className="form-control"
                rows={4}
                value={lawyer.bio ?? ''}
                onChange={(e) => update({ bio: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Court practice (one per line)</label>
              <textarea
                className="form-control"
                rows={4}
                value={listToLines(lawyer.courts)}
                onChange={(e) => update({ courts: linesToList(e.target.value) })}
                placeholder="Telangana High Court&#10;GST Appellate Tribunal"
              />
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Education</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    update({
                      education: [...(lawyer.education ?? []), { degree: '', institution: '', year: '' }],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              {(lawyer.education ?? []).map((edu, i) => (
                <div key={i} className="row g-2 mb-2 align-items-end border rounded p-2">
                  <div className="col-md-4">
                    <AdminInput
                      label="Degree"
                      value={edu.degree}
                      onChange={(v) => {
                        const education = [...(lawyer.education ?? [])];
                        education[i] = { ...edu, degree: v };
                        update({ education });
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <AdminInput
                      label="Institution"
                      value={edu.institution}
                      onChange={(v) => {
                        const education = [...(lawyer.education ?? [])];
                        education[i] = { ...edu, institution: v };
                        update({ education });
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <AdminInput
                      label="Year"
                      value={edu.year}
                      onChange={(v) => {
                        const education = [...(lawyer.education ?? [])];
                        education[i] = { ...edu, year: v };
                        update({ education });
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        update({ education: (lawyer.education ?? []).filter((_, j) => j !== i) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(lawyer.education ?? []).length === 0 && (
                <p className="text-muted fs-12">No education entries — profile shows &quot;—&quot;</p>
              )}
            </div>
          </div>
        )}

        {section === 'experience' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Professional timeline</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  update({
                    timeline: [...(lawyer.timeline ?? []), { year: '', title: '', org: '' }],
                  })
                }
              >
                <Plus className="h-3 w-3" /> Add entry
              </button>
            </div>
            {(lawyer.timeline ?? []).map((t, i) => (
              <div key={i} className="row g-2 mb-2 align-items-end border rounded p-2">
                <div className="col-md-2">
                  <AdminInput
                    label="Year"
                    value={t.year}
                    onChange={(v) => {
                      const timeline = [...(lawyer.timeline ?? [])];
                      timeline[i] = { ...t, year: v };
                      update({ timeline });
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput
                    label="Title"
                    value={t.title}
                    onChange={(v) => {
                      const timeline = [...(lawyer.timeline ?? [])];
                      timeline[i] = { ...t, title: v };
                      update({ timeline });
                    }}
                  />
                </div>
                <div className="col-md-5">
                  <AdminInput
                    label="Organization"
                    value={t.org}
                    onChange={(v) => {
                      const timeline = [...(lawyer.timeline ?? [])];
                      timeline[i] = { ...t, org: v };
                      update({ timeline });
                    }}
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => update({ timeline: (lawyer.timeline ?? []).filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {(lawyer.timeline ?? []).length === 0 && (
              <p className="text-muted fs-12">Empty timeline uses default placeholder text on the public site.</p>
            )}
          </div>
        )}

        {section === 'reviews' && (
          <div>
            <p className="text-muted fs-12 mb-3">
              Client reviews shown on the profile. If empty, site default reviews are used until you add entries here.
            </p>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Client reviews</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  update({
                    clientReviews: [
                      ...(lawyer.clientReviews ?? []),
                      { author: '', rating: 5, text: '', date: '', verified: true },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3" /> Add review
              </button>
            </div>
            {(lawyer.clientReviews ?? []).map((r, i) => (
              <div key={i} className="border rounded p-3 mb-3">
                <div className="row g-2">
                  <div className="col-md-4">
                    <AdminInput
                      label="Author"
                      value={r.author}
                      onChange={(v) => patchReviews(lawyer, update, i, { author: v })}
                    />
                  </div>
                  <div className="col-md-2">
                    <AdminInput
                      label="Rating"
                      type="number"
                      value={String(r.rating)}
                      onChange={(v) => patchReviews(lawyer, update, i, { rating: Number(v) || 5 })}
                    />
                  </div>
                  <div className="col-md-4">
                    <AdminInput
                      label="Date"
                      value={r.date}
                      onChange={(v) => patchReviews(lawyer, update, i, { date: v })}
                    />
                  </div>
                  <div className="col-md-2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        update({ clientReviews: (lawyer.clientReviews ?? []).filter((_, j) => j !== i) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Review text</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={r.text}
                      onChange={(e) => patchReviews(lawyer, update, i, { text: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <AdminInput
                      label="Avatar URL"
                      value={r.avatar ?? ''}
                      onChange={(v) => patchReviews(lawyer, update, i, { avatar: v })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'faq' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Profile FAQ (accordion on public page)</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  update({
                    profileFaq: [
                      ...(lawyer.profileFaq ?? []),
                      { id: `faq-${Date.now()}`, question: '', answer: '' },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3" /> Add FAQ
              </button>
            </div>
            {(lawyer.profileFaq ?? []).map((f, i) => (
              <div key={f.id} className="border rounded p-3 mb-3">
                <div className="row g-2">
                  <div className="col-12">
                    <AdminInput
                      label="Question"
                      value={f.question}
                      onChange={(v) => patchFaq(lawyer, update, i, { question: v })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Answer</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={f.answer}
                      onChange={(e) => patchFaq(lawyer, update, i, { answer: e.target.value })}
                    />
                  </div>
                  <div className="col-12 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        update({ profileFaq: (lawyer.profileFaq ?? []).filter((_, j) => j !== i) })
                      }
                    >
                      Remove FAQ
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(lawyer.profileFaq ?? []).length === 0 && (
              <p className="text-muted fs-12">If empty, default consultation FAQs are shown on the profile.</p>
            )}
          </div>
        )}

        <div className="mt-4 d-flex gap-2 border-top pt-3">
          <button type="button" className="btn btn-primary" onClick={onApply}>
            Apply & save to database
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function patchReviews(
  lawyer: Lawyer,
  update: (patch: Partial<Lawyer>) => void,
  index: number,
  patch: Partial<LawyerReview>,
) {
  const clientReviews = [...(lawyer.clientReviews ?? [])];
  clientReviews[index] = { ...clientReviews[index], ...patch };
  update({ clientReviews });
}

function patchFaq(
  lawyer: Lawyer,
  update: (patch: Partial<Lawyer>) => void,
  index: number,
  patch: Partial<LawyerProfileFaq>,
) {
  const profileFaq = [...(lawyer.profileFaq ?? [])];
  profileFaq[index] = { ...profileFaq[index], ...patch };
  update({ profileFaq });
}
