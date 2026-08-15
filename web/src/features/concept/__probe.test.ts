// 임시 — 실데이터로 티어를 계산하고 프롬프트 전문을 찍어 본다. 보고 후 삭제.
import { readFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import type { LightItem } from '../../types';
import { buildWhyPrompt } from '../ai/prompts';
import { computeSubjectFreq, subjectItems, subjectWeight } from './freq';
import { rankRelated } from './match';
import { SAMPLE_CONCEPTS } from './sample';

const INDEX =
  'C:/Users/user/Desktop/정보처리기사_학습자료/gisa-study/pipeline/interim/shards/index/items.min.json';
const ITEMS = (s: number) =>
  `C:/Users/user/Desktop/정보처리기사_학습자료/gisa-study/pipeline/interim/shards/items/subject-${s}.json`;

describe('probe', () => {
  it('실데이터 티어', () => {
    const index = JSON.parse(readFileSync(INDEX, 'utf-8')) as LightItem[];
    const out: string[] = [];
    for (const c of SAMPLE_CONCEPTS) {
      const rows = computeSubjectFreq(SAMPLE_CONCEPTS, index, c.subject);
      const f = rows.find((r) => r.conceptId === c.id)!;
      const items = subjectItems(index, c.subject);
      out.push(
        `${c.id} (${c.subject}과목) score=${f.score.toFixed(1)} pinned=${f.pinned} auto=${f.auto} ` +
          `share=${(f.share * 100).toFixed(2)}% pct=${f.percentile} tier=${f.tier} ` +
          `missing=${JSON.stringify(f.missing)} | 과목 Σc=${subjectWeight(items)} n=${items.length}`,
      );
      const bodies = JSON.parse(readFileSync(ITEMS(c.subject), 'utf-8')) as {
        i: string;
        stem: string;
      }[];
      const stems = new Map(bodies.map((b) => [b.i, b.stem]));
      const rel = rankRelated(c, index, { stems, limit: 12 });
      for (const r of rel.filter((x) => x.source === 'auto').slice(0, 4)) {
        out.push(`   auto: ${r.id} score=${r.score.toFixed(1)} (${r.reason}) ${stems.get(r.id)?.slice(0, 40)}`);
      }
    }
    console.log('\n' + out.join('\n'));
  });

  it('why-v1 프롬프트 전문', () => {
    const p = buildWhyPrompt({ concept: SAMPLE_CONCEPTS[0] });
    console.log(
      `\n===== SYSTEM (${p.system.length}자) =====\n${p.system}\n` +
        `===== USER (${p.user.length}자, context ${p.contextChars}자, items ${p.includedItems}) =====\n${p.user}\n===== END =====`,
    );
    const optin = buildWhyPrompt({
      concept: SAMPLE_CONCEPTS[0],
      includeItems: true,
      items: [
        { id: 'q:2022-1:050', stem: '정규화 과정에서 함수 종속이 A → B이고 B → C일 때 A → C인 관계를 제거하는 단계는?' },
      ],
    });
    console.log(`\n===== USER (opt-in) =====\n${optin.user}\n===== END =====`);
  });
});
