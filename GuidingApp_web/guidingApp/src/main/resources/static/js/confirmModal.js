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

function closeConfirmModal() {
    document.getElementById('confirmModalOverlay').style.display = 'none';
    // Clear the onclick handler
    document.getElementById('confirmAcceptButton').onclick = null;
}
