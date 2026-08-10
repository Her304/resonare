// Single source of truth for the legal pages and the sign-up consent record.
//
// ⚠️ FILL THESE IN before launch — they appear verbatim in the published policies.
export const LEGAL = {
  entity: "[YOUR LEGAL ENTITY NAME]",
  contactEmail: "[YOUR CONTACT EMAIL]",
  privacyEmail: "[YOUR PRIVACY CONTACT EMAIL]",
  jurisdiction: "[YOUR COUNTRY / STATE]",
  address: "[YOUR REGISTERED ADDRESS]",
} as const;

// Bump when the substance of any policy changes. Recorded against each account
// in profiles.terms_version at sign-up, so you can tell who accepted what.
export const POLICY_VERSION = "2026-08-10";
export const POLICY_EFFECTIVE = "10 August 2026";

// Minimum age to hold an account. 13 is the common floor; the EEA/UK digital
// consent age is 16 in several member states.
export const MIN_AGE = 13;
