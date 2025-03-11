/**
 * Displays the tab content with the given tabId while hiding the others.
 * @param {string} tabId - The id of the tab content to display.
 */
function showTab(tabId) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');
}

/**
 * Adds a new number input field to the dynamic numbers container.
 */
function addNumberField() {
    var container = document.getElementById('dynamicNumbers');
    var input = document.createElement('input');
    input.type = 'number';
    input.name = 'customNumbers[]'; // Name as an array for backend processing
    input.placeholder = 'Enter number';
    container.appendChild(input);
    container.appendChild(document.createElement('br'));
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

