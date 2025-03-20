function openNodeModal(node = null) {
    const form = document.getElementById("nodeForm");
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitButton");
    const mapId = document.querySelector('input[name="id"]').value;
    document.getElementById("mapId").value = mapId;

    if (node) {
        // Edit mode: pre-fill the form fields
        modalTitle.textContent = "Edit Node";
        document.getElementById("nodeId").value = node.id;
        document.getElementById("nodeName").value = node.name;
        document.getElementById("beaconId").value = node.beaconId;
        document.getElementById("xCoord").value = node.x;
        document.getElementById("yCoord").value = node.y;
        form.action = "/nodes/edit";
        submitButton.textContent = "Update Node";

        // If the node has an area, pre-fill the areaCoordinates textarea using JSON
        if (node.area && Array.isArray(node.area) && node.area.length > 0) {
            document.getElementById("areaCoordinates").value = JSON.stringify(node.area);
        } else {
            document.getElementById("areaCoordinates").value = "";
        }
    } else {
        // Create mode: reset the form and set default values
        modalTitle.textContent = "Create Node";
        form.reset();
        document.getElementById("nodeId").value = "";
        document.getElementById("mapId").value = mapId;
        form.action = "/nodes/new";
        submitButton.textContent = "Create Node";
    }
    // Display the modal
    document.getElementById("nodeModalOverlay").style.display = "flex";
    document.getElementById("xCoord").addEventListener("input", checkCoordinates);
    document.getElementById("yCoord").addEventListener("input", checkCoordinates);
    const areaEl = document.getElementById("areaCoordinates");
    console.log("areaCoordinates element:", areaEl);
    if (areaEl) {
        areaEl.addEventListener("input", checkAreaCoordinates);
    }
}

/**
 * Closes the node modal.
 */
function closeNodeModal() {
    document.getElementById("nodeModalOverlay").style.display = "none";
}

function attachNodeFormListener() {
    const nodeForm = document.getElementById("nodeForm");

    nodeForm.addEventListener("submit", function (e) {
        e.preventDefault(); // prevent default form submission

        checkCoordinates();
        checkAreaCoordinates();

        const submitButton = document.getElementById("submitButton");
        if (submitButton.disabled) {
            return;
        }

        const formData = new FormData(nodeForm);
        fetch(nodeForm.action, {
            method: "POST",
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert(data.errorMessage);
                } else {
                    // Redirect to the provided URL, which opens the map edit page in the nodes tab
                    window.location.href = data.redirectUrl;
                }
            })
            .catch(error => {
                console.error("Error in node form submission:", error);
            });
    });

    const overlay = document.getElementById('nodeModalOverlay');
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
            closeNodeModal();
        }
    });
}

function checkCoordinates() {
    const xInput = document.getElementById("xCoord");
    const yInput = document.getElementById("yCoord");
    const submitButton = document.getElementById("submitButton");
    const errorMessage = document.getElementById("coordErrorMessage");

    const x = parseInt(xInput.value, 10);
    const y = parseInt(yInput.value, 10);

    if (isNaN(x) || isNaN(y)) {
        submitButton.disabled = true;
        errorMessage.textContent = "Ingrese ambos valores numéricos.";
        return;
    }

    const matrixRows = parseInt(document.getElementById("matrixRows").value, 10);
    const matrixCols = parseInt(document.getElementById("matrixCols").value, 10);

    // Comprobar que las coordenadas estén dentro de los límites:
    if (x < 0 || x >= matrixCols || y < 0 || y >= matrixRows) {
        submitButton.disabled = true;
        errorMessage.textContent = "El punto no es parte de la matriz.";
    } else {
        submitButton.disabled = false;
        errorMessage.textContent = "";
    }
}

function checkAreaCoordinates() {
    const areaInput = document.getElementById("areaCoordinates");
    const errorMessage = document.getElementById("areaErrorMessage");
    const submitButton = document.getElementById("submitButton");
    const matrixRows = parseInt(document.getElementById("matrixRows").value, 10);
    const matrixCols = parseInt(document.getElementById("matrixCols").value, 10);

    // If area is empty, clear any error and allow submission.
    if (!areaInput.value.trim()) {
        errorMessage.textContent = "";
        submitButton.disabled = false;
        return;
    }

    try {
        const area = JSON.parse(areaInput.value);
        if (!Array.isArray(area)) {
            errorMessage.textContent = "Area must be a JSON array.";
            submitButton.disabled = true;
            return;
        }
        for (let point of area) {
            if (!Array.isArray(point) || point.length !== 2) {
                errorMessage.textContent = "Each area point must be an array of two numbers.";
                submitButton.disabled = true;
                return;
            }
            const [x, y] = point;
            if (typeof x !== "number" || typeof y !== "number") {
                errorMessage.textContent = "Each coordinate must be a number.";
                submitButton.disabled = true;
                return;
            }
            if (x < 0 || x >= matrixCols || y < 0 || y >= matrixRows) {
                errorMessage.textContent = `Area coordinate [${x}, ${y}] is out of matrix bounds.`;
                submitButton.disabled = true;
                return;
            }
        }
        // If all points are valid, clear error message.
        errorMessage.textContent = "";
        submitButton.disabled = false;
    } catch (err) {
        errorMessage.textContent = "Invalid JSON format for area.";
        submitButton.disabled = true;
    }
}

