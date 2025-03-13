// nodeModal.js

/**
 * Opens the node modal. If a node object is provided, it pre-fills the form for editing.
 * @param {Object|null} node - The node object to edit, or null for create mode.
 */
function openNodeModal(node = null) {
    const form = document.getElementById("nodeForm");
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitButton");

    if (node) {
        // Edit mode: pre-fill the form fields
        modalTitle.textContent = "Edit Node";
        document.getElementById("nodeId").value = node.id;
        document.getElementById("nodeName").value = node.name;
        document.getElementById("beaconId").value = node.beaconId;
        document.getElementById("xCoord").value = node.x;
        document.getElementById("yCoord").value = node.y;
        // Set the form action for editing (your backend must handle POST to /nodes/edit)
        form.action = "/nodes/edit";
        submitButton.textContent = "Update Node";
    } else {
        // Create mode: reset the form and set default values
        modalTitle.textContent = "Create Node";
        form.reset();
        document.getElementById("nodeId").value = "";
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
