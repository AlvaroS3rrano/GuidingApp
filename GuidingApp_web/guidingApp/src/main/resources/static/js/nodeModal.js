function openNodeModal(node = null) {
    console.log("openNodeModal called with node:", node);
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
    } else {
        // Create mode: reset the form and set default values
        modalTitle.textContent = "Create Node";
        form.reset();
        document.getElementById("nodeId").value = "";
        // Ensure the map id is set for creation
        document.getElementById("mapId").value = mapId;
        // Set the form action for creation
        form.action = "/nodes/new";
        submitButton.textContent = "Create Node";
    }
    // Display the modal
    document.getElementById("nodeModalOverlay").style.display = "flex";
}

/**
 * Closes the node modal.
 */
function closeNodeModal() {
    document.getElementById("nodeModalOverlay").style.display = "none";
}

function attachNodeFormListener() {
    const nodeForm = document.getElementById("nodeForm");
    if (nodeForm) {
        nodeForm.addEventListener("submit", function(e) {
            e.preventDefault(); // prevent default form submission
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
    } else {
        console.error("Node form not found in DOM.");
    }
}
