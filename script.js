document.addEventListener("DOMContentLoaded", function () {
    const carouselImages = document.querySelectorAll('.carousel-images img');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;

    // Show the correct image
    function showImage(index) {
        carouselImages.forEach((img, i) => {
            img.style.transform = `translateX(-${index * 100}%)`;
        });
    }

    // Previous button click
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselImages.length - 1;
        showImage(currentIndex);
    });

    // Next button click
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < carouselImages.length - 1) ? currentIndex + 1 : 0;
        showImage(currentIndex);
    });
});
