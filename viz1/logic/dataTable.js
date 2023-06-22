// Define the margin
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Define the dimensions of the chart
const width = document.querySelector("#dataTable").clientWidth - margin.left - margin.right;
const height = document.querySelector("#dataTable").clientHeight - margin.top - margin.bottom;

// Select the container element
const container = d3.select("#dataTable");

// Load the CSV file
d3.csv("./data/Google_graveyard.csv").then((csvData) => {
  csvData.forEach((d) => {
    d.Start = +d.Start;
    d.End = +d.End;
    d.Duration = d.Duration;
    d['Total years'] = +d['Total years'];
  });

  // Create the table element
  const table = container.append("table")
    .attr("width", "100%")
    .style("border-collapse", "collapse");

  // Append the table header
  const thead = table.append("thead");
  const headerRow = thead.append("tr");
  Object.keys(csvData[0]).forEach((key) => {
    headerRow.append("th")
      .style("border", "1px solid black")
      .style("padding", "8px")
      .text(key);
  });

  // Append the table body
  const tbody = table.append("tbody");
  csvData.forEach((d) => {
    const row = tbody.append("tr");
    Object.entries(d).forEach(([key, value]) => {
      const cell = row.append("td")
        .style("border", "1px solid black")
        .style("padding", "8px")
        .text(value);

      if (key !== "Description") {
        cell.style("width", "125px")
          .style("text-align", "center");
      }
    });
  });
});
