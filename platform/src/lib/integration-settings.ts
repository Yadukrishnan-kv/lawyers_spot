import type { IntegrationSettings } from '@/lib/cms/types';

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  email: {
    enabled: false,
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: 'noreply@lawyerspot.com',
    fromName: 'LawyerSpot',
  },
  payment: {
    enabled: false,
    provider: 'razorpay',
    currency: 'INR',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    testMode: true,
  },
  twilio: {
    enabled: false,
    accountSid: '',
    authToken: '',
    fromNumber: '',
    messagingServiceSid: '',
  },
};

export function mergeIntegrationSettings(raw?: Partial<IntegrationSettings> | null): IntegrationSettings {
  const base = DEFAULT_INTEGRATION_SETTINGS;
  if (!raw) return base;
  return {
    email: { ...base.email, ...raw.email },
    payment: { ...base.payment, ...raw.payment },
    twilio: { ...base.twilio, ...raw.twilio },
  };
}
