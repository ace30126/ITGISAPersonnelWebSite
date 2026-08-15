import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { answerKey, clearAnswers, getAnswer, listAnswers, saveAnswer, setVote } from './cache';
import { WHY_TEMPLATE_ID } from './prompts';

const key = answerKey(WHY_TEMPLATE_ID, 'db-normalization');

describe('AI 응답 캐시(IndexedDB)', () => {
  beforeEach(async () => {
    await clearAnswers();
  });

  it('키는 (templateId, conceptId) 조합이다 — 템플릿을 고치면 캐시가 자연히 갈린다', () => {
    expect(key).toBe('why-v1:db-normalization');
    expect(answerKey('why-v2', 'db-normalization')).not.toBe(key);
  });

  it('저장한 답변을 그대로 돌려준다(두 번째부터는 호출이 필요 없다)', async () => {
    await saveAnswer(key, '### ① 한 줄 요약\n정규화는…');
    const row = await getAnswer(key);
    expect(row?.body).toContain('정규화는');
    expect(row?.ts).toBeGreaterThan(0);
  });

  it('없는 키는 undefined', async () => {
    expect(await getAnswer('why-v1:없는개념')).toBeUndefined();
  });

  it('같은 키로 다시 저장하면 덮어쓰고 행이 늘지 않는다', async () => {
    await saveAnswer(key, '첫 답변');
    await saveAnswer(key, '다시 생성한 답변');
    expect(await listAnswers()).toHaveLength(1);
    expect((await getAnswer(key))?.body).toBe('다시 생성한 답변');
  });

  it('투표를 저장하고, 같은 버튼을 다시 누르면 취소된다', async () => {
    await saveAnswer(key, 'x');
    await setVote(key, 1);
    expect((await getAnswer(key))?.vote).toBe(1);
    await setVote(key, -1);
    expect((await getAnswer(key))?.vote).toBe(-1);
    await setVote(key, undefined);
    expect((await getAnswer(key))?.vote).toBeUndefined();
  });

  it('없는 행에 투표해도 터지지 않는다', async () => {
    await expect(setVote('why-v1:유령', 1)).resolves.toBeUndefined();
  });

  it('캐시 비우기', async () => {
    await saveAnswer(key, 'a');
    await saveAnswer(answerKey(WHY_TEMPLATE_ID, 'ds-stack-queue'), 'b');
    expect(await listAnswers()).toHaveLength(2);
    await clearAnswers();
    expect(await listAnswers()).toHaveLength(0);
  });
});
