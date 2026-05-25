import fs from "node:fs";
import path from "node:path";

const dataPath = path.join(process.cwd(), "data", "phase1-regions.json");
const mapPath = path.join(process.cwd(), "data", "skorea-provinces-2018-topo-simple.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const topology = JSON.parse(fs.readFileSync(mapPath, "utf8"));

const requiredSummaryKeys = [
  "capitalAreaPopulationShare",
  "capitalAreaGrdpShare",
  "depopulationAreaCount",
  "closedSchoolCount"
];

const mapCodeByRegionCode = {
  "KR-11": "11",
  "KR-26": "21",
  "KR-27": "22",
  "KR-28": "23",
  "KR-29": "24",
  "KR-30": "25",
  "KR-31": "26",
  "KR-50": "29",
  "KR-41": "31",
  "KR-42": "32",
  "KR-43": "33",
  "KR-44": "34",
  "KR-45": "35",
  "KR-46": "36",
  "KR-47": "37",
  "KR-48": "38",
  "KR-49": "39"
};

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

assert(topology.type === "Topology", "지도 파일은 TopoJSON Topology여야 합니다.");
assert(topology.objects.skorea_provinces_2018_geo, "시도 지도 object가 없습니다.");

const mapGeometries = topology.objects.skorea_provinces_2018_geo.geometries;
assert(mapGeometries.length === 17, "지도 시도 경계는 17개여야 합니다.");

const mapCodes = new Set(mapGeometries.map((geometry) => geometry.properties.code));

for (const region of data.regions) {
  const mapCode = mapCodeByRegionCode[region.code];
  assert(mapCode, `${region.code}에 대응하는 지도 코드가 없습니다.`);
  assert(mapCodes.has(mapCode), `${region.name}에 대응하는 지도 경계가 없습니다.`);
}

console.log("Data verification passed.");
