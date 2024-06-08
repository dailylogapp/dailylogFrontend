document.addEventListener("DOMContentLoaded", function () {
  let monthlyCategoryChart = null;

  //Tabla de logs
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

  // Seccion para agregar registros a la tabla
  // Manejar el envío del formulario para agregar un nuevo registro

  // Seleccionar el formulario de agregar registro
  const addLogForm = document.getElementById("addLogForm");

  // Manejar el envío del formulario para agregar un nuevo registro
  addLogForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const log = {
      date: document.getElementById("date").value,
      description: document.getElementById("description").value,
      store: document.getElementById("store").value,
      price: parseFloat(document.getElementById("price").value),
      category: document.getElementById("category").value,
      paymentMethod: document.getElementById("paymentMethod").value,
    };

    // Enviar el objeto log al backend para agregarlo a la base de datos
    axios
      .post("http://localhost:8080/logs/addlog", log)
      .then((response) => {
        // Cerrar el modal después de agregar el registro
        const addLogModal = bootstrap.Modal.getInstance(
          document.getElementById("addLogModal")
        );
        addLogModal.hide();

        // Abrir el modal de confirmación con el mensaje del backend
        const confirmationModalBody = document.getElementById(
          "confirmationModalBody"
        );
        confirmationModalBody.textContent = response.data; // Establecer el mensaje de confirmación en el cuerpo del modal
        const confirmationModal = new bootstrap.Modal(
          document.getElementById("confirmationModal")
        );
        confirmationModal.show();

        // Añadir evento para recargar la página al cerrar el modal de confirmación
        document
          .getElementById("confirmationModal")
          .addEventListener("hidden.bs.modal", function () {
            location.reload();
          });
      })
      .catch((error) => {
        console.error("Error al agregar el registro:", error);
        // Manejar el error según sea necesario (por ejemplo, mostrar un mensaje de error al usuario)
      });
  });

  // Seccion graficos
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
