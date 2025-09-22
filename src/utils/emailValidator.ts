import domains from "disposable-email-domains";

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return domains.includes(domain);
}
