document.addEventListener('DOMContentLoaded', function () {
    let scale = 1;
    const matrixContainer = document.getElementById('matrixContainer');
    const svgElement = matrixContainer.querySelector('svg');

    // Variables para panning
    let isPanning = false;
    let startX = 0, startY = 0;
    let currentTranslateX = 0, currentTranslateY = 0;

    // Función que aplica la transformación combinada
    function updateTransform() {
        svgElement.style.transformOrigin = '0 0'; // Usamos origen superior izquierdo (puedes ajustarlo)
        svgElement.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${scale})`;
    }

    // Función para actualizar el zoom sin interferir con el panning
    function updateZoom(newScale) {
        scale = newScale;
        updateTransform();
    }

    // Botón Zoom In
    document.getElementById('zoomInBtn').addEventListener('click', function () {
        updateZoom(scale + 0.1);
    });

    // Botón Zoom Out
    document.getElementById('zoomOutBtn').addEventListener('click', function () {
        if (scale > 0.2) {
            updateZoom(scale - 0.1);
        }
    });

    // Botón Reset Zoom
    document.getElementById('resetZoomBtn').addEventListener('click', function () {
        updateZoom(1);
        // Opcionalmente reiniciar el panning:
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateTransform();
    });

    // Eventos para panning usando transform combinado
    matrixContainer.style.cursor = 'grab';

    matrixContainer.addEventListener('mousedown', (e) => {
        isPanning = true;
        matrixContainer.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
    });

    matrixContainer.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Acumulamos el desplazamiento
        currentTranslateX += dx;
        currentTranslateY += dy;

        updateTransform();

        // Actualizamos la posición inicial para el siguiente movimiento
        startX = e.clientX;
        startY = e.clientY;
    });

    matrixContainer.addEventListener('mouseup', () => {
        isPanning = false;
        matrixContainer.style.cursor = 'grab';
    });

    matrixContainer.addEventListener('mouseleave', () => {
        isPanning = false;
        matrixContainer.style.cursor = 'grab';
    });
});
