import { RouterProvider } from 'react-router-dom';
import UnlockGate from '../features/unlock/UnlockGate';
import { router } from './router';

/**
 * 앱 루트.
 *
 * UnlockGate 가 RouterProvider **바깥**에 있는 게 핵심이다. 잠긴 상태에서는
 * 라우터 자체가 마운트되지 않으므로, 어떤 페이지도 loadIndex() 를 불러
 * "잠금 해제되지 않았다" 예외를 던질 수 없다.
 */
export default function App() {
  return (
    <UnlockGate>
      <RouterProvider router={router} />
    </UnlockGate>
  );
}
