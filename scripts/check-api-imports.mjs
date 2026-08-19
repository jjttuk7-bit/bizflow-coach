#!/usr/bin/env node
/**
 * api/ 안의 상대 경로 import에 확장자가 붙어 있는지 검사한다.
 *
 * package.json이 "type": "module"이라 Vercel Functions는 ESM으로 실행된다.
 * ESM은 상대 경로 import에 확장자를 요구하는데, TypeScript는 moduleResolution:
 * "bundler" 설정에서 확장자 없는 import를 통과시킨다. 그래서 tsc도 vite build도
 * 모두 성공한 뒤 배포된 함수만 ERR_MODULE_NOT_FOUND로 죽는다 — 실제로 그렇게 됐다.
 *
 * 사용: node scripts/check-api-imports.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk('api').filter((f) => f.endsWith('.ts'));
const offenders = [];

for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    // import ... from './x'  /  export ... from '../y'  /  await import('./z')
    const m = line.match(/\bfrom\s+'(\.[^']*)'|\bimport\(\s*'(\.[^']*)'/);
    const spec = m?.[1] ?? m?.[2];
    if (spec && !/\.(js|mjs|cjs|json)$/.test(spec)) {
      offenders.push(`${file}:${i + 1}  ${spec}`);
    }
  });
}

if (offenders.length) {
  console.error('\n❌ api/ 의 상대 경로 import에 확장자가 없습니다 (ESM 런타임에서 실패합니다):\n');
  offenders.forEach((o) => console.error('   ' + o));
  console.error("\n   './_lib/registry' → './_lib/registry.js' 처럼 .js 를 붙이세요.");
  console.error('   (TypeScript가 .js → .ts 로 해석하므로 파일명을 바꿀 필요는 없습니다.)\n');
  process.exit(1);
}

console.log(`✅ api/ import 확장자 검사 통과 (${files.length}개 파일)`);
