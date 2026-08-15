#!/usr/bin/env node
/**
 * action 문자열 3중 일치 검사.
 *
 * 코치 하나가 registry(서버)와 coachApi(클라이언트)에 같은 문자열로 등록되어야 하는데,
 * 문자열 비교라서 TypeScript가 불일치를 잡지 못한다. 런타임에 400으로만 드러나므로
 * 정적으로 대조한다.
 *
 * 사용: node .claude/skills/coach-qa-checklist/scripts/check-actions.mjs
 * 종료 코드: 0 = 일치, 1 = 불일치
 *
 * 정규식으로 grep하지 말 것 — registry.ts에는 JSON 스키마 객체가 섞여 있어
 * 단순 `^  key:` 패턴이 properties/required/type까지 잡아낸다.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), 'utf8');

// registry: `export const actions` 이후 구간에서 `  key: (` 형태만 — 핸들러는 항상 화살표 함수다.
const registrySrc = read('api/_lib/registry.ts');
const actionsBlock = registrySrc.slice(registrySrc.indexOf('export const actions'));
const registryKeys = [...actionsBlock.matchAll(/^ {2}([a-zA-Z][a-zA-Z0-9]*):\s*\(/gm)].map((m) => m[1]);

// coachApi: 제네릭이 여러 줄에 걸칠 수 있으므로 [\s\S] 로 건너뛴다.
const clientSrc = read('services/coachApi.ts');
const clientKeys = [...clientSrc.matchAll(/callCoach<[\s\S]*?>\(\s*'([a-zA-Z][a-zA-Z0-9]*)'/g)].map((m) => m[1]);

const onlyRegistry = registryKeys.filter((k) => !clientKeys.includes(k));
const onlyClient = clientKeys.filter((k) => !registryKeys.includes(k));
const dupRegistry = registryKeys.filter((k, i) => registryKeys.indexOf(k) !== i);

console.log(`registry.ts : ${registryKeys.length}개`);
console.log(`coachApi.ts : ${clientKeys.length}개`);

let failed = false;

if (onlyRegistry.length) {
  console.error(`\n❌ registry에만 있음 (UI가 호출할 함수 없음): ${onlyRegistry.join(', ')}`);
  failed = true;
}
if (onlyClient.length) {
  console.error(`\n❌ coachApi에만 있음 (런타임 400 "알 수 없는 action"): ${onlyClient.join(', ')}`);
  failed = true;
}
if (dupRegistry.length) {
  console.error(`\n❌ registry에 중복 키 (뒤엣것이 앞엣것을 덮어씀): ${dupRegistry.join(', ')}`);
  failed = true;
}

if (!failed) console.log('\n✅ action 문자열 완전 일치');
process.exit(failed ? 1 : 0);
