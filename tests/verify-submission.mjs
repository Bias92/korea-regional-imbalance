import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertFile(relativePath, minBytes = 1) {
  const filePath = path.join(repoRoot, relativePath);
  assert(existsSync(filePath), `Missing required file: ${relativePath}`);

  const size = statSync(filePath).size;
  assert(size >= minBytes, `File is too small: ${relativePath} (${size} bytes)`);
}

function assertPng(relativePath, expectedWidth, expectedHeight) {
  const filePath = path.join(repoRoot, relativePath);
  assertFile(relativePath, 10_000);

  const buffer = readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  assert(signature === "89504e470d0a1a0a", `Invalid PNG signature: ${relativePath}`);

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert(width === expectedWidth, `Unexpected PNG width for ${relativePath}: ${width}`);
  assert(height === expectedHeight, `Unexpected PNG height for ${relativePath}: ${height}`);
}

assertFile("docs/final-report.html", 10_000);
assertFile("docs/final-report.pdf", 50_000);
assertPng("docs/assets/screenshots/2026-06-02-dashboard-capture.png", 1440, 1800);
assertPng("docs/assets/screenshots/2026-06-02-dashboard-mobile.png", 390, 1200);

const pdfHeader = readFileSync(path.join(repoRoot, "docs/final-report.pdf"), "utf8").slice(0, 4);
assert(pdfHeader === "%PDF", "Final report PDF header is invalid.");

const reportHtml = readText("docs/final-report.html");
assert(reportHtml.includes("프로세스에 입각한 바이브코딩의 효과 분석"), "Report title is missing.");
assert(reportHtml.includes("github.com/Bias92/korea-regional-imbalance"), "Repository URL is missing from report.");
assert(reportHtml.includes("2026-06-02-dashboard-capture.png"), "Desktop screenshot is missing from report.");
assert(reportHtml.includes("2026-06-02-dashboard-mobile.png"), "Mobile screenshot is missing from report.");

const evidence = readText("docs/submission-evidence.md");
assert(evidence.includes("docs/final-report.pdf"), "Submission evidence does not reference final-report.pdf.");
assert(evidence.includes("2026-06-02"), "Submission evidence does not include the latest evidence date.");

const readme = readText("README.md");
assert(readme.includes("npm run report:pdf"), "README does not document report PDF generation.");

console.log("Submission verification passed.");
