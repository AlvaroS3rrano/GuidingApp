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
}

/**
 * Redirects to the node editing page.
 * @param {number} nodeId - The ID of the node to edit.
 */
function editNode(nodeId) {
    window.location.href = '/nodes/edit?id=' + nodeId;
}

/**
 * Redirects to the page to create a new node.
 */
function addNewNode() {
    // Assumes the mapId is available in a hidden input in the general info form
    let mapId = document.querySelector('input[name="id"]').value;
    window.location.href = '/nodes/new?mapId=' + mapId;
}

// Set the initial tab when the page loads
window.onload = function() {
    showTab('generalInfo');
};

document.addEventListener("DOMContentLoaded", function() {
    const matrixForm = document.getElementById("matrixModificationForm");
    if (matrixForm) {
        matrixForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Prevent the page from reloading immediately
            const formData = new FormData(matrixForm);

            fetch(matrixForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest" // Indicate that this is an AJAX request
                }
            })
                .then(response => response.json()) // Parse the JSON response
                .then(data => {
                    if (!data.success) {
                        alert(data.errorMessage);
                    } else {
                        // If the operation was successful, reload the page to update the view
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error("Error in request:", error);
                });
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Load the node modal partial from the controller endpoint
    fetch('/partials/nodeModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('modalContainer').innerHTML = html;
            // Dynamically load nodeModal.js if it's not already included via a <script> tag in the template
            let script = document.createElement('script');
            script.src = '/js/nodeModal.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading node modal:', error));
});

