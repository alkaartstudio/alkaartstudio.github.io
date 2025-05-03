
document.addEventListener("DOMContentLoaded", function () {
    let galleryGrid = document.getElementById("galleryGrid");

    if (galleryGrid) {
        const isFullGallery = document.body.classList.contains("full-gallery");
        const imagesToShow = isFullGallery ? null : 12;

        fetch("artworks.json")
            .then(response => response.json())
            .then(data => {
                const items = isFullGallery ? data : data.slice(-imagesToShow).reverse();
                items.forEach(artwork => {
                    let imgElement = document.createElement("img");
                    imgElement.src = `images/Artwork/${artwork.file}`;
                    imgElement.alt = artwork.title || "Artwork";
                    imgElement.classList.add("gallery-image");
                    galleryGrid.appendChild(imgElement);
                });
            })
            .catch(error => console.error("Error loading images:", error));
    }

    document.getElementById("dark-mode-toggle")?.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    document.getElementById("menu-toggle")?.addEventListener("click", () => {
        document.querySelector("nav ul").classList.toggle("active");
    });
});
