// confirmModal.js

/**
 * Opens the confirmation modal with a custom message and sets up the Accept callback.
 * @param {string} message - The message to display in the modal.
 * @param {function} onAccept - The callback function to execute if the user accepts.
 */
function openConfirmModal(message, onAccept) {
    const overlay = document.getElementById('confirmModalOverlay');
    document.getElementById('confirmModalMessage').textContent = message;
    overlay.style.display = 'flex';

    // Set the Accept button's onclick handler to call the callback then close the modal
    document.getElementById('confirmAcceptButton').onclick = function () {
        onAccept();
        closeConfirmModal();
    };

    // Also close the modal if clicking outside the modal content
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
            closeConfirmModal();
        }
    });
}

function confirmDeleteNode(nodeId, mapId) {
    openConfirmModal("Are you sure you want to delete this node?", function () {
        fetch('/nodes/delete?id=' + nodeId + '&mapId=' + mapId, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert("Error deleting node.");
                } else {
                    // Optionally, refresh the nodes list; here we'll simply reload the page
                    window.location.href = "/mapData/edit/" + mapId + "?tab=nodes";
                }
            })
            .catch(error => {
                console.error("Error deleting node:", error);
            });

    });
}

function closeConfirmModal() {
    document.getElementById('confirmModalOverlay').style.display = 'none';
    // Clear the onclick handler
    document.getElementById('confirmAcceptButton').onclick = null;
}
