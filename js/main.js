document.addEventListener("DOMContentLoaded", async function () {
  const ctx = document.getElementById("stackedBarChart").getContext("2d");
  let monthlyCategoryChart = null;
  let logToDeleteId = null;
  let logToEditId = null;

  // Gráfico de totales
  try {
    const response = await axios.get(
      "http://localhost:8080/logs/totalsByMonth"
    );
    const data = response.data;

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const categories = Object.keys(data[1]);
    const datasets = categories.map((category) => {
      return {
        label: category,
        data: Object.values(data).map((monthData) => monthData[category] || 0),
        backgroundColor: getRandomColor(),
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
      .get(`http://localhost:8080/logs/totalsByMonthAndCategory/${category}`)
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

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Obtener lista de logs y renderizar tabla
  axios
    .get("http://localhost:8080/logs")
    .then((response) => {
      const logs = response.data;
      const logsList = document.getElementById("logs-list");
      logsList.innerHTML = ""; // Clear existing logs before appending

      logs.forEach((log) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${log.id}</td>
          <td>${log.date}</td>
          <td>${log.description}</td>
          <td>${log.store}</td>
          <td>${log.price}</td>
          <td>${log.category}</td>
          <td>${log.paymentMethod}</td>
          <td>
            <button type="button" class="btn btn-warning btn-sm edit-log-button" data-log-id="${log.id}">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button type="button" class="btn btn-danger btn-sm delete-log-button" data-log-id="${log.id}">
              <i class="bi bi-x-square"></i>
            </button>
          </td>
        `;

        logsList.appendChild(row);
      });

      // Agregar eventos a los botones de eliminación
      document.querySelectorAll(".delete-log-button").forEach((button) => {
        button.addEventListener("click", function () {
          logToDeleteId = this.getAttribute("data-log-id");
          const deleteConfirmationModal = new bootstrap.Modal(
            document.getElementById("deleteConfirmationModal")
          );
          deleteConfirmationModal.show();
        });
      });

      // Agregar eventos a los botones de edición
      document.querySelectorAll(".edit-log-button").forEach((button) => {
        button.addEventListener("click", function () {
          logToEditId = this.getAttribute("data-log-id");
          // Llenar el modal con los datos del log
          const log = logs.find((l) => l.id === parseInt(logToEditId));
          if (log) {
            document.getElementById("edit-date").value = log.date;
            document.getElementById("edit-description").value = log.description;
            document.getElementById("edit-store").value = log.store;
            document.getElementById("edit-price").value = log.price;
            document.getElementById("edit-category").value = log.category;
            document.getElementById("edit-paymentMethod").value =
              log.paymentMethod;
            const editLogModal = new bootstrap.Modal(
              document.getElementById("editLogModal")
            );
            editLogModal.show();
          }
        });
      });
    })
    .catch((error) => {
      console.error("There was an error fetching the logs!", error);
    });

  // Confirmar eliminación
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", function () {
      axios
        .delete(`http://localhost:8080/logs/${logToDeleteId}`)
        .then((response) => {
          console.log(`Log with ID ${logToDeleteId} has been deleted.`);
          location.reload(); // Refresh the page to reflect changes
        })
        .catch((error) => {
          console.error(`There was an error deleting the log:`, error);
        });
    });

  // Confirmar edición
  document
    .getElementById("confirmEditButton")
    .addEventListener("click", function () {
      const updatedLog = {
        date: document.getElementById("edit-date").value,
        description: document.getElementById("edit-description").value,
        store: document.getElementById("edit-store").value,
        price: document.getElementById("edit-price").value,
        category: document.getElementById("edit-category").value,
        paymentMethod: document.getElementById("edit-paymentMethod").value,
      };

      axios
        .put(`http://localhost:8080/logs/update/${logToEditId}`, updatedLog)
        .then((response) => {
          console.log(`Log with ID ${logToEditId} has been updated.`);
          // Cerrar el modal de edición
          const editLogModal = bootstrap.Modal.getInstance(
            document.getElementById("editLogModal")
          );
          editLogModal.hide();

          // Mostrar el modal de confirmación con el mensaje del backend
          const confirmationModalBody = document.getElementById(
            "confirmationModalBody"
          );
          confirmationModalBody.textContent = response.data; // Establecer el mensaje de confirmación en el cuerpo del modal
          const confirmationModal = new bootstrap.Modal(
            document.getElementById("confirmationModal")
          );
          confirmationModal.show();
        })
        .catch((error) => {
          console.error(`There was an error updating the log:`, error);
        });
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
      category: document.getElementById("categoryAdd").value,
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
});
