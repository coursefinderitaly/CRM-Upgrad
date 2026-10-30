// Shared lead/student lifecycle statuses used by the dashboard, lead panel,
// student profile and My Students sections.
export const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Counselling',
  'Interested',
  'Enrolled',
  'On Hold',
  'Drop',
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number];
