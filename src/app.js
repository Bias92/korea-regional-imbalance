const DATA_URL = "../data/phase1-regions.json";

const numberFormatter = new Intl.NumberFormat("ko-KR");

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

async function loadDashboard() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`데이터 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    renderSummary(data.summary);
    renderRegionList(data.regions);
    renderPopulationChart(data.regions);
    renderDataNote(data.meta);
  } catch (error) {
    renderLoadError(error);
  }
}

function renderSummary(summary) {
  const cards = [
    {
      key: "capitalAreaPopulationShare",
      caption: "서울·인천·경기 기준"
    },
    {
      key: "capitalAreaGrdpShare",
      caption: "경제활동 집중도 비교"
    },
    {
      key: "depopulationAreaCount",
      caption: "시군구 단위 지정 지역"
    },
    {
      key: "closedSchoolCount",
      caption: "전국 누적 폐교 수"
    }
  ];

  const container = document.querySelector("#summaryCards");
  container.innerHTML = cards.map((card) => {
    const item = summary[card.key];
    return `
      <article class="metric-card">
        <span class="metric-label">${item.label}</span>
        <div class="metric-value">
          <span class="metric-number">${formatNumber(item.value)}</span>
          <span class="metric-unit">${item.unit}</span>
        </div>
        <p class="metric-caption">${card.caption}</p>
      </article>
    `;
  }).join("");
}

function renderRegionList(regions) {
  const list = document.querySelector("#regionList");
  const decliningRegions = [...regions]
    .sort((a, b) => a.populationChangeRate - b.populationChangeRate)
    .slice(0, 6);

  list.innerHTML = decliningRegions.map((region) => {
    const rateClass = region.populationChangeRate < 0 ? "negative" : "positive";
    return `
      <div class="region-row">
        <span class="region-name">${region.name}</span>
        <span class="change-rate ${rateClass}">${formatRate(region.populationChangeRate)}</span>
        <span class="region-meta">인구감소지역 ${region.depopulationAreaCount}곳 · 폐교 ${numberFormatter.format(region.closedSchoolCount)}곳</span>
      </div>
    `;
  }).join("");
}

function renderPopulationChart(regions) {
  const canvas = document.querySelector("#populationChart");
  const labels = regions.map((region) => region.name);
  const values = regions.map((region) => region.populationChangeRate);
  const colors = regions.map((region) => {
    if (region.isCapitalArea) {
      return "#3465d9";
    }

    return region.populationChangeRate < 0 ? "#d85d4a" : "#21845a";
  });

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "인구 증감률",
          data: values,
          backgroundColor: colors,
          borderRadius: 5,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `증감률 ${formatRate(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#526158",
            maxRotation: 0,
            autoSkip: false
          }
        },
        y: {
          title: {
            display: true,
            text: "증감률(%)",
            color: "#526158"
          },
          grid: {
            color: "rgba(102, 116, 107, 0.18)"
          },
          ticks: {
            color: "#526158",
            callback: (value) => `${value}%`
          }
        }
      }
    }
  });
}

function renderDataNote(meta) {
  document.querySelector("#dataStatus").textContent = "임시 데이터";
  document.querySelector("#dataNote").textContent =
    `${meta.baseYear} · ${meta.warning}`;
}

function renderLoadError(error) {
  document.querySelector("#dataStatus").textContent = "로드 실패";
  document.querySelector("#summaryCards").innerHTML = `
    <article class="metric-card">
      <span class="metric-label">데이터를 불러오지 못했습니다</span>
      <p class="metric-caption">${error.message}</p>
    </article>
  `;
  document.querySelector("#dataNote").textContent =
    "정적 서버에서 src/index.html을 열었는지 확인하세요.";
}

function formatNumber(value) {
  return Number.isInteger(value) ? numberFormatter.format(value) : value.toFixed(1);
}

function formatRate(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
