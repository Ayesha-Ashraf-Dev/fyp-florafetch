export const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "digit", label: "One number", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "One special character (!@#$...)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/]/.test(p) },
] as const;

export function validatePassword(password: string): string | null {
  for (const req of PASSWORD_REQUIREMENTS) {
    if (!req.test(password)) return req.label;
  }
  return null;
}

export function getPasswordStrength(password: string): number {
  return PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
}
