import { ICON_PATHS } from './icon-paths';

export const Icon = ({ name }: { name: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICON_PATHS[name as keyof typeof ICON_PATHS]} />
  </svg>
);
