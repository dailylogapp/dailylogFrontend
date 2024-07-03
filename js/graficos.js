document.addEventListener("DOMContentLoaded", async function () {
  const ctx = document.getElementById("stackedBarChart").getContext("2d");
  const totalCtx = document.getElementById("totalBarChart").getContext("2d"); // Nuevo contexto para el gráfico total
  let monthlyCategoryChart = null;

  // Definir colores por defecto
  const defaultColors = {
    backgroundColor: "rgba(201, 203, 207, 0.2)",
    borderColor: "rgb(201, 203, 207)",
  };

  // Definir colores para cada categoría
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

  // Gráfico de totales
  try {
    const response = await axios.get(
      "https://dailylog-8e20.onrender.com/logs/totalsByMonth"
    );
    const data = response.data;

    const months = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OCT",
      "NOV",
      "DIC",
    ];

    const categories = Object.keys(data[1]);
    const datasets = categories.map((category) => {
      const colors = categoryColors[category] || defaultColors;
      return {
        label: category,
        data: Object.values(data).map((monthData) => monthData[category] || 0),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
      };
    });

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: datasets,
      },
      options: {
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
      },
    });

    // Obtener los totales de cada mes desde el endpoint
    const totalData = await Promise.all(
      months.map(async (_, index) => {
        const response = await axios.get(
          `https://dailylog-8e20.onrender.com/logs/totalMes/${index + 1}`
        );
        return response.data.total; // Asume que la respuesta contiene el total en 'response.data.total'
      })
    );

    new Chart(totalCtx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Total por Mes",
            data: totalData,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Total por Mes (Todas las Categorías)",
          },
        },
        responsive: true,
        scales: {
          x: {
            stacked: false,
          },
          y: {
            stacked: false,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching data for the chart:", error);
  }

  // Configuración del botón "Generar Gráfico"
  document
    .getElementById("filter-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const category = document.getElementById("categoryChart").value;
      obtenerDatosGrafico(category);
    });

  function obtenerDatosGrafico(category) {
    if (monthlyCategoryChart) {
      monthlyCategoryChart.destroy();
    }

    axios
      .get(
        `https://dailylog-8e20.onrender.com/logs/totalsByMonthAndCategory/${category}`
      )
      .then((response) => {
        const totalsByMonth = response.data;
        mostrarGrafico(totalsByMonth);
      })
      .catch((error) => {
        console.error(`Error al obtener los datos del gráfico:`, error);
      });
  }

  // Gráfico donde el usuario elige categoría (interactivo)
  function mostrarGrafico(totalsByMonth) {
    const ctx = document.getElementById("chooseCategoryChart").getContext("2d");
    const selectedCategory = document.getElementById("categoryChart").value;

    // Obtener los colores de la categoría seleccionada del gráfico principal
    const colors = categoryColors[selectedCategory] || defaultColors;

    monthlyCategoryChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(totalsByMonth),
        datasets: [
          // El error podría estar ocurriendo aquí
          {
            label: "Total",
            data: Object.values(totalsByMonth),
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: "Meses",
            },
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: "Total",
            },
          },
        },
      },
    });
  }
});
