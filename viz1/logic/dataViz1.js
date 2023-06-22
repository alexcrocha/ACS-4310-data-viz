// Define the margin
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Define the dimensions of the chart
const width = document.querySelector("#dataViz1").clientWidth;
const height = document.querySelector("#dataViz1").clientHeight;

// Select the container element
const container = d3.select("#dataViz1");

// Load the CSV file
d3.csv("./data/Google_graveyard.csv").then((csvData) => {
  const counts = {};

  csvData.forEach(({ End, Name }) => {
    if (counts[End]) {
      counts[End].count++;
      counts[End].projects.push(Name);
    } else {
      counts[End] = { count: 1, projects: [Name] };
    }
  });

  const data = Object.entries(counts).map(([End, { count, projects }]) => ({
    End,
    count,
    projects,
  }));

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.End))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .style("font-size", "14px")
      .style("color", "#555")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.5em")
      .attr("transform", "rotate(-45)");

  const yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .style("font-size", "14px")
      .style("color", "#555");

  const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);

  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("gradientTransform", "rotate(72)");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#36c3ff");

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#0078d4");

  svg
    .append("g")
    .attr("class", "bars")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.End))
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .style("fill", "url(#gradient)")
    .style("filter", "url(#dropshadow)")
    .attr("rx", 8)
    .attr("ry", 8)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("x", (d) => x(d.End) - 2)
        .attr("y", (d) => y(d.count) - 2)
        .attr("width", x.bandwidth() + 4)
        .attr("height", (d) => y(0) - y(d.count) + 4)
        .style("filter", "url(#dropshadow-hover)")
        .style("fill", "#ffcd00");

      tooltip.style("visibility", "visible").html(getTooltipHtml(d));
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("x", (d) => x(d.End))
        .attr("y", (d) => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", (d) => y(0) - y(d.count))
        .style("filter", "url(#dropshadow)")
        .style("fill", "url(#gradient)");

      tooltip.style("visibility", "hidden");
    });

  const dropShadowHover = svg
    .append("defs")
    .append("filter")
    .attr("id", "dropshadow-hover");

  dropShadowHover
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 4)
    .attr("result", "blur");

  dropShadowHover
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

  dropShadowHover
    .append("feComponentTransfer")
    .append("feFuncA")
    .attr("type", "linear")
    .attr("slope", 0.5);

  const mergeHover = dropShadowHover.append("feMerge");
  mergeHover.append("feMergeNode");
  mergeHover.append("feMergeNode").attr("in", "SourceGraphic");

  svg.append("g").attr("class", "x-axis").call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("x", -margin.left)
    .attr("y", -10)
    .attr("fill", "#555")
    .style("font-size", "14px")
    .text("Casualties");

  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("font-family", "sans-serif");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .style("font-size", "24px")
    .text("Google Graveyard");

  svg
    .selectAll(".bar-label")
    .data(data)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", (d) => x(d.End) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.count) - 10)
    .attr("text-anchor", "middle")
    .text((d) => d.count)
    .attr("fill", "#555")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  function getTooltipHtml(d) {
    const projectsHtml = d.projects.map((project) => `<li>${project}</li>`).join("");
    return `
    <strong>${d.End}</strong><br><br>
    <strong>Casualties: ${d.count}</strong>
    <ul style="list-style: none; padding: 0; margin-top: 10px;">${projectsHtml}</ul>
    `;
  }
});
