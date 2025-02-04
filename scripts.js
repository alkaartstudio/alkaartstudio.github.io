document.addEventListener("DOMContentLoaded", function () {
    let galleryGrid = document.getElementById("galleryGrid");

    fetch("artworks.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(artwork => {
                let imgElement = document.createElement("img");
                imgElement.src = `images/Artwork/${artwork.file}`;
                imgElement.alt = artwork.title || "Artwork";
                imgElement.classList.add("gallery-image");
                galleryGrid.appendChild(imgElement);
            });
        })
        .catch(error => console.error("Error loading images:", error));
});
