// 라우팅 — createHashRouter.
//
// BrowserRouter 를 쓰지 않는 이유: GitHub Pages 는 정적 호스팅이라
// /gisa-study/exam 같은 딥링크에 404 를 준다(404.html 트릭은 새로고침마다
// 리다이렉트가 한 번 더 튄다). 해시 라우터는 그 문제가 원천적으로 없다.
//
// 페이지는 전부 React.lazy — 모의고사 화면 코드를 홈에서 받을 이유가 없다.

import { lazy } from 'react';
import type { ComponentType } from 'react';
import { Navigate, createHashRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import RouteError from './RouteError';
import NotFound from './NotFound';

/** lazy 컴포넌트를 element 로 쓰기 위한 헬퍼. Suspense 는 AppLayout 이 건다. */
function page(loader: () => Promise<{ default: ComponentType }>) {
  const C = lazy(loader);
  return <C />;
}

const children: RouteObject[] = [
  { index: true, element: page(() => import('./Dashboard')) },

  // 개념 — B2
  { path: 'subjects', element: <Navigate to="/subjects/1" replace /> },
  { path: 'subjects/:s', element: page(() => import('../features/concept/SubjectPage')) },
  { path: 'concepts/:id', element: page(() => import('../features/concept/ConceptPage')) },

  // 문제 풀이 — B2
  { path: 'practice', element: page(() => import('../features/practice/PracticePage')) },
  { path: 'practice/s/:sid', element: page(() => import('../features/practice/SessionPage')) },

  // 모의고사 — B4
  { path: 'exam', element: page(() => import('../features/exam/ExamPage')) },
  { path: 'exam/s/:sid', element: page(() => import('../features/exam/ExamSessionPage')) },
  { path: 'exam/r/:sid', element: page(() => import('../features/exam/ExamResultPage')) },

  // 진도 — B3
  { path: 'review', element: page(() => import('../features/progress/ReviewPage')) },
  { path: 'stats', element: page(() => import('../features/progress/StatsPage')) },

  // 설정 — 셸이 소유하고, AI 설정(B4)을 슬롯으로 끼운다
  { path: 'settings', element: page(() => import('./SettingsPage')) },

  { path: '*', element: <NotFound /> },
];

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    // 레이아웃 자체가 터졌을 때
    errorElement: <RouteError />,
    // 자식 라우트마다 같은 errorElement 를 달아 둔다. 이게 없으면 한 페이지의
    // 예외가 부모(=AppLayout)까지 올라가 탭바째 사라진다 — 사용자는 앱이
    // 죽은 줄 알고 껐다 켠다.
    children: children.map((r) => ({ errorElement: <RouteError />, ...r })),
  },
]);
