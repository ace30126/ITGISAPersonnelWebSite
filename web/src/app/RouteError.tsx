import { Link, useRouteError } from 'react-router-dom';

/** 라우트 내부에서 던져진 예외(주로 lazy 청크 로드 실패·데이터 오류)를 잡는다. */
export default function RouteError() {
  const err = useRouteError();
  const msg = err instanceof Error ? err.message : String(err ?? '알 수 없는 오류');

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-3 text-lg font-bold">화면을 여는 중 문제가 생겼습니다</h1>
      <p className="mt-2 break-words text-sm text-[color:var(--fg-dim)]">{msg}</p>
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" className="btn-ghost" onClick={() => location.reload()}>
          새로고침
        </button>
        <Link to="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    </div>
  );
}
