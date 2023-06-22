// Define the margin
const margin = { top: 50, right: 50, bottom: 50, left: 200 };

// Select the container element
const container = d3.select("#dataViz3");

// Add a title to the graph
const titleText = "Google Graveyard";

container
  .append("h2")
  .text(titleText)
  .style("text-align", "center")
  .style("font-size", "24px")
  .style("margin-top", "20px")
  .style("margin-bottom", "10px");

const projectColor = "#4e79a7";

// Load the CSV file
d3.csv("./data/Google_graveyard.csv").then(function (data) {
  // Define the dimensions of the chart
  const rowHeight = 30;
  const outerHeight = data.length * rowHeight + margin.top + margin.bottom;
  const outerWidth = container.node().clientWidth;

  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;

  data.forEach(function (d) {
    d.Start = new Date(d.Start);
    d.End = new Date(d.End);
    d.Duration = ((d.End - d.Start) / 1000 / 60 / 60 / 24 / 365).toFixed(0);
  });

  // Sort the data by start date in ascending order
  data.sort(function (a, b) {
    return a.Start - b.Start;
  });

  // Append SVG element to the container
  const svg = container
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3
    .scaleTime()
    .domain([
      d3.min(data, function (d) {
        return d.Start;
      }),
      d3.max(data, function (d) {
        return d.End;
      }),
    ])
    .range([0, width]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(function (d) {
      return d.Name;
    }))
    .range([0, height])
    .padding(0.2);

  const xAxis = d3.axisBottom(xScale)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat("%Y"));

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "12px")
    .attr("fill", "#666")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  // Create the y-axis
  const yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0);

  const yAxisGroup = svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Apply CSS styling to the y-axis labels
  yAxisGroup
    .selectAll("text")
    .style("font-size", "14px")
    .attr("fill", "#666")
    .attr("text-anchor", "end")
    .attr("transform", "translate(-5, 0)");

  // Create a group for each project and draw the lines
  const projects = svg
    .selectAll(".project")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "project");

  // Draw the background for each project row
  projects
    .append("rect")
    .attr("class", "row-background")
    .attr("x", 0)
    .attr("y", function (d) {
      return yScale(d.Name) - 2;
    })
    .attr("width", width)
    .attr("height", yScale.bandwidth() + 4)
    .style("fill", function (d, i) {
      return i % 2 === 0 ? "#f7f7f7" : "#fff";
    });

  // Draw the line for each project
  projects
    .append("line")
    .attr("class", "bar")
    .attr("x1", function (d) {
      return xScale(d.Start);
    })
    .attr("x2", function (d) {
      return xScale(d.End);
    })
    .attr("y1", function (d) {
      return yScale(d.Name) + yScale.bandwidth() / 2;
    })
    .attr("y2", function (d) {
      return yScale(d.Name) + yScale.bandwidth() / 2;
    })
    .style("stroke", projectColor)
    .style("stroke-width", 3);

  // Add the green ball at the start
  projects
    .append("circle")
    .attr("class", "start-ball")
    .attr("cx", function (d) {
      return xScale(d.Start);
    })
    .attr("cy", function (d) {
      return yScale(d.Name) + yScale.bandwidth() / 2;
    })
    .attr("r", 6)
    .style("fill", "#00cc66")
    .style("stroke", "#fff")
    .style("stroke-width", 2);

  // Add the red ball at the end
  projects
    .append("circle")
    .attr("class", "end-ball")
    .attr("cx", function (d) {
      return xScale(d.End);
    })
    .attr("cy", function (d) {
      return yScale(d.Name) + yScale.bandwidth() / 2;
    })
    .attr("r", 6)
    .style("fill", "#ff3300")
    .style("stroke", "#fff")
    .style("stroke-width", 2);

  // Create a tooltip element
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

  // Create the HTML content for the tooltip
  function getTooltipHtml(d) {
    return `<strong>${d.Name}</strong>: ${d.Start.getFullYear()} - ${d.End.getFullYear()} (${d.Duration} years)<br><br>${d.Description}`;
  }

  // Show/hide tooltip on mouseover/mouseout
  projects
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible").html(getTooltipHtml(d));
    })
    .on("mousemove", function (event) {
      tooltip.style("top", event.pageY + 10 + "px").style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    });
});

container.style("font-family", "Arial, sans-serif");
svg.style("background-color", "#f9f9f9");
svg.selectAll(".tick line").style("stroke", "#ccc");
svg.selectAll(".axis text").style("fill", "#666");
svg.selectAll(".bar").style("stroke", projectColor);
tooltip.style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.3)");

// Hover effect on project bars
svg.selectAll(".bar")
  .on("mouseover", function () {
    d3.select(this).style("stroke-width", 4);
  })
  .on("mouseout", function () {
    d3.select(this).style("stroke-width", 3);
  });
