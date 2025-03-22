document.addEventListener("DOMContentLoaded", function () {
    // Load the confirmation modal partial from the controller endpoint
    fetch('/partials/confirmModal')
        .then(response => response.text())
        .then(html => {
            document.getElementById('confirmContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading confirm modal:', error));
});

let currentPage = 0;
const pageSize = 5;

function loadMapDataPage(page) {
    fetch(`/mapData/page?page=${page}&size=${pageSize}`)
        .then(response => response.json())
        .then(data => {
            const list = document.querySelector('.mapdata-list');
            list.innerHTML = "";
            data.content.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('mapdata-item');
                li.innerHTML = `                   
                    <span class="map-name">${item.name}</span>
                    <div class="action-buttons">
                        <button class="btn view-btn" title="View">
                            <!-- SVG del ojo, por ejemplo -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="currentColor" style="width:16px; height:16px;">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </button>
                        <!-- Envolvemos el botón de edición en un enlace -->
                        <a href="/mapData/edit/${item.id}" title="Edit">
                            <button class="btn edit-btn">
                                <!-- SVG del lápiz -->
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                                     style="width:16px; height:16px;">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2L2 11.207V14h2.793L14 4.793 11.207 2z"/>
                                </svg>
                            </button>
                        </a>
                        <button class="btn delete-btn" title="Delete" onclick="confirmDeleteMapData(${item.id})">
                            <!-- SVG de la papelera -->
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                                 style="width:16px; height:16px;">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0V6H6v6.5a.5.5 0 0 1-1 0v-7z"/>
                                <path fill-rule="evenodd"
                                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2h3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/>
                            </svg>
                        </button>
                    </div>
                `;
                list.appendChild(li);
            });

            const totalPages = data.totalPages;
            document.getElementById("prevPageBtn").disabled = (page === 0);
            document.getElementById("nextPageBtn").disabled = (page + 1 >= totalPages);
        })
        .catch(error => console.error('Error al cargar MapData:', error));
}
document.addEventListener("DOMContentLoaded", function() {
    loadMapDataPage(currentPage);

    document.getElementById("nextPageBtn").addEventListener("click", function(){
        currentPage++;
        loadMapDataPage(currentPage);
    });

    document.getElementById("prevPageBtn").addEventListener("click", function(){
        if(currentPage > 0) {
            currentPage--;
            loadMapDataPage(currentPage);
        }
    });
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


