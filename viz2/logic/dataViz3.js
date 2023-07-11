const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Define the dimensions of the chart
const width = document.querySelector("#dataViz3").clientWidth;
const height = document.querySelector("#dataViz3").clientHeight;

const container = d3.select("#dataViz3");

// List of groups (company size)
const groups = ['S', 'M', 'L']

// List of subgroups (experience level)
const subgroups = ['EN', 'MI', 'SE', 'EX']

// Load the CSV file
d3.csv("./data/ds_salaries.csv").then((csvData) => {
  // Data transformation and manipulation
  const data = csvData.map((d) => ({
    company_size: d.company_size,
    experience_level: d.experience_level,
  }));

  let groupedData = Array.from(d3.rollup(data, v => v.length, d => d.company_size, d => d.experience_level), ([key, values]) => ({ company_size: key, ...Object.fromEntries(values) }));

  // Calculate total counts for each company size category
  groupedData.forEach(d => {
    let total = 0;
    subgroups.forEach(key => {
      total += d[key] ? d[key] : 0;
    });
    d.total = total;
  });

  // Transform counts to percentages
  groupedData = groupedData.map(d => {
    let newObj = {};
    newObj.company_size = d.company_size;
    subgroups.forEach(key => {
      newObj[key] = d[key] / d.total;
    });
    return newObj;
  });

  // Append an SVG element to the container
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add X axis
  const x = d3.scaleBand()
    .domain(groups)
    .range([0, width - margin.left - margin.right])
    .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 1]) // 0 to 100%
    .range([height - margin.top - margin.bottom, 0]);
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format('.0%')));

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeSet2);

  // stack the data
  const stackedData = d3.stack()
    .keys(subgroups)
    .offset(d3.stackOffsetExpand) // stack layout in percentage
    (groupedData)

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
    // what subgroup are we hovering?
    const subGroupName = d3.select(this.parentNode).datum().key

    // Reduce opacity of all rect to 0.2
    d3.selectAll(".myRect").style("opacity", 0.2)

    // Highlight all rects of this subgroup with opacity 1.
    d3.selectAll("." + subGroupName).style("opacity", 1)

    // Percentage value and update tooltip
    let percentage = (d[1] - d[0]) * 100;
    tooltip.style("visibility", "visible").html("Percentage: " + percentage.toFixed(2) + "%");
  };

  const mousemove = function (event) {
    tooltip.style("top", (event.pageY + 10) + "px").style("left", (event.pageX + 10) + "px");
  };

  const mouseleave = function (event, d) {
    // Back to normal opacity: 1
    d3.selectAll(".myRect").style("opacity", 1)

    // Hide tooltip
    tooltip.style("visibility", "hidden");
  };

  // Show the bars
  svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .attr("class", d => "myRect " + d.key) // Add a class to each subgroup: their name
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.company_size))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  // Legend
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(subgroups.slice().reverse())
    .join("g")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
    .attr("x", width - 190)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", color);

  const legend_labels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive Level'];
  legend.append("text")
    .attr("x", width - 165)
    .attr("y", 9.5)
    .attr("dy", "0.33em")
    .text(d => legend_labels[subgroups.indexOf(d)]);
});
