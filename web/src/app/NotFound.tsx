import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <div className="py-16 text-center">
      <p className="text-4xl font-extrabold text-ink-600">404</p>
      <h1 className="mt-2 text-lg font-bold">없는 화면입니다</h1>
      <p className="mt-1 break-all text-sm text-[color:var(--fg-dim)]">{pathname}</p>
      <Link to="/" className="btn-primary mt-6">
        홈으로
      </Link>
    </div>
  );
}
