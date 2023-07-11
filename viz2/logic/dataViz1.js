const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Styling
const colours = d3.scaleOrdinal(d3.schemeCategory10);
const jitterWidth = 50;
const boxFill = "#7fc97f";
const boxStroke = "#2b8cbe";
const medianStroke = "#f03b20";
const tooltipFontSize = "18px";
const tooltipColor = "#4d004b";

// Helper function to count occurrences of a value in an array of objects
function countOccurrences(arr, key, value) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) {
      count++;
    }
  }
  return count;
}

const container = d3.select("#dataViz1");

// Load the CSV file
d3.csv("./data/ds_salaries.csv")
  .then((csvData) => {
    // Data transformation and manipulation
    let data = csvData.filter((d) => d.employee_residence === "US");
    data = data.filter((d) => countOccurrences(data, "job_title", d.job_title) > 10)
      .map((d) => ({
        job_title: d.job_title,
        salary: +d.salary_in_usd,
      }));

    // Define the dimensions of the chart
    const width = document.querySelector("#dataViz1").clientWidth - margin.left - margin.right;
    const height = data.length / 1.75;

    // Quartiles, median, inter quantile range min and max
    const sumstat = d3.groups(data, d => d.job_title).map(([key, value]) => {
      const q1 = d3.quantile(value.map(d => d.salary).sort(d3.ascending), .25);
      const median = d3.quantile(value.map(d => d.salary).sort(d3.ascending), .5);
      const q3 = d3.quantile(value.map(d => d.salary).sort(d3.ascending), .75);
      const interQuantileRange = q3 - q1;
      const min = Math.max(0, q1 - 1.5 * interQuantileRange);
      const max = q3 + 1.5 * interQuantileRange;
      return { key, value: { q1, median, q3, interQuantileRange, min, max } };
    });

    // Append an SVG element to the container
    const svg = container.append("svg").attr("viewBox", [-margin.left * 2, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);

    // Define scales and axes
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(sumstat, (d) => d.value.max)])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(sumstat.map((d) => d.key))
      .range([0, height])
      .padding(0.1);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale);

    // Add the X and Y axis to the SVG
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Add the main vertical line for the box
    g.selectAll("vertLines")
      .data(sumstat)
      .join("line")
      .attr("x1", function (d) { return (xScale(d.value.min)) })
      .attr("x2", function (d) { return (xScale(d.value.max)) })
      .attr("y1", function (d) { return (yScale(d.key) + yScale.bandwidth() / 2) })
      .attr("y2", function (d) { return (yScale(d.key) + yScale.bandwidth() / 2) })
      .attr("stroke", boxStroke)
      .style("width", 40);

    // Rectangle for the main box
    g.selectAll("boxes")
      .data(sumstat)
      .join("rect")
      .attr("y", d => yScale(d.key))
      .attr("height", yScale.bandwidth())
      .attr("x", d => xScale(d.value.q1))
      .attr("width", d => (xScale(d.value.q3) - xScale(d.value.q1)))
      .attr("stroke", boxStroke)
      .style("fill", boxFill);

    // Show median (median mark)
    g.selectAll("medianLines")
      .data(sumstat)
      .join("line")
      .attr("y1", function (d) { return (yScale(d.key)) })
      .attr("y2", function (d) { return (yScale(d.key) + yScale.bandwidth()) })
      .attr("x1", function (d) { return (xScale(d.value.median)) })
      .attr("x2", function (d) { return (xScale(d.value.median)) })
      .attr("stroke", medianStroke)
      .style("width", 80);

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
      tooltip.style("visibility", "visible");
      tooltip.html(`<strong> ${d.job_title}</strong><br> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.salary)}`);
    }

    const mousemove = function (event, d) {
      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    }

    const mouseleave = function (event, d) {
      tooltip.style("visibility", "hidden");
    }

    // Add individual points with jitter
    g.selectAll("indPoints")
      .data(data)
      .join("circle")
      .attr("cx", function (d) { return xScale(d.salary); })
      .attr("cy", function (d) { return yScale(d.job_title) + (yScale.bandwidth() / 2) - jitterWidth / 2 + Math.random() * jitterWidth; })
      .attr("r", 4)
      .style("fill", function (d, i) { return colours(i); }) // Colour scheme for data points
      .attr("stroke", "black")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }).catch((error) => {
    console.error("Error loading the data", error);
  });
