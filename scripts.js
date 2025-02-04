document.addEventListener("DOMContentLoaded", function () {
    let galleryGrid = document.getElementById("galleryGrid");

    // List of image filenames (This can be generated dynamically if you use a backend)
    let images = ["art1.png", "art2.png", "art3.png", "art4.png", "art5.png", "art6.png"];

    images.forEach(image => {
        let imgElement = document.createElement("img");
        imgElement.src = `images/Artwork/${image}`;
        imgElement.alt = "Artwork";
        imgElement.classList.add("gallery-image");
        galleryGrid.appendChild(imgElement);
    });
});
