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

const mapMetricConfigs = {
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
    renderSummary(data.summary);
    renderRegionList(data.regions);
    renderPopulationChart(data.regions);
    renderRegionalMap(data.regions).catch(renderMapError);
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
  let currentMetric = "populationChangeRate";
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
          renderMapDetail(region, feature, currentMetric);
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
  renderMapDetail();

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

      renderMapDetail(selectedRegion, selectedFeature, currentMetric);
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
      renderMapDetail();
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
    renderMapDetail(region, feature, currentMetric);
  }
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

function renderMapDetail(region, feature, metric = "populationChangeRate") {
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

  detail.innerHTML = `
    <span class="detail-label">${areaLabel}</span>
    <strong>${region.name}</strong>
    <p>${mapName} 경계 데이터와 Phase 1 지표를 연결했습니다.</p>
    <div class="detail-grid">
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

function formatNumber(value) {
  return Number.isInteger(value) ? numberFormatter.format(value) : value.toFixed(1);
}

function formatRate(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
