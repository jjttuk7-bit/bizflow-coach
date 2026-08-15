import OpenAI from 'openai';

/**
 * 모델은 코드에 고정하지 않고 환경변수로 뺀다 — 비용/품질 트레이드오프를
 * 재배포 없이 조정할 수 있어야 하기 때문이다.
 */
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

/** 사장님에게 그대로 보여줄 마크다운 답변을 생성한다. */
export async function callText(prompt: string): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error('AI가 빈 응답을 반환했습니다. 다시 시도해주세요.');
  return text;
}

/**
 * 코드가 소비할 구조화된 값을 생성한다.
 * Structured Outputs(strict)를 쓰면 스키마를 벗어난 응답이 원천 차단되므로,
 * Gemini 시절 필요했던 JSON.parse 실패 대비 로직이 사실상 불필요해진다.
 * 다만 파싱 자체는 여전히 방어적으로 감싼다.
 */
export async function callJson<T>(
  prompt: string,
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: { name: schemaName, schema, strict: true },
    },
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error('AI가 빈 응답을 반환했습니다. 다시 시도해주세요.');

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('AI가 분석 결과를 잘못된 형식으로 반환했습니다. 다시 시도해주세요.');
  }
}

/** 모든 필드가 문자열이고 전부 필수인 스키마를 만든다 (strict 모드 요구사항). */
export function stringSchema(fields: string[]): Record<string, unknown> {
  return {
    type: 'object',
    properties: Object.fromEntries(fields.map((f) => [f, { type: 'string' }])),
    required: fields,
    additionalProperties: false,
  };
}
