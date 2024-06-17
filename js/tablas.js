document.addEventListener("DOMContentLoaded", function () {
  let logToDeleteId = null;
  let logToEditId = null;
  let logs = []; // Asegúrate de que la variable logs esté definida en un ámbito accesible

  async function fetchLogs() {
    try {
      const response = await axios.get("https://dailylog-8e20.onrender.com/logs");
      logs = response.data; // Asigna los datos a la variable logs
      renderLogs();
    } catch (error) {
      console.error("There was an error fetching the logs!", error);
    }
  }

  function renderLogs() {
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

    // Agregar eventos a los botones de eliminación y edición
    addEventListeners();
  }

  function addEventListeners() {
    document.querySelectorAll(".delete-log-button").forEach((button) => {
      button.addEventListener("click", function () {
        logToDeleteId = this.getAttribute("data-log-id");
        const deleteConfirmationModal = new bootstrap.Modal(
          document.getElementById("deleteConfirmationModal")
        );
        deleteConfirmationModal.show();
      });
    });

    document.querySelectorAll(".edit-log-button").forEach((button) => {
      button.addEventListener("click", function () {
        logToEditId = this.getAttribute("data-log-id");
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
  }

  // Confirmar eliminación
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", function () {
      axios
        .delete(`https://dailylog-8e20.onrender.com/logs/${logToDeleteId}`)
        .then((response) => {
          console.log(`Log with ID ${logToDeleteId} has been deleted.`);
          // Ocultar el modal de confirmación de eliminación
          const deleteConfirmationModal = bootstrap.Modal.getInstance(
            document.getElementById("deleteConfirmationModal")
          );
          deleteConfirmationModal.hide();
          // Mostrar el modal de eliminación exitosa
          const deleteSuccessModal = new bootstrap.Modal(
            document.getElementById("deleteSuccessModal")
          );
          deleteSuccessModal.show();
          // Actualizar la tabla sin recargar la página
          logs = logs.filter((log) => log.id !== parseInt(logToDeleteId));
          renderLogs();
        })
        .catch((error) => {
          console.error(`There was an error deleting the log:`, error);
        });
    });
  }

  // Confirmar edición
  const confirmEditButton = document.getElementById("confirmEditButton");
  if (confirmEditButton) {
    confirmEditButton.addEventListener("click", function (event) {
      event.preventDefault(); // Prevenir el envío del formulario por defecto
      const updatedLog = {
        date: document.getElementById("edit-date").value,
        description: document.getElementById("edit-description").value,
        store: document.getElementById("edit-store").value,
        price: document.getElementById("edit-price").value,
        category: document.getElementById("edit-category").value,
        paymentMethod: document.getElementById("edit-paymentMethod").value,
      };

      axios
        .put(`https://dailylog-8e20.onrender.com/${logToEditId}`, updatedLog)
        .then((response) => {
          console.log(`Log with ID ${logToEditId} has been updated.`);
          // Cerrar el modal de edición
          const editLogModal = bootstrap.Modal.getInstance(
            document.getElementById("editLogModal")
          );
          editLogModal.hide();
          // Mostrar el modal de edición exitosa
          const editSuccessModal = new bootstrap.Modal(
            document.getElementById("confirmationModal")
          );
          document.getElementById("confirmationModalBody").innerText =
            "El registro ha sido editado exitosamente.";
          editSuccessModal.show();
          // Actualizar la tabla sin recargar la página
          const index = logs.findIndex(
            (log) => log.id === parseInt(logToEditId)
          );
          if (index !== -1) {
            logs[index] = { id: logToEditId, ...updatedLog };
            renderLogs();
          }
        })
        .catch((error) => {
          console.error(`There was an error updating the log:`, error);
        });
    });
  }

  // Agregar un nuevo registro
  const addLogForm = document.getElementById("addLogForm");
  if (addLogForm) {
    addLogForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevenir el envío del formulario por defecto
      const newLog = {
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
        store: document.getElementById("store").value,
        price: document.getElementById("price").value,
        category: document.getElementById("categoryAdd").value,
        paymentMethod: document.getElementById("paymentMethod").value,
      };

      axios
        .post("https://dailylog-8e20.onrender.com/logs/addlog", newLog)
        .then((response) => {
          console.log("New log has been added.");
          // Cerrar el modal de agregar registro
          const addLogModal = bootstrap.Modal.getInstance(
            document.getElementById("addLogModal")
          );
          addLogModal.hide();
          // Mostrar el modal de confirmación de agregado de registro
          const confirmationModal = new bootstrap.Modal(
            document.getElementById("confirmationModal")
          );
          document.getElementById("confirmationModalBody").innerText =
            "El registro ha sido agregado exitosamente.";
          confirmationModal.show();
          fetchLogs();
          // Actualizar la tabla sin recargar la página
          if (response.data) {
            logs.push(response.data);
            renderLogs();
          } else {
            console.error("Error: Response data is invalid.");
          }
        })
        .catch((error) => {
          console.error("There was an error adding the log:", error);
        });
    });
  }

  // Cargar logs al cargar la página
  fetchLogs();
});
