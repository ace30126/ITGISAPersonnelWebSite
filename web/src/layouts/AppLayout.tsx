// 앱 셸 레이아웃. 모바일 우선 — 실제 학습은 폰에서 일어난다.
//
//  · 폰(< md): 얇은 상단바 + 하단 탭바 5개. 세로 픽셀은 전부 문제에 양보한다.
//  · 데스크톱(≥ md): 같은 항목이 좌측 사이드바로 옮겨가고 하단 탭바는 사라진다.
//
// 가로 밀림 방지: flex 자식마다 min-w-0. 넘칠 수 있는 콘텐츠는 각 페이지가
// .scroll-x 컨테이너 안에 넣는다(styles/index.css).

import { Suspense } from 'react';
import type { ReactElement } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { IconProps } from './icons';
import {
  BookIcon,
  ChartIcon,
  ClockIcon,
  FlagIcon,
  GearIcon,
  HomeIcon,
  PenIcon,
} from './icons';

type Tab = {
  to: string;
  label: string;
  Icon: (p: IconProps) => ReactElement;
  /** 활성 판정용 접두사(자식 라우트 포함) */
  match: string[];
};

export const TABS: Tab[] = [
  { to: '/', label: '홈', Icon: HomeIcon, match: ['/'] },
  { to: '/subjects', label: '과목', Icon: BookIcon, match: ['/subjects', '/concepts'] },
  { to: '/practice', label: '풀이', Icon: PenIcon, match: ['/practice'] },
  { to: '/exam', label: '모의고사', Icon: ClockIcon, match: ['/exam'] },
  { to: '/review', label: '오답노트', Icon: FlagIcon, match: ['/review'] },
];

const TITLES: [prefix: string, title: string][] = [
  ['/subjects', '과목별 학습'],
  ['/concepts', '개념'],
  ['/practice', '문제 풀이'],
  ['/exam', '모의고사'],
  ['/review', '오답노트'],
  ['/stats', '통계'],
  ['/settings', '설정'],
];

function titleOf(pathname: string): string {
  for (const [prefix, title] of TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title;
  }
  return '정보처리기사 필기';
}

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.to === '/') return pathname === '/';
  return tab.match.some((m) => pathname === m || pathname.startsWith(m + '/'));
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = titleOf(pathname);

  return (
    <div className="min-h-[100svh] md:flex">
      {/* 데스크톱 사이드바 */}
      <aside className="sticky top-0 hidden h-[100svh] w-56 shrink-0 flex-col border-r border-ink-700 bg-ink-800/50 px-3 py-4 md:flex">
        <NavLink to="/" className="mb-4 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-ink-600 text-sm font-extrabold text-white">
            정
          </span>
          <span className="text-sm font-bold">정처기 필기</span>
        </NavLink>

        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={`flex min-h-tap items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                isActive(pathname, t)
                  ? 'bg-ink-700 text-accent-soft'
                  : 'text-[color:var(--fg-dim)] hover:bg-ink-700/50 hover:text-[color:var(--fg)]'
              }`}
            >
              <t.Icon className="h-5 w-5 shrink-0" />
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-ink-700 pt-2">
          <SideLink to="/stats" label="통계" Icon={ChartIcon} pathname={pathname} />
          <SideLink to="/settings" label="설정" Icon={GearIcon} pathname={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단바는 얇게. 화면 높이는 문제 몫이다. */}
        <header className="sticky top-0 z-20 flex min-w-0 items-center gap-2 border-b border-ink-700 bg-ink-900/85 px-3 backdrop-blur md:hidden">
          <h1 className="min-w-0 flex-1 truncate py-2.5 text-sm font-bold">{title}</h1>
          <NavLink
            to="/stats"
            aria-label="통계"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
          >
            <ChartIcon className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/settings"
            aria-label="설정"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
          >
            <GearIcon className="h-5 w-5" />
          </NavLink>
        </header>

        <main
          className="min-w-0 flex-1 px-4 py-4 md:px-6 md:py-6"
          style={{
            paddingBottom:
              'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 1rem)',
          }}
        >
          <div className="mx-auto w-full min-w-0 max-w-3xl">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* 하단 탭바 — 홈 인디케이터에 가리지 않게 safe-area 만큼 더 띄운다. */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ink-700 bg-ink-900/95 backdrop-blur md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="주요 메뉴"
        >
          {TABS.map((t) => {
            const active = isActive(pathname, t);
            return (
              <NavLink
                key={t.to}
                to={t.to}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-tap flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold ${
                  active ? 'text-accent' : 'text-[color:var(--fg-dim)]'
                }`}
              >
                <t.Icon className="h-5 w-5" />
                <span className="leading-none">{t.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SideLink({
  to,
  label,
  Icon,
  pathname,
}: {
  to: string;
  label: string;
  Icon: (p: IconProps) => ReactElement;
  pathname: string;
}) {
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      className={`flex min-h-tap items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
        active
          ? 'bg-ink-700 text-accent-soft'
          : 'text-[color:var(--fg-dim)] hover:bg-ink-700/50 hover:text-[color:var(--fg)]'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </NavLink>
  );
}

/** 코드 스플리팅으로 페이지 청크를 받는 동안 보이는 자리표시자. */
export function PageSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="불러오는 중">
      <div className="skeleton h-7 w-2/5" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-16 w-3/4" />
    </div>
  );
}
