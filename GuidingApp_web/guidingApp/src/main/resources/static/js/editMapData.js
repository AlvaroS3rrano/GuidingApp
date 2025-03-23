window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    // Use the tab value directly if available, otherwise default to "generalInfo"
    const tab = urlParams.get('tab') || "generalInfo";
    showTab(tab);
};

/**
 * Displays the tab content with the given tabId while hiding the others.
 * @param {string} tabName - The id of the tab content to display.
 */
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';

    // Update the URL parameter "tab" without reloading the page.
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url);
}

document.addEventListener("DOMContentLoaded", function () {
    const matrixForm = document.getElementById("matrixModificationForm");
    if (matrixForm) {
        matrixForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent the page from reloading immediately
            const formData = new FormData(matrixForm);

            fetch(matrixForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest" // Indicate that this is an AJAX request
                }
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(json => {
                            throw new Error(json.errorMessage || "Server returned an error.");
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.success) {
                        openErrorModal(data.errorMessage);
                    } else {
                        document.getElementById("matrixContainer").innerHTML = data.matrixSVG;
                        document.getElementById("coordinates").value = "";
                    }
                })
                .catch(error => {
                    console.error("Error in matrix modification request:", error);
                    openErrorModal(error.message);
                });
        });
    }
});

function discardChanges() {
    openConfirmModal("Are you sure you want to discard your changes?", function () {
        fetch('/mapData/discardChanges', {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(json => {
                        throw new Error(json.errorMessage || "Server returned an error.");
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    openErrorModal("Error discarding changes.");
                } else {
                    const activeTabElement = document.querySelector('.tab-content.active');
                    const activeTab = activeTabElement ? activeTabElement.id : "info";
                    window.location.href = "/mapData/edit/" + data.mapDataId + "?tab=" + activeTab;
                }
            })
            .catch(error => {
                console.error("Error discarding changes:", error);
                openErrorModal(error.message);
            });
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
                    window.location.href = data.redirectUrl;
                }
            })
            .catch(error => {
                console.error("Error deleting node:", error);
            });

    });
}

function openErrorModal(message) {
    const errorModalMessage = document.getElementById("errorModalMessage");
    errorModalMessage.textContent = message;
    document.getElementById("errorModalOverlay").style.display = "flex";
}

function closeErrorModal() {
    document.getElementById("errorModalOverlay").style.display = "none";
}

// LOAD MODALS

document.addEventListener("DOMContentLoaded", function () {
    // Load the confirmation modal partial from the controller endpoint
    fetch('/partials/confirmModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('confirmContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading confirm modal:', error));
});

document.addEventListener("DOMContentLoaded", function () {
    // Load the node modal partial from the controller endpoint
    fetch('/partials/nodeModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('modalContainer').innerHTML = html;
            attachNodeFormListener();
        })
        .catch(error => console.error('Error loading node modal:', error));
});

document.addEventListener("DOMContentLoaded", function () {
    // Load the error modal partial from the controller endpoint
    fetch('/partials/errorModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('errorContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading error modal:', error));
});