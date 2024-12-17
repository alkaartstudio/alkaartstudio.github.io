// Carousel Navigation
const carouselImages = document.querySelector('.carousel-images');
const images = Array.from(carouselImages.children);
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

function updateCarousel() {
    const imageWidth = images[0].clientWidth;
    carouselImages.style.transform = `translateX(${-currentIndex * imageWidth}px)`;
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
});

window.addEventListener('resize', updateCarousel);
