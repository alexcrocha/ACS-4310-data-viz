const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Dimensions of the chart
const width = document.querySelector("#dataViz").clientWidth;
const height = document.querySelector("#dataViz").clientHeight;

const colours = {
  "bar": "lightblue",
  "barhover": "#34cccd",
  "line": "black"
};

// Select the container element
const container = d3.select("#dataViz");

// Load the CSV file
d3.csv("./data/seattle-weather.csv").then((csvData) => {
  // Data transformation and manipulation
  const data = csvData.map((d) => ({
    date: d.date,
    precipitation: +d.precipitation,
    temp_max: +d.temp_max,
    temp_min: +d.temp_min,
    wind: +d.wind,
    weather: d.weather,
  }));

  // Sort data by date and select the most recent 10 days
  data.sort((a, b) => a.date - b.date);
  const recentData = data.slice(-10);

  // Append an SVG element to the container
  const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);

  // Scales and axes
  const xScale = d3.scaleBand()
    .domain(recentData.map(d => new Date(d.date)))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(recentData, d => d.temp_max) + 1])
    .range([height - margin.bottom, margin.top]);

  // Second y-scale for precipitation
  const yScale2 = d3.scaleLinear()
    .domain([0, d3.max(recentData, d => d.precipitation) + 1])
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.timeFormat("%b %d, %Y"));

  const yAxis = d3.axisLeft(yScale);
  const yAxis2 = d3.axisRight(yScale2);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "14px");

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "14px");


  // Second y-axis to the right side of the plot
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width - margin.right}, 0)`)
    .call(yAxis2)
    .selectAll("text")
    .style("font-size", "14px");


  svg.selectAll(".bar")
    .data(recentData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(new Date(d.date)))
    .attr("y", d => yScale(d.temp_max))
    .attr("height", d => height - margin.bottom - yScale(d.temp_max))
    .attr("width", xScale.bandwidth())
    .style("fill", colours.bar);

  // Weather icons
  svg.selectAll(".icon")
    .data(recentData)
    .enter()
    .append("image")
    .attr("class", "icon")
    .attr("x", d => xScale(new Date(d.date)) + xScale.bandwidth() / 2 - 25)
    .attr("y", d => yScale(d.temp_max) - 50)
    .attr("width", 50)
    .attr("height", 50)
    .attr("href", d => `./icons/${d.weather}.gif`);

  // Line for precipitation
  const line = d3.line()
    .x((d) => xScale(new Date(d.date)) + xScale.bandwidth() / 2)
    .y((d) => yScale2(d.precipitation))
    .curve(d3.curveMonotoneX);

  // Path for the precipitation line
  svg.append("path")
    .datum(recentData)
    .attr("fill", "none")
    .attr("stroke", colours.line)
    .attr("stroke-width", 1.5)
    .attr("d", line);

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
    d3.select(this).style("fill", colours.barhover);
    tooltip.html(`
        <strong>${d.date}</strong>  <br/>
        Precipitation: <strong>${d.precipitation}</strong> <br/>
        Max Temp: <strong>${d.temp_max}</strong> <br/>
        Min Temp: <strong>${d.temp_min}</strong> <br/>
        Wind: <strong>${d.wind}</strong> <br/>
        Weather: <strong>${d.weather.charAt(0).toUpperCase() + d.weather.slice(1)}</strong>
      `)
      .style("visibility", "visible");
  };

  const mousemove = function (event) {
    tooltip.style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  };

  const mouseout = function (d) {
    d3.select(this).style("fill", colours.bar);
    tooltip.style("visibility", "hidden");
  };

  svg.selectAll(".bar")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  // Label for the x-axis
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom + 40})`)
    .style("text-anchor", "middle")
    .text("Day");

  // Label for the y-axis (temperature)
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 40)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .text("Max Temperature");

  // Label for the second y-axis (precipitation)
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", width - margin.right + 50)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .text("Precipitation");
});
