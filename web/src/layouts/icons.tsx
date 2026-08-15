// 아이콘 — 라이브러리를 더 붙이지 않는다. 셸이 쓰는 건 이 여덟 개가 전부다.
// stroke 를 currentColor 로 두어 활성 탭 색이 그대로 먹는다.

import type { ReactNode, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;
type P = IconProps;

function Base({ children, ...p }: P & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...p}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20h13V9.5" />
  </Base>
);

export const BookIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 4.5h6a2.5 2.5 0 0 1 2.5 2.5v13A2 2 0 0 0 10.5 18H4z" />
    <path d="M20 4.5h-6A2.5 2.5 0 0 0 11.5 7v13A2 2 0 0 1 13.5 18H20z" />
  </Base>
);

export const PenIcon = (p: P) => (
  <Base {...p}>
    <path d="M15.5 4.5 19.5 8.5 8.5 19.5 4 21l1.5-4.5z" />
    <path d="m14 6 4 4" />
  </Base>
);

export const ClockIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const FlagIcon = (p: P) => (
  <Base {...p}>
    <path d="M5.5 21V4" />
    <path d="M5.5 5h11l-2 3.5 2 3.5h-11" />
  </Base>
);

export const ChartIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 20h16" />
    <path d="M7 20v-6M12 20V6M17 20v-9" />
  </Base>
);

export const GearIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.4-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.4a7 7 0 0 0 0 2.4l-2 1.4 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.4c.06-.4.1-.8.1-1.2Z" />
  </Base>
);

export const ChevronIcon = (p: P) => (
  <Base {...p}>
    <path d="m9 5 7 7-7 7" />
  </Base>
);
