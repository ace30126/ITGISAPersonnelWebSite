import { createContext, useContext } from 'react';

export interface UnlockApi {
  /** 저장된 패스프레이즈를 지우고 잠금 화면으로 되돌린다(설정 > 잠금 초기화). */
  relock: () => Promise<void>;
}

export const UnlockContext = createContext<UnlockApi | null>(null);

export function useUnlock(): UnlockApi {
  const v = useContext(UnlockContext);
  if (!v) throw new Error('useUnlock 은 UnlockGate 안에서만 쓸 수 있다.');
  return v;
}
