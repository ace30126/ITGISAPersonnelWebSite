// BYOK 키 보관. localStorage 뿐이고 서버로 나가지 않는다.
// (같은 브라우저를 쓰는 사람은 볼 수 있다는 점은 설정 화면에 명시한다)

import { LS_KEY, LS_SEND_ITEMS } from './constants';

function ls(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // 사파리 프라이빗 등에서 접근 자체가 던진다
    return null;
  }
}

export function getKey(): string {
  return ls()?.getItem(LS_KEY)?.trim() ?? '';
}

export function hasKey(): boolean {
  return getKey().length > 0;
}

export function setKey(k: string): void {
  const v = k.trim();
  if (v) ls()?.setItem(LS_KEY, v);
  else ls()?.removeItem(LS_KEY);
}

export function clearKey(): void {
  ls()?.removeItem(LS_KEY);
}

/** 화면에 그대로 띄우지 않는다. AIza…XyZ9 형태로만 보여준다. */
export function maskKey(k: string): string {
  if (k.length <= 8) return '•'.repeat(k.length);
  return `${k.slice(0, 4)}${'•'.repeat(Math.min(12, k.length - 8))}${k.slice(-4)}`;
}

/** 형식만 본다. 진짜 유효한지는 호출해 봐야 안다. */
export function looksLikeKey(k: string): boolean {
  return /^AIza[\w-]{20,}$/.test(k.trim());
}

/** 기출 문항 원문을 프롬프트에 실을지 — 저작권 때문에 기본 off. */
export function getSendItemText(): boolean {
  return ls()?.getItem(LS_SEND_ITEMS) === '1';
}

export function setSendItemText(on: boolean): void {
  if (on) ls()?.setItem(LS_SEND_ITEMS, '1');
  else ls()?.removeItem(LS_SEND_ITEMS);
}
