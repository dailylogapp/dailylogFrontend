document.addEventListener("DOMContentLoaded", function () {
  let monthlyCategoryChart = null;

  axios
    .get("http://localhost:8080/logs")
    .then((response) => {
      const logs = response.data;
      const logsList = document.getElementById("logs-list");
      logs.forEach((log) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = log.id;
        row.appendChild(idCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = log.date;
        row.appendChild(dateCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = log.description;
        row.appendChild(descriptionCell);

        const storeCell = document.createElement("td");
        storeCell.textContent = log.store;
        row.appendChild(storeCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = log.price;
        row.appendChild(priceCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = log.category;
        row.appendChild(categoryCell);

        const paymentMethodCell = document.createElement("td");
        paymentMethodCell.textContent = log.paymentMethod;
        row.appendChild(paymentMethodCell);

        logsList.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("There was an error fetching the logs!", error);
    });

  document
    .getElementById("filter-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const category = document.getElementById("category").value;
      obtenerDatosGrafico(category);
    });

  // Función para obtener los datos del backend y mostrar el gráfico
  function obtenerDatosGrafico(category) {
    // Verificar si ya hay un gráfico
    if (monthlyCategoryChart) {
      // Destruir el gráfico existente para evitar errores
      monthlyCategoryChart.destroy();
    }

    // Obtener los totales por mes para la categoría seleccionada
    axios
      .get(`http://localhost:8080/logs/totalsByMonthAndCategory/${category}`)
      .then((response) => {
        const totalsByMonth = response.data;
        mostrarGrafico(totalsByMonth);
      })
      .catch((error) => {
        console.error(`Error al obtener los datos del gráfico:`, error);
      });
  }

  // Función para mostrar el gráfico utilizando Chart.js
  function mostrarGrafico(totalsByMonth) {
    const ctx = document.getElementById("stackedBarChart").getContext("2d");
    monthlyCategoryChart = new Chart(ctx, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Total",
            data: totalsByMonth,
            backgroundColor: getRandomColor(),
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

  // Función para generar un color aleatorio
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
});
