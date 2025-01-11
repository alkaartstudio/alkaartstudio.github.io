// If you want to use Masonry.js for the Gallery grid layout
document.addEventListener("DOMContentLoaded", function () {
    let masonryGrid = document.querySelector('.masonry-grid');
    if (masonryGrid) {
        new Masonry(masonryGrid, {
            itemSelector: 'img',
            columnWidth: 200,
            gutter: 10
        });
    }
});
