const tooltip = d3.select("#tooltip");

function showChart(id) {
  d3.selectAll(".chart").classed("active-chart", false);
  d3.select("#" + id).classed("active-chart", true);

  if (id === "choropleth") {
    setTimeout(() => {
      if (window._leafletMap) {
        window._leafletMap.invalidateSize();
      }
    }, 300);
  }
}

const csvUrl =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv";

d3.csv(csvUrl).then((data) => {
  data = data.filter(
    (d) => d.total_cases && d.population && d.iso_code.length === 3
  );

  // Truncate to top 10
  data.sort((a, b) => d3.descending(+a.total_cases, +b.total_cases));
  const top10 = data.slice(0, 10);

  drawBar(top10);
  drawPie(top10);
  drawLine(top10);
  drawBubble(top10);
  drawArea(top10);
  drawScatter(top10);
  drawChoropleth(data);
});

function drawBar(data) {
  const svg = d3.select("#bar").append("svg");
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.location))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_cases)])
    .nice()
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  g.append("g").call(d3.axisLeft(y));

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.location))
    .attr("y", (d) => y(+d.total_cases))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(+d.total_cases))
    .attr("fill", "#69b3a2")
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip
        .html(
          `<strong>${
            d.location
          }</strong><br>Total Cases: ${(+d.total_cases).toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));
}

function drawPie(data) {
  const svg = d3
    .select("#pie")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);
  const radius = 200;
  const g = svg.append("g").attr("transform", `translate(250,250)`);

  const pie = d3.pie().value((d) => +d.total_cases);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  g.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.location))
    .on("click", (event, d) => {
      alert(
        `${d.data.location}: ${(+d.data.total_cases).toLocaleString()} cases`
      );
    });
}

function drawLine(data) {
  const svg = d3.select("#line").append("svg");
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scalePoint()
    .domain(data.map((d) => d.location))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_cases)])
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  g.append("g").call(d3.axisLeft(y));

  const line = d3
    .line()
    .x((d) => x(d.location))
    .y((d) => y(+d.total_cases));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#ff6600")
    .attr("stroke-width", 2)
    .attr("d", line);

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.location))
    .attr("cy", (d) => y(+d.total_cases))
    .attr("r", 4)
    .attr("fill", "red")
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip
        .html(
          `<strong>${
            d.location
          }</strong><br>Total Cases: ${(+d.total_cases).toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));
}

function drawBubble(data) {
  const svg = d3.select("#bubble").append("svg");
  const width = 800,
    height = 500;
  svg.attr("width", width).attr("height", height);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.population)])
    .range([50, width - 50]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_cases)])
    .range([height - 50, 50]);

  const r = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => +d.total_cases)])
    .range([5, 40]);

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(+d.population))
    .attr("cy", (d) => y(+d.total_cases))
    .attr("r", (d) => r(+d.total_cases))
    .attr("fill", "#66ccff")
    .attr("opacity", 0.7)
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip
        .html(
          `<strong>${
            d.location
          }</strong><br>Total Cases: ${(+d.total_cases).toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));
}

function drawArea(data) {
  const svg = d3.select("#area").append("svg");
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const g = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scalePoint()
    .domain(data.map((d) => d.location))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_cases)])
    .range([height, 0]);

  const area = d3
    .area()
    .x((d) => x(d.location))
    .y0(height)
    .y1((d) => y(+d.total_cases));

  g.append("path").datum(data).attr("fill", "lightsteelblue").attr("d", area);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  g.append("g").call(d3.axisLeft(y));
}

function drawScatter(data) {
  const svg = d3.select("#scatter").append("svg");
  const width = 800,
    height = 500;
  svg.attr("width", width).attr("height", height);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.population)])
    .range([50, width - 50]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_deaths || 0)])
    .range([height - 50, 50]);

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(+d.population))
    .attr("cy", (d) => y(+d.total_deaths || 0))
    .attr("r", 5)
    .attr("fill", "#ff6666")
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip
        .html(
          `${d.location}<br>Deaths: ${(+d.total_deaths || 0).toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));
}

function drawChoropleth(data) {
  const checkVisibility = setInterval(() => {
    const mapContainer = document.getElementById("leaflet-map");
    if (mapContainer.offsetParent !== null) {
      clearInterval(checkVisibility);

      const map = L.map("leaflet-map").setView([20, 0], 2);
      window._leafletMap = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 6,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(map);

      // Static coords + ISO Alpha-2 for flags
      const countryMarkers = {
        "United States": { coords: [37.0902, -95.7129], code: "us" },
        China: { coords: [35.8617, 104.1954], code: "cn" },
        India: { coords: [20.5937, 78.9629], code: "in" },
        France: { coords: [46.6034, 1.8883], code: "fr" },
        Germany: { coords: [51.1657, 10.4515], code: "de" },
        Brazil: { coords: [-14.235, -51.9253], code: "br" },
        "South Korea": { coords: [35.9078, 127.7669], code: "kr" },
        Japan: { coords: [36.2048, 138.2529], code: "jp" },
        Italy: { coords: [41.8719, 12.5674], code: "it" },
        "United Kingdom": { coords: [55.3781, -3.436], code: "gb" },
      };

      const topCountries = data.filter((d) =>
        Object.keys(countryMarkers).includes(d.location)
      );

      topCountries.forEach((d) => {
        const { coords, code } = countryMarkers[d.location];

        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; font-size: 14px; max-width: 220px;">
            <h4 style="margin: 0 0 8px;">${d.location}</h4>
            <div><strong>Cases:</strong> ${(+d.total_cases).toLocaleString()}</div>
            <div><strong>Deaths:</strong> ${(
              +d.total_deaths || 0
            ).toLocaleString()}</div>
            <div><strong>Population:</strong> ${(+d.population).toLocaleString()}</div>
          </div>
        `;

        //  Create a custom flag icon
        const flagIcon = L.icon({
          iconUrl: `https://flagcdn.com/w40/${code}.png`,
          iconSize: [40, 27], // width, height
          iconAnchor: [20, 13], // center the icon
          popupAnchor: [0, -10],
        });

        L.marker(coords, { icon: flagIcon }).bindPopup(popupContent).addTo(map);
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, 100);
}
