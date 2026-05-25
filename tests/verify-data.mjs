import fs from "node:fs";
import path from "node:path";

const dataPath = path.join(process.cwd(), "data", "phase1-regions.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const requiredSummaryKeys = [
  "capitalAreaPopulationShare",
  "capitalAreaGrdpShare",
  "depopulationAreaCount",
  "closedSchoolCount"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(data.meta, "meta 정보가 없습니다.");
assert(data.meta.status, "meta.status가 없습니다.");
assert(data.meta.baseYear, "meta.baseYear가 없습니다.");
assert(data.summary, "summary 정보가 없습니다.");
assert(Array.isArray(data.regions), "regions는 배열이어야 합니다.");
assert(data.regions.length === 17, "시도 데이터는 17개여야 합니다.");

for (const key of requiredSummaryKeys) {
  const item = data.summary[key];
  assert(item, `summary.${key}가 없습니다.`);
  assert(typeof item.label === "string", `summary.${key}.label은 문자열이어야 합니다.`);
  assert(typeof item.value === "number", `summary.${key}.value는 숫자여야 합니다.`);
  assert(typeof item.unit === "string", `summary.${key}.unit은 문자열이어야 합니다.`);
}

for (const region of data.regions) {
  assert(typeof region.code === "string", "region.code는 문자열이어야 합니다.");
  assert(typeof region.name === "string", "region.name은 문자열이어야 합니다.");
  assert(typeof region.isCapitalArea === "boolean", `${region.name}의 isCapitalArea는 boolean이어야 합니다.`);
  assert(typeof region.populationChangeRate === "number", `${region.name}의 populationChangeRate는 숫자여야 합니다.`);
  assert(typeof region.depopulationAreaCount === "number", `${region.name}의 depopulationAreaCount는 숫자여야 합니다.`);
  assert(typeof region.closedSchoolCount === "number", `${region.name}의 closedSchoolCount는 숫자여야 합니다.`);
}

const capitalAreaNames = data.regions
  .filter((region) => region.isCapitalArea)
  .map((region) => region.name)
  .sort();

assert(
  JSON.stringify(capitalAreaNames) === JSON.stringify(["경기", "서울", "인천"]),
  "수도권 지역은 서울, 인천, 경기여야 합니다."
);

console.log("Data verification passed.");
