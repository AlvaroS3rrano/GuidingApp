document.addEventListener('DOMContentLoaded', function () {
    let scale = 1;
    const matrixContainer = document.getElementById('matrixContainer');

    // Get the SVG element within the container
    const svgElement = matrixContainer.querySelector('svg');

    // Function to update zoom with dynamic transform origin
    function updateZoom() {
        // Calculate the center of the visible area in the container
        const containerRect = matrixContainer.getBoundingClientRect();
        const scrollLeft = matrixContainer.scrollLeft;
        const scrollTop = matrixContainer.scrollTop;

        const visibleCenterX = scrollLeft + matrixContainer.clientWidth / 2;
        const visibleCenterY = scrollTop + matrixContainer.clientHeight / 2;

        // Set the transform origin relative to the SVG element in pixels.
        // Note: If your SVG dimensions are different from the container dimensions,
        // you might need to adjust the computed values accordingly.
        svgElement.style.transformOrigin = `${visibleCenterX}px ${visibleCenterY}px`;

        // Apply the zoom (scale transformation)
        svgElement.style.transform = `scale(${scale})`;
    }

    // Zoom in button event
    document.getElementById('zoomInBtn').addEventListener('click', function () {
        scale += 0.1;
        updateZoom();
    });

    // Zoom out button event
    document.getElementById('zoomOutBtn').addEventListener('click', function () {
        if (scale > 0.2) { // Prevent the scale from becoming too small
            scale -= 0.1;
            updateZoom();
        }
    });

    // Reset zoom button event
    document.getElementById('resetZoomBtn').addEventListener('click', function () {
        scale = 1;
        updateZoom();
    });

    // Optionally, update transform origin on scroll if the visible area changes
    matrixContainer.addEventListener('scroll', updateZoom);
});
