// Define the margin
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Define the dimensions of the chart
const width = document.querySelector("#dataTable").clientWidth - margin.left - margin.right;
const height = document.querySelector("#dataTable").clientHeight - margin.top - margin.bottom;

// Select the container element
const container = d3.select("#dataTable");

// Load the CSV file
d3.csv("./data/ds_salaries.csv").then((csvData) => {
  csvData.forEach((d) => {
    d.work_year = +d.work_year;
    d.experience_level = d.experience_level;
    d.employment_type = d.employment_type;
    d.job_title = d.job_title;
    d.salary = +d.salary;
    d.salary_currency = d.salary_currency;
    d.salary_in_usd = +d.salary_in_usd;
    d.employee_residence = d.employee_residence;
    d.remote_ratio = +d.remote_ratio;
    d.company_location = d.company_location;
    d.company_size = d.company_size;
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
      let text = value;
      if (key === 'salary') {
        text = new Intl.NumberFormat('en-US', { style: 'currency', currency: d.salary_currency }).format(value);
      }
      if (key === 'salary_in_usd') {
        text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      }
      const cell = row.append("td")
        .style("border", "1px solid black")
        .style("padding", "8px")
        .text(text);

      if (key !== "job_title") {
        cell.style("width", "125px")
          .style("text-align", "center");
      }
    });
  });
});
