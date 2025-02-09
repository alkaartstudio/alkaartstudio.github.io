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

// Dark Mode Toggle
document.getElementById("dark-mode-toggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Mobile Menu Toggle
document.getElementById("menu-toggle").addEventListener("click", function() {
    document.querySelector("nav ul").classList.toggle("active");
});
