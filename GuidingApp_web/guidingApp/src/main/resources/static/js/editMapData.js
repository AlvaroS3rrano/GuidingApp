window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    // Use the tab value directly if available, otherwise default to "generalInfo"
    const tab = urlParams.get('tab') || "generalInfo";
    showTab(tab);
};

/**
 * Displays the tab content with the given tabId while hiding the others.
 * @param {string} tabId - The id of the tab content to display.
 */
function showTab(tabId) {
    let tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');

    // Update the URL parameter "tab" without reloading the page.
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
}

document.addEventListener("DOMContentLoaded", function () {
    // Load the error modal partial from the controller endpoint
    fetch('/partials/errorModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('errorContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading error modal:', error));
});

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
                        // If the operation was successful, reload the page to update the view
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error("Error in matrix modification request:", error);
                    openErrorModal(error.message);
                });
        });
    }
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
    // Load the confirm modal partial from the controller endpoint
    fetch('/partials/confirmModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('confirmContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading confirm modal:', error));
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

function openErrorModal(message) {
    const errorModalMessage = document.getElementById("errorModalMessage");
    errorModalMessage.textContent = message;
    document.getElementById("errorModalOverlay").style.display = "flex";
}

function closeErrorModal() {
    document.getElementById("errorModalOverlay").style.display = "none";
}


