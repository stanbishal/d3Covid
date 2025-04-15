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


