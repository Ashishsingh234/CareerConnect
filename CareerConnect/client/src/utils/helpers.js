export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
export function roleRedirect(role) {
  if (role === 'candidate') return '/dashboard/candidate';
  if (role === 'company') return '/dashboard/company';
  if (role === 'hr') return '/dashboard/hr';
  return '/';
}