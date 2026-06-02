import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportHtml = path.join(repoRoot, "docs", "final-report.html");
const reportPdf = path.join(repoRoot, "docs", "final-report.pdf");

const chromeCandidates = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error("Chrome 또는 Chromium 실행 파일을 찾을 수 없습니다. CHROME_BIN을 지정해 주세요.");
  process.exit(1);
}

if (!existsSync(reportHtml)) {
  console.error(`보고서 HTML 파일을 찾을 수 없습니다: ${reportHtml}`);
  process.exit(1);
}

await mkdir(path.dirname(reportPdf), { recursive: true });

const result = spawnSync(
  chrome,
  [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${reportPdf}`,
    pathToFileURL(reportHtml).href
  ],
  {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe"
  }
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "PDF 생성 중 알 수 없는 오류가 발생했습니다.");
  process.exit(result.status || 1);
}

const pdfStat = statSync(reportPdf);

if (pdfStat.size < 50_000) {
  console.error(`생성된 PDF 크기가 비정상적으로 작습니다: ${pdfStat.size} bytes`);
  process.exit(1);
}

console.log(`Final report PDF generated: ${path.relative(repoRoot, reportPdf)} (${pdfStat.size} bytes)`);
