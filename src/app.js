const DATA_URL = "../data/phase1-regions.json";
const MAP_URL = "../data/skorea-provinces-2018-topo-simple.json";
const MAP_OBJECT_NAME = "skorea_provinces_2018_geo";

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

const riskScenarioConfigs = {
  balanced: {
    label: "균형",
    note: "인구 감소 40%, 인구감소지역 35%, 폐교 수 25%를 반영합니다.",
    weights: {
      decline: 0.4,
      depopulation: 0.35,
      closedSchools: 0.25
    }
  },
  population: {
    label: "인구감소 중심",
    note: "인구 감소 70%, 인구감소지역 20%, 폐교 수 10%를 반영합니다.",
    weights: {
      decline: 0.7,
      depopulation: 0.2,
      closedSchools: 0.1
    }
  },
  depopulation: {
    label: "소멸위험 중심",
    note: "인구 감소 25%, 인구감소지역 55%, 폐교 수 20%를 반영합니다.",
    weights: {
      decline: 0.25,
      depopulation: 0.55,
      closedSchools: 0.2
    }
  },
  schools: {
    label: "폐교 중심",
    note: "인구 감소 20%, 인구감소지역 25%, 폐교 수 55%를 반영합니다.",
    weights: {
      decline: 0.2,
      depopulation: 0.25,
      closedSchools: 0.55
    }
  }
};

const riskFormulaFactors = [
  {
    key: "decline",
    label: "인구 감소",
    className: "decline"
  },
  {
    key: "depopulation",
    label: "인구감소지역",
    className: "depopulation"
  },
  {
    key: "closedSchools",
    label: "폐교 수",
    className: "schools"
  }
];

const mapMetricConfigs = {
  riskIndex: {
    title: "지역 위험지수 지도",
    detailLabel: "위험지수",
    format: (value) => `${Math.round(value)}점`,
    legend: [
      { className: "neutral", label: "낮음" },
      { className: "flat", label: "주의" },
      { className: "decline", label: "높음" },
      { className: "severe", label: "매우 높음" }
    ],
    color: (value) => {
      if (value < 35) {
        return "#b8c3bd";
      }

      if (value < 55) {
        return "#e5b85c";
      }

      if (value < 75) {
        return "#d85d4a";
      }

      return "#b84336";
    },
    value: (region) => region.riskIndex
  },
  populationChangeRate: {
    title: "시도별 인구 증감 지도",
    detailLabel: "인구 증감률",
    format: (value) => formatRate(value),
    legend: [
      { className: "severe", label: "-2% 이하" },
      { className: "decline", label: "-2% ~ 0%" },
      { className: "flat", label: "0% ~ 1%" },
      { className: "growth", label: "1% 이상" }
    ],
    color: (value) => {
      if (value <= -2) {
        return "#b84336";
      }

      if (value < 0) {
        return "#d85d4a";
      }

      if (value < 1) {
        return "#e5b85c";
      }

      return "#21845a";
    },
    value: (region) => region.populationChangeRate
  },
  depopulationAreaCount: {
    title: "인구감소지역 분포 지도",
    detailLabel: "인구감소지역",
    format: (value) => `${numberFormatter.format(value)}곳`,
    legend: [
      { className: "neutral", label: "0곳" },
      { className: "flat", label: "1~5곳" },
      { className: "decline", label: "6~10곳" },
      { className: "severe", label: "11곳 이상" }
    ],
    color: (value) => {
      if (value === 0) {
        return "#b8c3bd";
      }

      if (value <= 5) {
        return "#e5b85c";
      }

      if (value <= 10) {
        return "#d85d4a";
      }

      return "#b84336";
    },
    value: (region) => region.depopulationAreaCount
  },
  closedSchoolCount: {
    title: "시도별 폐교 수 지도",
    detailLabel: "폐교 수",
    format: (value) => `${numberFormatter.format(value)}곳`,
    legend: [
      { className: "neutral", label: "50곳 이하" },
      { className: "flat", label: "51~300곳" },
      { className: "decline", label: "301~500곳" },
      { className: "severe", label: "501곳 이상" }
    ],
    color: (value) => {
      if (value <= 50) {
        return "#b8c3bd";
      }

      if (value <= 300) {
        return "#e5b85c";
      }

      if (value <= 500) {
        return "#d85d4a";
      }

      return "#b84336";
    },
    value: (region) => region.closedSchoolCount
  }
};

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
    const regions = data.regions.map((region) => ({ ...region }));
    applyRiskScenario(regions, riskScenarioConfigs.balanced.weights);
    renderSummary(data.summary);
    renderFormulaPanel(riskScenarioConfigs.balanced);
    renderInsightPanel(regions);
    const compareController = setupRegionComparison(regions);
    renderRegionList(regions);
    renderPopulationChart(regions);
    let mapController = null;

    try {
      mapController = await renderRegionalMap(regions);
    } catch (error) {
      renderMapError(error);
    }

    setupRiskScenarioControls(regions, mapController, compareController);
    renderDataNote(data.meta);
  } catch (error) {
    renderLoadError(error);
  }
}

function applyRiskScenario(regions, weights) {
  const maxDecline = Math.max(...regions.map((region) => Math.max(0, -region.populationChangeRate)));
  const maxDepopulation = Math.max(...regions.map((region) => region.depopulationAreaCount));
  const maxClosedSchools = Math.max(...regions.map((region) => region.closedSchoolCount));

  regions.forEach((region) => {
    const declineScore = maxDecline === 0 ? 0 : Math.max(0, -region.populationChangeRate) / maxDecline;
    const depopulationScore = maxDepopulation === 0 ? 0 : region.depopulationAreaCount / maxDepopulation;
    const closedSchoolScore = maxClosedSchools === 0 ? 0 : region.closedSchoolCount / maxClosedSchools;
    const riskIndex = Math.round((
      declineScore * weights.decline +
      depopulationScore * weights.depopulation +
      closedSchoolScore * weights.closedSchools
    ) * 100);

    region.riskIndex = riskIndex;
    region.riskGrade = getRiskGrade(riskIndex);
    region.riskComponents = {
      declineScore,
      depopulationScore,
      closedSchoolScore
    };
  });
}

function setupRiskScenarioControls(regions, mapController, compareController) {
  document.querySelectorAll("[data-risk-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = riskScenarioConfigs[button.dataset.riskScenario];

      applyRiskScenario(regions, scenario.weights);
      document.querySelectorAll("[data-risk-scenario]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelector("#scenarioNote").textContent = scenario.note;
      renderFormulaPanel(scenario);
      renderInsightPanel(regions, scenario);
      compareController.refresh();
      renderRegionList(regions);
      mapController?.refreshRiskDisplay();
    });
  });
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

function renderFormulaPanel(scenario) {
  const formulaText = document.querySelector("#formulaText");
  const formulaNote = document.querySelector("#formulaNote");
  const formulaBars = document.querySelector("#formulaBars");

  formulaText.textContent = `위험지수 = ${riskFormulaFactors
    .map((factor) => `${factor.label} ${formatWeight(scenario.weights[factor.key])}`)
    .join(" + ")}`;
  formulaNote.textContent = `${scenario.label} 기준입니다. 각 항목은 17개 시도 내 최댓값 대비 0~100으로 정규화한 뒤 가중합합니다.`;
  formulaBars.innerHTML = riskFormulaFactors.map((factor) => {
    const weight = scenario.weights[factor.key];
    return `
      <div class="formula-bar ${factor.className}">
        <span>${factor.label}</span>
        <strong>${formatWeight(weight)}</strong>
        <div class="formula-track" aria-hidden="true">
          <i style="width: ${formatWeight(weight)}"></i>
        </div>
      </div>
    `;
  }).join("");
}

function renderInsightPanel(regions, scenario = riskScenarioConfigs.balanced) {
  const topRiskRegion = getTopRegion(regions, "riskIndex");
  const topDeclineRegion = [...regions].sort((a, b) => a.populationChangeRate - b.populationChangeRate)[0];
  const topClosedSchoolRegion = getTopRegion(regions, "closedSchoolCount");
  const capitalAverage = getAverage(
    regions.filter((region) => region.isCapitalArea),
    "populationChangeRate"
  );
  const nonCapitalAverage = getAverage(
    regions.filter((region) => !region.isCapitalArea),
    "populationChangeRate"
  );
  const gap = capitalAverage - nonCapitalAverage;

  const cards = [
    {
      kicker: `${scenario.label} 기준`,
      title: `${topRiskRegion.name} ${topRiskRegion.riskIndex}점`,
      body: `${topRiskRegion.riskGrade} 등급입니다. 인구감소지역 ${topRiskRegion.depopulationAreaCount}곳, 폐교 ${numberFormatter.format(topRiskRegion.closedSchoolCount)}곳이 함께 잡힙니다.`
    },
    {
      kicker: "감소 신호",
      title: `${topDeclineRegion.name} ${formatRate(topDeclineRegion.populationChangeRate)}`,
      body: `17개 시도 중 인구 증감률이 가장 낮습니다. 지도에서 위험지수와 함께 보면 감소 폭과 지역 기반 지표를 같이 판단할 수 있습니다.`
    },
    {
      kicker: "격차 요약",
      title: `${gap.toFixed(1)}%p 차이`,
      body: `수도권 평균 증감률은 ${formatRate(capitalAverage)}, 비수도권 평균은 ${formatRate(nonCapitalAverage)}입니다. 폐교 수 최대 지역은 ${topClosedSchoolRegion.name}입니다.`
    }
  ];

  document.querySelector("#insightGrid").innerHTML = cards.map((card) => `
    <article class="insight-card">
      <span class="insight-kicker">${card.kicker}</span>
      <strong>${card.title}</strong>
      <p>${card.body}</p>
    </article>
  `).join("");
}

function setupRegionComparison(regions) {
  const leftSelect = document.querySelector("#compareLeft");
  const rightSelect = document.querySelector("#compareRight");
  const sortedRegions = [...regions].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  const topRiskRegion = getTopRegion(regions, "riskIndex");
  const defaultCapitalRegion = regions.find((region) => region.name === "경기") || regions.find((region) => region.isCapitalArea);

  const options = sortedRegions.map((region) => `<option value="${region.name}">${region.name}</option>`).join("");
  leftSelect.innerHTML = options;
  rightSelect.innerHTML = options;
  leftSelect.value = topRiskRegion.name;
  rightSelect.value = defaultCapitalRegion.name;

  const refresh = () => {
    const leftRegion = getRegionByName(regions, leftSelect.value);
    const rightRegion = getRegionByName(regions, rightSelect.value);
    renderRegionComparison(leftRegion, rightRegion);
  };

  leftSelect.addEventListener("change", refresh);
  rightSelect.addEventListener("change", refresh);
  refresh();

  return {
    refresh
  };
}

function renderRegionComparison(leftRegion, rightRegion) {
  const riskDiff = leftRegion.riskIndex - rightRegion.riskIndex;
  const populationDiff = leftRegion.populationChangeRate - rightRegion.populationChangeRate;
  const depopulationDiff = leftRegion.depopulationAreaCount - rightRegion.depopulationAreaCount;
  const schoolDiff = leftRegion.closedSchoolCount - rightRegion.closedSchoolCount;
  const higherRiskRegion = riskDiff >= 0 ? leftRegion : rightRegion;
  const lowerRiskRegion = riskDiff >= 0 ? rightRegion : leftRegion;

  const cards = [
    {
      label: "위험지수 차이",
      title: `${higherRiskRegion.name} +${Math.abs(riskDiff)}점`,
      body: `${withTopicParticle(higherRiskRegion.name)} ${lowerRiskRegion.name}보다 위험지수가 높습니다. ${leftRegion.name} ${leftRegion.riskIndex}점, ${rightRegion.name} ${rightRegion.riskIndex}점입니다.`
    },
    {
      label: "인구 흐름",
      title: `${formatSignedPoint(populationDiff)}%p`,
      body: `${leftRegion.name}의 인구 증감률은 ${formatRate(leftRegion.populationChangeRate)}, ${withTopicParticle(rightRegion.name)} ${formatRate(rightRegion.populationChangeRate)}입니다.`
    },
    {
      label: "지역 기반 지표",
      title: `${formatSignedNumber(depopulationDiff)}곳 / ${formatSignedNumber(schoolDiff)}곳`,
      body: `인구감소지역 차이는 ${formatSignedNumber(depopulationDiff)}곳, 폐교 수 차이는 ${formatSignedNumber(schoolDiff)}곳입니다.`
    }
  ];

  document.querySelector("#compareResult").innerHTML = cards.map((card) => `
    <article class="compare-card">
      <span class="compare-label">${card.label}</span>
      <strong>${card.title}</strong>
      <p>${card.body}</p>
    </article>
  `).join("");
}

function renderRegionList(regions) {
  const list = document.querySelector("#regionList");
  const priorityRegions = [...regions]
    .sort((a, b) => b.riskIndex - a.riskIndex)
    .slice(0, 6);

  list.innerHTML = priorityRegions.map((region) => {
    const rateClass = region.populationChangeRate < 0 ? "negative" : "positive";
    return `
      <div class="region-row">
        <span class="region-name">${region.name}</span>
        <span class="change-rate ${rateClass}">${region.riskIndex}점</span>
        <span class="region-meta">${region.riskGrade} · 증감률 ${formatRate(region.populationChangeRate)} · 인구감소지역 ${region.depopulationAreaCount}곳 · 폐교 ${numberFormatter.format(region.closedSchoolCount)}곳</span>
      </div>
    `;
  }).join("");
}

function getRegionRiskRank(regions, targetRegion) {
  const sortedRegions = [...regions].sort((a, b) => b.riskIndex - a.riskIndex);
  return sortedRegions.findIndex((region) => region.name === targetRegion.name) + 1;
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

async function renderRegionalMap(regions) {
  if (typeof L === "undefined" || typeof topojson === "undefined") {
    throw new Error("Leaflet 또는 TopoJSON 라이브러리를 불러오지 못했습니다.");
  }

  const response = await fetch(MAP_URL);

  if (!response.ok) {
    throw new Error(`지도 데이터 요청 실패: ${response.status}`);
  }

  const topology = await response.json();
  const mapObject = topology.objects[MAP_OBJECT_NAME];

  if (!mapObject) {
    throw new Error("지도 데이터의 object 이름이 예상과 다릅니다.");
  }

  const geojson = topojson.feature(topology, mapObject);
  const regionByMapCode = createRegionByMapCode(regions);
  const featureByRegionName = createFeatureByRegionName(geojson.features, regionByMapCode);
  const mapElement = document.querySelector("#regionalMap");
  const regionSelect = document.querySelector("#regionSelect");
  let currentMetric = "riskIndex";
  let selectedLayer = null;
  let selectedRegion = null;
  let selectedFeature = null;

  const map = L.map(mapElement, {
    attributionControl: true,
    scrollWheelZoom: false,
    zoomControl: false
  }).setView([36.4, 127.8], 6);

  map.attributionControl.addAttribution(
    'Boundary: <a href="https://github.com/southkorea/southkorea-maps">southkorea-maps</a>'
  );
  L.control.zoom({ position: "bottomright" }).addTo(map);

  const layerGroup = L.geoJSON(geojson, {
    style: (feature) => getMapFeatureStyle(feature, regionByMapCode, currentMetric),
    onEachFeature: (feature, layer) => {
      const region = regionByMapCode.get(feature.properties.code);
      const featureMatch = region ? featureByRegionName.get(region.name) : null;

      if (featureMatch) {
        featureMatch.layer = layer;
      }

      layer.bindTooltip(getMapTooltip(region, feature, currentMetric), {
        direction: "top",
        sticky: true
      });

      layer.on({
        mouseover: () => {
          layer.setStyle({
            color: "#18211c",
            fillOpacity: 0.95,
            weight: 2.5
          });
          renderMapDetail(region, feature, currentMetric, regions);
        },
        mouseout: () => {
          if (layer !== selectedLayer) {
            layerGroup.resetStyle(layer);
          }
        },
        click: () => {
          selectRegion(region, feature, layer);
        }
      });
    }
  }).addTo(map);

  map.fitBounds(layerGroup.getBounds(), {
    padding: [18, 18]
  });
  populateRegionSelect(regions, regionSelect);
  renderMapLegend(currentMetric);
  renderMapDetail(null, null, currentMetric);

  document.querySelectorAll("[data-map-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      currentMetric = button.dataset.mapMetric;
      document.querySelectorAll("[data-map-metric]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelector("#mapTitle").textContent = mapMetricConfigs[currentMetric].title;
      renderMapLegend(currentMetric);
      layerGroup.setStyle((feature) => getMapFeatureStyle(feature, regionByMapCode, currentMetric));
      refreshTooltips(layerGroup, regionByMapCode, currentMetric);

      if (selectedLayer) {
        selectedLayer.setStyle({
          color: "#18211c",
          fillOpacity: 0.96,
          weight: 3
        });
      }

      renderMapDetail(selectedRegion, selectedFeature, currentMetric, regions);
    });
  });

  regionSelect.addEventListener("change", () => {
    const regionName = regionSelect.value;

    if (!regionName) {
      if (selectedLayer) {
        layerGroup.resetStyle(selectedLayer);
      }
      selectedLayer = null;
      selectedRegion = null;
      selectedFeature = null;
      map.fitBounds(layerGroup.getBounds(), {
        padding: [18, 18]
      });
      renderMapDetail(null, null, currentMetric);
      return;
    }

    const match = featureByRegionName.get(regionName);
    if (!match || !match.layer) {
      return;
    }

    selectRegion(match.region, match.feature, match.layer);
    map.fitBounds(match.layer.getBounds(), {
      maxZoom: 8,
      padding: [48, 48]
    });
  });

  function selectRegion(region, feature, layer) {
    if (!region) {
      return;
    }

    if (selectedLayer && selectedLayer !== layer) {
      layerGroup.resetStyle(selectedLayer);
    }

    selectedLayer = layer;
    selectedRegion = region;
    selectedFeature = feature;
    regionSelect.value = region.name;
    layer.setStyle({
      color: "#18211c",
      fillOpacity: 0.96,
      weight: 3
    });
    layer.bringToFront();
    renderMapDetail(region, feature, currentMetric, regions);
  }

  return {
    refreshRiskDisplay: () => {
      layerGroup.setStyle((feature) => getMapFeatureStyle(feature, regionByMapCode, currentMetric));
      refreshTooltips(layerGroup, regionByMapCode, currentMetric);

      if (selectedLayer) {
        selectedLayer.setStyle({
          color: "#18211c",
          fillOpacity: 0.96,
          weight: 3
        });
      }

      renderMapDetail(selectedRegion, selectedFeature, currentMetric, regions);
    }
  };
}

function createRegionByMapCode(regions) {
  return new Map(regions.map((region) => [
    mapCodeByRegionCode[region.code],
    region
  ]));
}

function createFeatureByRegionName(features, regionByMapCode) {
  const result = new Map();

  features.forEach((feature) => {
    const region = regionByMapCode.get(feature.properties.code);

    if (region) {
      result.set(region.name, {
        feature,
        region,
        layer: null
      });
    }
  });

  return result;
}

function populateRegionSelect(regions, select) {
  select.innerHTML = `
    <option value="">전국</option>
    ${regions.map((region) => `<option value="${region.name}">${region.name}</option>`).join("")}
  `;
}

function renderMapLegend(metric) {
  const config = mapMetricConfigs[metric];
  document.querySelector("#mapLegend").innerHTML = config.legend.map((item) => `
    <span><i class="map-swatch ${item.className}"></i>${item.label}</span>
  `).join("");
}

function refreshTooltips(layerGroup, regionByMapCode, metric) {
  layerGroup.eachLayer((layer) => {
    const feature = layer.feature;
    const region = regionByMapCode.get(feature.properties.code);
    layer.bindTooltip(getMapTooltip(region, feature, metric), {
      direction: "top",
      sticky: true
    });
  });
}

function getMapFeatureStyle(feature, regionByMapCode, metric) {
  const region = regionByMapCode.get(feature.properties.code);

  if (!region) {
    return {
      color: "#ffffff",
      fillColor: "#d8dfd8",
      fillOpacity: 0.75,
      opacity: 1,
      weight: 1
    };
  }

  const config = mapMetricConfigs[metric];

  return {
    color: region.isCapitalArea ? "#3465d9" : "#ffffff",
    fillColor: config.color(config.value(region)),
    fillOpacity: 0.84,
    opacity: 1,
    weight: region.isCapitalArea ? 2.3 : 1
  };
}

function getMapTooltip(region, feature, metric) {
  const name = region ? region.name : feature.properties.name;

  if (!region) {
    return `<strong>${name}</strong><br>대시보드 데이터 없음`;
  }

  const config = mapMetricConfigs[metric];
  return `<strong>${name}</strong><br>${config.detailLabel} ${config.format(config.value(region))}`;
}

function renderMapDetail(region, feature, metric = "riskIndex", regions = []) {
  const detail = document.querySelector("#mapDetail");
  const config = mapMetricConfigs[metric];

  if (!region) {
    detail.innerHTML = `
      <span class="detail-label">전국 요약</span>
      <strong>${config.title}</strong>
      <p>17개 시도 경계와 Phase 1 지표를 연결했습니다.</p>
    `;
    return;
  }

  const mapName = feature.properties.name;
  const areaLabel = region.isCapitalArea ? "수도권" : "비수도권";
  const riskRank = regions.length > 0 ? getRegionRiskRank(regions, region) : null;

  detail.innerHTML = `
    <span class="detail-label">${areaLabel}</span>
    <strong>${region.name}</strong>
    <p>${mapName} 경계 데이터와 Phase 1 지표를 연결했습니다.</p>
    <div class="detail-grid">
      <div class="detail-row">
        <span>종합 위험지수</span>
        <b>${region.riskIndex}점</b>
      </div>
      ${riskRank ? `
        <div class="detail-row">
          <span>위험도 순위</span>
          <b>${riskRank}위 / 17개</b>
        </div>
      ` : ""}
      <div class="detail-row">
        <span>인구 증감률</span>
        <b>${formatRate(region.populationChangeRate)}</b>
      </div>
      <div class="detail-row">
        <span>인구감소지역</span>
        <b>${numberFormatter.format(region.depopulationAreaCount)}곳</b>
      </div>
      <div class="detail-row">
        <span>폐교 수</span>
        <b>${numberFormatter.format(region.closedSchoolCount)}곳</b>
      </div>
    </div>
    <span class="risk-score">${region.riskGrade}</span>
    <span class="area-pill">${areaLabel} 구분</span>
  `;
}

function renderMapError(error) {
  document.querySelector("#regionalMap").innerHTML = "";
  document.querySelector("#mapDetail").innerHTML = `
    <span class="detail-label">지도 오류</span>
    <strong>지도를 불러오지 못했습니다</strong>
    <p>${error.message}</p>
  `;
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

function getTopRegion(regions, key) {
  return [...regions].sort((a, b) => b[key] - a[key])[0];
}

function getRegionByName(regions, name) {
  return regions.find((region) => region.name === name);
}

function getAverage(regions, key) {
  const total = regions.reduce((sum, region) => sum + region[key], 0);
  return total / regions.length;
}

function getRiskGrade(score) {
  if (score >= 75) {
    return "매우 높음";
  }

  if (score >= 55) {
    return "높음";
  }

  if (score >= 35) {
    return "주의";
  }

  return "낮음";
}

function formatNumber(value) {
  return Number.isInteger(value) ? numberFormatter.format(value) : value.toFixed(1);
}

function formatRate(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatSignedPoint(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function formatSignedNumber(value) {
  return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}`;
}

function formatWeight(value) {
  return `${Math.round(value * 100)}%`;
}

function withTopicParticle(name) {
  const lastChar = name.charCodeAt(name.length - 1);

  if (lastChar < 0xac00 || lastChar > 0xd7a3) {
    return `${name}는`;
  }

  return (lastChar - 0xac00) % 28 === 0 ? `${name}는` : `${name}은`;
}
