// Define default colors
const defaultColors = {
  backgroundColor: "rgba(201, 203, 207, 0.2)",
  borderColor: "rgb(201, 203, 207)",
};

// Define colors for each category
const categoryColors = {
  ALIMENTOS: {
    backgroundColor: "rgba(255, 99, 132, 0.2)",
    borderColor: "rgb(255, 99, 132)",
  },
  LIMPIEZA: {
    backgroundColor: "rgba(255, 159, 64, 0.2)",
    borderColor: "rgb(255, 159, 64)",
  },
  TRANSPORTE: {
    backgroundColor: "rgba(255, 205, 86, 0.2)",
    borderColor: "rgb(255, 205, 86)",
  },
  SERVICIOS: {
    backgroundColor: "rgba(75, 192, 192, 0.2)",
    borderColor: "rgb(75, 192, 192)",
  },
  FARMACIA: {
    backgroundColor: "rgba(54, 162, 235, 0.2)",
    borderColor: "rgb(54, 162, 235)",
  },
};

// Define months
const months = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SET", "OCT", "NOV", "DIC",
];

// Function to create a chart
function createChart(ctx, type, labels, datasets, options) {
  return new Chart(ctx, {
    type: type,
    data: { labels, datasets },
    options: options
  });
}

// Function to fetch totals by month
async function fetchTotalsByMonth() {
  try {
    const response = await axios.get("https://dailylog-8e20.onrender.com/logs/totalsByMonth");
    return response.data;
  } catch (error) {
    console.error("Error fetching data for the chart:", error);
    throw error;
  }
}

// Function to process data for stacked chart
function processDataForStackedChart(data) {
  const categories = Object.keys(data[1]);
  return categories.map((category) => {
    const colors = categoryColors[category] || defaultColors;
    return {
      label: category,
      data: Object.values(data).map((monthData) => monthData[category] || 0),      
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1,
    };
  });
}

// Function to fetch data for a specific category
async function fetchDataForCategory(category) {
  try {
    const response = await axios.get(`https://dailylog-8e20.onrender.com/logs/totalsByMonthAndCategory/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for category ${category}:`, error);
    throw error;
  }
}

// Function to display category-specific chart
function displayCategoryChart(totalsByMonth, category) {
  const ctx = document.getElementById("chooseCategoryChart").getContext("2d");
  const colors = categoryColors[category] || defaultColors;

  if (window.monthlyCategoryChart) {
    window.monthlyCategoryChart.destroy();
  }

  window.monthlyCategoryChart = createChart(ctx, 'bar', Object.keys(totalsByMonth), [{
    label: "Total",
    data: Object.values(totalsByMonth),
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    borderWidth: 1,
  }], {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Meses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: `Monthly Totals for ${category}`,
      },
    },
  });
}

// New function to fetch total data for each month
async function fetchMonthlyTotals() {
  try {
    const response = await axios.get("https://dailylog-8e20.onrender.com/logs/totalsByMonth");
    const data = response.data;
    return months.map(month => {
      const monthData = data[months.indexOf(month) + 1] || {};
      return Object.values(monthData).reduce((sum, value) => sum + value, 0);
    });
  } catch (error) {
    console.error("Error fetching monthly totals:", error);
    throw error;
  }
}

// New function to display the total monthly chart
function displayTotalMonthlyChart(totalData) {
  const ctx = document.getElementById("totalBarChart").getContext("2d");

  if (window.totalMonthlyChart) {
    window.totalMonthlyChart.destroy();
  }

  window.totalMonthlyChart = createChart(ctx, 'bar', months, [{
    label: "Total Mensual",
    data: totalData,
    backgroundColor: "rgba(75, 192, 192, 0.2)",
    borderColor: "rgb(75, 192, 192)",
    borderWidth: 1,
  }], {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Meses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Gastado",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Totales Generales Mensuales",
      },
    },
  });
}

// Main function to initialize charts
async function initializeCharts() {
  const stackedCtx = document.getElementById("stackedBarChart").getContext("2d");

  try {
    const data = await fetchTotalsByMonth();
    const datasets = processDataForStackedChart(data);

    createChart(stackedCtx, 'bar', months, datasets, {
      plugins: {
        title: {
          display: true,
          text: "Monthly Totals by Category",
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    });

    // Create the new total monthly chart
    const totalData = await fetchMonthlyTotals();
    displayTotalMonthlyChart(totalData);

  } catch (error) {
    console.error("Failed to create stacked chart:", error);    
  }
}

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();

  // Add event listener for the filter form
  document.getElementById("filter-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const category = document.getElementById("categoryChart").value;
    try {
      const totalsByMonth = await fetchDataForCategory(category);
      displayCategoryChart(totalsByMonth, category);
    } catch (error) {
      console.error("Failed to display category chart:", error);      
    }
  });
});
