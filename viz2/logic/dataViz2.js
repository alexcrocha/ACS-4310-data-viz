const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Define the dimensions of the chart
const width = document.querySelector("#dataViz2").clientWidth - margin.left - margin.right;
const height = document.querySelector("#dataViz2").clientHeight - margin.top - margin.bottom;
const innerRadius = 90;
const outerRadius = Math.max(width, height) / 2.5;

// Select the container element
const svg = d3.select("#dataViz2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

// Color scale
const colour = d3.scaleOrdinal(d3.schemeCategory10);

// Load the CSV file
d3.csv("./data/ds_salaries.csv").then((csvData) => {

  // Parse the salary to a number before calculating the average
  csvData.forEach(function (d) {
    d.salary_in_usd = +d.salary_in_usd;
  });

  // Average salary per country
  const data = Array.from(d3.group(csvData, d => d.employee_residence), ([key, value]) => ({ employee_residence: key, salary_in_usd: d3.mean(value, d => d.salary_in_usd) }));

  // Scales
  const x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(data.map(function (d) { return d.employee_residence; }));
  const y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, d3.max(data, (d) => d.salary_in_usd)]);

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("font-family", "Arial, sans-serif");

  // Handle the events
  const mouseover = function (event, d) {
    d3.select(this)
      .transition()
      .duration(100)
      .attr("opacity", 0.5);
    tooltip.html(`<strong>${d.employee_residence}</strong><br/>Avg Salary in USD<br/> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.salary_in_usd)}`)
      .style("visibility", "visible");
  };

  const mousemove = function (event) {
    tooltip.style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  };

  const mouseout = function (d) {
    d3.select(this)
      .transition()
      .duration(100)
      .attr("opacity", 1);
    tooltip.style("visibility", "hidden");
  };

  // Add the bars
  svg.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("fill", d => colour(d.employee_residence))
    .attr("d", d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(function (d) { return y(d.salary_in_usd); })
      .startAngle(function (d) { return x(d.employee_residence); })
      .endAngle(function (d) { return x(d.employee_residence) + x.bandwidth(); })
      .padAngle(0.01)
      .padRadius(innerRadius))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  // Add the labels
  svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("text-anchor", function (d) { return (x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
    .attr("transform", function (d) { return "rotate(" + ((x(d.employee_residence) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d.salary_in_usd) + 10) + ",0)"; })
    .append("text")
    .text(function (d) { return (d.employee_residence) })
    .attr("transform", function (d) { return (x(d.employee_residence) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
    .style("font-size", "11px")
    .attr("alignment-baseline", "middle");
});
