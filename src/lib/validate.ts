/** Shared by the app and the API, so both reject the same input. */
export interface AccountInput {
  fullName: string;
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAccount(input: AccountInput): Partial<Record<keyof AccountInput, string>> {
  const errors: Partial<Record<keyof AccountInput, string>> = {};
  if (input.fullName.trim().split(/\s+/).filter(Boolean).length < 2) errors.fullName = 'Enter your first and last name';
  if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid email';
  return errors;
}
