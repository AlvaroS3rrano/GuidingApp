window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'nodes') {
        showTab('nodesTab');
    } else {
        showTab('generalInfo');
    }
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
}

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

            attachNodeFormListener();
        })
        .catch(error => console.error('Error loading node modal:', error));
});

