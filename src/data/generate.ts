import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

interface GeneratedEntry {
  id: string;
  timestamp: string;
  model: string;
  status: 200 | 429 | 500;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  cost_usd: number;
}

const MODELS = ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  "claude-3-sonnet": { input: 0.003, output: 0.015 },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEntry(index: number): GeneratedEntry {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const timestamp = new Date(
    now - Math.random() * thirtyDaysMs
  ).toISOString();

  const model = randomChoice(MODELS);

  // 85% success, 10% rate limited, 5% server error
  const roll = Math.random();
  const status: 200 | 429 | 500 =
    roll < 0.85 ? 200 : roll < 0.95 ? 429 : 500;

  const input_tokens = randomInt(50, 4000);
  const output_tokens = status === 200 ? randomInt(20, 2000) : 0;

  // Latency depends on model and status
  let baseLatency: number;
  if (status === 429) {
    baseLatency = randomInt(5, 50);
  } else if (status === 500) {
    baseLatency = randomInt(100, 500);
  } else {
    const modelLatencies: Record<string, [number, number]> = {
      "gpt-4": [500, 5000],
      "gpt-3.5-turbo": [100, 1500],
      "claude-3-opus": [600, 6000],
      "claude-3-sonnet": [200, 2000],
    };
    const [min, max] = modelLatencies[model];
    baseLatency = randomInt(min, max);
  }

  const costs = MODEL_COSTS[model];
  const cost_usd =
    status === 200
      ? parseFloat(
          (
            (input_tokens / 1000) * costs.input +
            (output_tokens / 1000) * costs.output
          ).toFixed(6)
        )
      : 0;

  return {
    id: `req_${String(index).padStart(5, "0")}`,
    timestamp,
    model,
    status,
    input_tokens,
    output_tokens,
    latency_ms: baseLatency,
    cost_usd,
  };
}

function generate(): void {
  const entries: GeneratedEntry[] = [];
  for (let i = 0; i < 550; i++) {
    entries.push(generateEntry(i));
  }
  // Sort by timestamp descending
  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = join(__dirname, "../../public/data.json");
  writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log(`Generated ${entries.length} entries -> ${outPath}`);
}

generate();
