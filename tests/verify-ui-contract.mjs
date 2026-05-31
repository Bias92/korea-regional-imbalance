import fs from "node:fs";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "src", "index.html");
const appPath = path.join(process.cwd(), "src", "app.js");
const requirementsPath = path.join(process.cwd(), "docs", "requirements.md");

const html = fs.readFileSync(htmlPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
const requirements = fs.readFileSync(requirementsPath, "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredDomIds = [
  "summaryCards",
  "formulaPanel",
  "compareLeft",
  "compareRight",
  "strategyGrid",
  "closedSchoolChart",
  "schoolBriefGrid",
  "schoolNote",
  "dataQualityGrid",
  "regionalMap",
  "regionSearch",
  "regionAreaFilter",
  "regionSort",
  "regionList"
];

for (const id of requiredDomIds) {
  assert(html.includes(`id="${id}"`), `#${id} DOM id가 없습니다.`);
}

const scenarioButtonCount = (html.match(/data-risk-scenario="/g) || []).length;
assert(scenarioButtonCount === 4, "위험지수 시나리오 버튼은 4개여야 합니다.");

const mapMetricButtonCount = (html.match(/data-map-metric="/g) || []).length;
assert(mapMetricButtonCount === 4, "지도 지표 버튼은 4개여야 합니다.");

const schoolFilterButtonCount = (html.match(/data-school-filter="/g) || []).length;
assert(schoolFilterButtonCount === 4, "폐교 분석 필터 버튼은 4개여야 합니다.");

const requiredFunctions = [
  "renderFormulaPanel",
  "renderStrategyPanel",
  "setupSchoolClosureAnalysis",
  "renderClosedSchoolChart",
  "renderDataQuality",
  "setupRegionComparison",
  "setupRegionExplorer",
  "renderRegionalMap"
];

for (const functionName of requiredFunctions) {
  assert(app.includes(`function ${functionName}`), `${functionName} 함수가 없습니다.`);
}

for (const requirementId of ["FR-017", "FR-018", "FR-019", "FR-020", "FR-021"]) {
  assert(requirements.includes(requirementId), `${requirementId} 요구사항 추적이 없습니다.`);
}

console.log("UI contract verification passed.");
