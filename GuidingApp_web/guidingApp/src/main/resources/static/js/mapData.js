document.addEventListener("DOMContentLoaded", function () {
    // Load the confirmation modal partial from the controller endpoint
    fetch('/partials/confirmModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('confirmContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading confirm modal:', error));
});

function confirmDeleteMapData(mapDataId) {
    openConfirmModal("Are you sure you want to delete this MapData?", function () {
        fetch(`/mapData/delete?id=${mapDataId}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Por ejemplo, redirige a la lista de MapData
                    window.location.href = '/mapData';
                } else {
                    alert("Error deleting MapData: " + data.errorMessage);
                }
            })
            .catch(error => {
                console.error("Error deleting MapData:", error);
            });
    })
}


