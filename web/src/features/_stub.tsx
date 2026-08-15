// 팬아웃용 임시 자리표시자.
// 각 feature 에이전트가 자기 폴더의 페이지를 완성하면서 이 import 를 지운다.
// 스텁을 먼저 심어 두는 이유: B1 이 라우터를 짜는 시점에 다른 폴더가 비어 있으면
// 컴파일이 깨지고, 그 실패가 누구 책임인지 흐려진다.

export default function Stub({ name }: { name: string }) {
  return (
    <div className="p-6 text-center text-sm opacity-60">
      <p className="font-semibold">{name}</p>
      <p className="mt-1">아직 구현 전입니다.</p>
    </div>
  );
}
