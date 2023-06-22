// Set the dimensions and margins of the graph
const margin = { top: 60, right: 30, bottom: 40, left: 110 };
const width = document.querySelector("#dataViz2").clientWidth;
const height = document.querySelector("#dataViz2").clientHeight;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Select the container element
const container = d3.select("#dataViz2");

// Load the CSV file
d3.csv("./data/Google_graveyard.csv").then(function (data) {
  data.forEach(function (d) {
    d.Start = new Date(+d.Start, 0, 1);
    d.End = new Date(+d.End, 0, 1);
  });

  // Group the data by category and end year
  const nestedData = d3.group(data, (d) => d.Category, (d) => d["End"].getFullYear());

  // Calculate count of projects per category and end year
  const countData = Array.from(nestedData, ([category, yearValues]) => {
    const countByYear = Array.from(yearValues, ([year, values]) => ({
      Category: category,
      Year: year,
      "Count of projects": values.length,
    }));
    return countByYear;
  }).flat();

  // Create an array of all categories
  const categories = Array.from(new Set(data.map((d) => d.Category)));

  // Create a color scale for the categories
  const color = d3.scaleOrdinal()
    .domain(categories)
    .range(["#E83F6F", "#FFD700", "#00FF7F"]);

  const x = d3.scaleTime()
    .domain(d3.extent(data, (d) => d["End"]))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(countData, (d) => d["Count of projects"])])
    .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(x)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat("%Y"))
    .tickSize(-innerHeight)
    .tickPadding(10)
    .tickValues(x.ticks(5));

  const yAxis = d3.axisLeft(y)
    .tickSize(-innerWidth)
    .tickPadding(10);

  // Append SVG element to the container
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Append title
  svg.append("text")
    .attr("class", "graph-title")
    .attr("x", innerWidth / 2)
    .attr("y", -margin.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Google Graveyard");

  // Append x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "14px")
    .attr("fill", "#000000");

  // Append y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "14px")
    .attr("fill", "#000000");

  // Append y-axis label
  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left / 1.5)
    .attr("x", -innerHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#000000")
    .text("Projects Killed");

  // Append data points
  const dots = svg.selectAll(".dot")
    .data(countData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(new Date(d.Year, 0))) // Set x-coordinate based on year
    .attr("cy", (d) => y(d["Count of projects"]))
    .attr("r", 16) // Dot size
    .style("fill", (d) => color(d.Category))
    .style("stroke", "#FFFFFF")
    .style("stroke-width", "3px");

  // Append count labels inside the dots
  svg.selectAll(".label")
    .data(countData)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => x(new Date(d.Year, 0)))
    .attr("y", (d) => y(d["Count of projects"]))
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("font-size", "14px")
    .style("fill", "#FFFFFF")
    .text((d) => d["Count of projects"]);


  // Calculate the sum of projects for each category
  const categoryCounts = {};
  countData.forEach((item) => {
    if (categoryCounts[item.Category]) {
      categoryCounts[item.Category] += item["Count of projects"];
    } else {
      categoryCounts[item.Category] = item["Count of projects"];
    }
  });

  // Append legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${innerWidth - 100}, 20)`);

  const legendItems = legend.selectAll(".legend-item")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 30})`);

  legendItems.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", color);

  legendItems.append("text")
    .attr("x", 30)
    .attr("y", 12)
    .attr("dy", "0.32em")
    .text((d) => `${d} (${categoryCounts[d]})`)
    .style("font-size", "14px")
    .style("fill", "#000000");

});
