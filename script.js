// --- CONFIGURATION ---
const GALLERY_CSV_PATH = 'csv/gallery-items.csv';
const COURSES_CSV_PATH = 'csv/courses.csv';
// MASTER SWITCH for Gallery Status Visibility:
// Set this to 'true' to show the 'Available/Sold' status labels to ALL USERS.
// Set this to 'false' (default) to hide the status labels from ALL USERS.
const SHOW_GALLERY_STATUS_TO_ALL = false;

// --- NEWSLETTER INTEGRATION CONFIG (from Google Forms) ---
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSczNsBXWHnKdkn5w5EJsKAAzLhU7AYT3lnsEfOxhr90psoQFQ/formResponse";
const NAME_FIELD_ID = "entry.974773868";
const EMAIL_FIELD_ID = "entry.1930793718";

// --- UTILITY FUNCTIONS ---

/**
 * Generic function to fetch and parse a CSV file.
 */
async function fetchData(path) {
    try {
        const response = await fetch(path);
        const csvText = await response.text();
        
        // --- 🎯 DEBUG A: Check raw text length (Should be > 0) ---
        console.log(`[DEBUG A] Fetched CSV content length for ${path}: ${csvText.length} characters.`);

        // Simple CSV to JSON converter (assuming basic structure without complex quotes/newlines)
        // ... (existing parsing code)
        const lines = csvText.split('\r\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        // --- 🎯 DEBUG B: Check parsing results (Should show data rows found) ---
        if (lines.length <= 1) {
            console.error(`[DEBUG B] ❌ FATAL PARSING ERROR for ${path}: Only found header or zero lines.`);
        } else {
            console.log(`[DEBUG B] ✅ SUCCESS: ${path} parsed. Data rows found: ${lines.length - 1}.`);
        }
        
        const data = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            const row = {};
            headers.forEach((header, i) => {
                row[header] = values[i];
            });
            return row;
        });
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

/**
 * Loads the content of an external HTML file and injects it into a placeholder.
 */
async function loadTemplate(path, placeholderId) {
    try {
        const response = await fetch(path);
        if (response.ok) {
            const html = await response.text();
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                console.warn(`Placeholder with ID '${placeholderId}' not found.`);
            }
        } else {
            console.error(`Failed to load template from ${path}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Template loading error:", error);
    }
}

/**
 * Handles the display logic for the 'Available/Sold' status labels based on the global config.
 */
function setAllStatusLabelsVisibility() {
    // Uses both .status-label (for home) and .status-badge (for full gallery)
    const statusElements = document.querySelectorAll('.status-label, .status-badge');
    statusElements.forEach(label => {
        label.style.display = SHOW_GALLERY_STATUS_TO_ALL ? 'inline-block' : 'none';
    });
}

// --- GALLERY LOGIC ---

/**
 * Generates the HTML string for a single gallery product card.
 *
 * MODIFIED: Splits filters by semicolon (;) for multi-category support.
 */
function createGalleryItemHTML(item) {
    // ... (existing status logic)
    const statusText = item.status || 'Available';
    const statusClass = (statusText.toLowerCase() === 'sold' || statusText.toLowerCase() === 'archived') ? 'sold' : 'available';
    const statusLabel = `<span class="status-badge ${statusClass}">${statusText}</span>`;

    // ... (existing filter logic)
    const filters = item.filter ?
        item.filter.split(';').map(f => f.trim().toLowerCase()).filter(f => f.length > 0).join(' ') :
        'all';
    
    // --- 🎯 DEBUG C: Check generated image path and CSV data ---
    const imagePath = `images/${item.image_src}`;
    console.log(`[DEBUG C] HTML created for ID ${item.id}. Image Source path: ${imagePath}`);

    const html = `
        <div class="gallery-card product-card" data-filter="${filters}" data-id="${item.id}">
            <div class="card-image-wrapper">
                <img src="${imagePath}" alt="${item.title}">
                ${SHOW_GALLERY_STATUS_TO_ALL ? statusLabel : ''}
            </div>
            <div class="card-info product-info">
                <h4 class="product-title">${item.title}</h4>
                <p class="product-medium">Medium: ${item.medium}</p>
            </div>
        </div>
    `;
    return html;
}

/**
 * Loads all non-archived artworks for the full gallery page and sets up filtering.
 */
async function setupGalleryPage() {
    const rawData = await fetchData(GALLERY_CSV_PATH);
    
    // --- 🎯 DEBUG D: Check data received by calling function ---
    console.log(`[DEBUG D] setupGalleryPage: Received ${rawData.length} total artwork items.`);

    // Filter out archived items
    const allArtworks = rawData.filter(item => item.status && item.status.toLowerCase() !== 'archived');

    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-button');

    // 1. Initial Load
    if (galleryGrid) {
        allArtworks.forEach(item => {
            galleryGrid.insertAdjacentHTML('beforeend', createGalleryItemHTML(item));
        });
        setAllStatusLabelsVisibility();
    }

    // 2. Setup Filtering Logic
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            const productCards = galleryGrid.querySelectorAll('.gallery-card');

            productCards.forEach(card => {
                const itemFiltersString = card.getAttribute('data-filter');

                // --- LOGIC FOR MULTIPLE FILTERS ---
                // Checks if the item's space-separated data-filter string includes the filterValue
                if (filterValue === 'all' || itemFiltersString.includes(filterValue)) {
                    card.style.display = 'inline-block'; // Necessary for Masonry to work on show
                } else {
                    card.style.display = 'none';
                }
                // ------------------------------------
            });
        });
    });
}

// --- COURSES LOGIC (INCLUDES MULTI-IMAGE SLIDER) ---

/**
 * Initializes the image scrolling/slider logic for all course cards
 * that contain a '.course-image-slider-container'.
 */
function setupCourseSliders() {
    // Select all course cards that contain the slider structure
    document.querySelectorAll('.course-card').forEach(card => {
        const slidesWrapper = card.querySelector('.course-slides-wrapper');
        const slides = card.querySelectorAll('.course-slide');

        // Only proceed if a slider structure exists and has multiple slides
        if (!slidesWrapper || slides.length < 2) return;

        const prevButton = card.querySelector('.prev-button');
        const nextButton = card.querySelector('.next-button');
        const navDots = card.querySelectorAll('.nav-dot');
        let currentIndex = 0;

        const updateSlider = () => {
            // Move the wrapper to show the current slide
            const offset = -currentIndex * 100;
            slidesWrapper.style.transform = `translateX(${offset}%)`;

            // Update active dot
            navDots.forEach(dot => dot.classList.remove('active'));
            if (navDots[currentIndex]) {
                navDots[currentIndex].classList.add('active');
            }
        };

        // Initial setup - set the first dot as active
        updateSlider();
        if (navDots[0]) navDots[0].classList.add('active');

        // Navigation controls
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
                updateSlider();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
                updateSlider();
            });
        }

        // Dot navigation
        navDots.forEach(dot => {
            dot.addEventListener('click', function() {
                const slideIndex = parseInt(this.getAttribute('data-slide-to'), 10);
                currentIndex = slideIndex;
                updateSlider();
            });
        });
    });
}

/**
 * Loads and displays all published courses on the dedicated courses page.
 */
async function setupCoursesPage() {
    const coursesData = await fetchData(COURSES_CSV_PATH);
    const coursesList = document.getElementById('courses-list');

    // Filter to show only courses with status 'yes'
    const publishedCourses = coursesData.filter(course => course.status && course.status.toLowerCase() === 'yes');

    if (coursesList) {
        publishedCourses.forEach(course => {
            const whatsappLink = course.whatsapp_link;
            // Split image names by semicolon (;) and filter out empty strings
            const imageNames = course.image_names ? course.image_names.split(';').map(n => n.trim()).filter(n => n) : ['course-default.jpg'];
            const hasMultipleImages = imageNames.length > 1;

            // Generate HTML for all images inside a slider/scroller container
            const imageSlidesHTML = imageNames.map((imageName, index) => `
                <div class="course-slide" data-slide-index="${index}">
                    <img src="images/${imageName}" alt="${course.course_name} image ${index + 1}">
                </div>
            `).join('');

            // Generate HTML for navigation dots
            const navDotsHTML = hasMultipleImages ? `
                <div class="slider-nav-dots">
                    ${imageNames.map((_, index) => `<span class="nav-dot" data-slide-to="${index}"></span>`).join('')}
                </div>
            ` : '';

            // Add 'full-page-card' class for specific courses page styling
            const html = `
                <div class="course-card full-page-card" data-course-id="${course.id}">
                    <div class="course-image-slider-container">
                        <div class="course-slides-wrapper">
                            ${imageSlidesHTML}
                        </div>
                        ${navDotsHTML}
                        ${hasMultipleImages ? '<button class="slider-button prev-button">❮</button><button class="slider-button next-button">❯</button>' : ''}
                    </div>
                    <div class="course-info">
                        <h4>${course.course_name}</h4>
                        <p>${course.description}</p>
                        <a href="${whatsappLink}" target="_blank" class="cta-button whatsapp-button"><i class="fab fa-whatsapp"></i> Inquire Now</a>
                    </div>
                </div>
            `;
            coursesList.insertAdjacentHTML('beforeend', html);
        });

        // Setup slider controls after all cards are injected
        setupCourseSliders();
    }
}

// --- HOME PAGE LOGIC ---

/**
 * Loads the initial set of data for the home page (featured gallery items and first 3 featured courses).
 * * UPDATED: Course loading now filters for 'is_featured' and shows the first 3.
 */
async function loadAndFilterHomePage() {
    // 1. Load and filter Gallery Items
    const rawData = await fetchData(GALLERY_CSV_PATH);
    const allArtworks = rawData.filter(item => item.status && item.status.toLowerCase() !== 'archived');
    const featuredArtworks = allArtworks.filter(item => item.is_featured && item.is_featured.toLowerCase() === 'yes').slice(0, 3);
    const galleryGrid = document.getElementById('home-gallery-grid');

    if (galleryGrid) {
        featuredArtworks.forEach(item => {
            galleryGrid.insertAdjacentHTML('beforeend', createGalleryItemHTML(item));
        });
        setAllStatusLabelsVisibility();
    }

    // 2. Load and filter Courses (UPDATED LOGIC HERE)
    const coursesData = await fetchData(COURSES_CSV_PATH);

    // Filter to show only published courses (status: 'yes') AND featured courses (is_featured: 'yes').
    // Then take the first 3.
    const featuredCourses = coursesData.filter(course =>
        course.status && course.status.toLowerCase() === 'yes' &&
        course.is_featured && course.is_featured.toLowerCase() === 'yes'
    ).slice(0, 3);

    const homeCoursesGrid = document.getElementById('home-courses-grid');

    if (homeCoursesGrid) {
        featuredCourses.forEach(course => {
            const whatsappLink = course.whatsapp_link;
            // Split image names by semicolon (;)
            const imageNames = course.image_names ? course.image_names.split(';').map(n => n.trim()).filter(n => n) : ['course-default.jpg'];
            const hasMultipleImages = imageNames.length > 1;

            // Generate HTML for all images inside a slider/scroller container
            const imageSlidesHTML = imageNames.map((imageName, index) => `
                <div class="course-slide" data-slide-index="${index}">
                    <img src="images/${imageName}" alt="${course.course_name} image ${index + 1}">
                </div>
            `).join('');

            // Generate HTML for navigation dots
            const navDotsHTML = hasMultipleImages ? `
                <div class="slider-nav-dots">
                    ${imageNames.map((_, index) => `<span class="nav-dot" data-slide-to="${index}"></span>`).join('')}
                </div>
            ` : '';

            // Note: No 'full-page-card' class here, using 'course-card' only for home page styling
            const html = `
                <div class="course-card" data-course-id="${course.id}">
                    <div class="course-image-slider-container">
                        <div class="course-slides-wrapper">
                            ${imageSlidesHTML}
                        </div>
                        ${navDotsHTML}
                        ${hasMultipleImages ? '<button class="slider-button prev-button">❮</button><button class="slider-button next-button">❯</button>' : ''}
                    </div>
                    <div class="course-info">
                        <h4>${course.course_name}</h4>
                        <p>${course.description.substring(0, 100)}...</p>
                        <div class="course-actions-home">
                            <a href="courses.html" class="cta-button secondary-button">Details</a>
                            <a href="${whatsappLink}" target="_blank" class="cta-button whatsapp-button"><i class="fab fa-whatsapp"></i> Inquire</a>
                        </div>
                    </div>
                </div>
            `;
            homeCoursesGrid.insertAdjacentHTML('beforeend', html);
        });

        // Initialize the sliders on the home page cards
        setupCourseSliders();
    }
}

// --- NEWSLETTER FORM LOGIC ---

function setupNewsletterForm() {
    const form = document.getElementById('newsletter-form-google');
    const messageElement = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nameInput = form.querySelector(`input[name="${NAME_FIELD_ID}"]`);
            const emailInput = form.querySelector(`input[name="${EMAIL_FIELD_ID}"]`);
            const nameValue = nameInput ? nameInput.value.trim() : '';
            const emailValue = emailInput ? emailInput.value.trim() : '';

            if (!emailValue) {
                messageElement.textContent = "Please provide an email address.";
                messageElement.classList.remove('hidden');
                messageElement.style.color = 'orange';
                return;
            }

            const formData = new FormData();
            formData.append(NAME_FIELD_ID, nameValue);
            formData.append(EMAIL_FIELD_ID, emailValue);

            messageElement.textContent = "Submitting...";
            messageElement.classList.remove('hidden');
            messageElement.style.color = '#007bff';

            try {
                await fetch(GOOGLE_FORM_ACTION_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                });
                const subscriberName = nameValue || 'artist';
                messageElement.textContent = `Thank you, ${subscriberName}! You have been subscribed. Look out for updates from Alka Art Studio.`;
                messageElement.style.color = 'green';
                form.reset();
            } catch (error) {
                console.error('Newsletter submission error:', error);
                messageElement.textContent = "Oops! Something went wrong. Please try again later.";
                messageElement.style.color = 'red';
            }
            messageElement.classList.remove('hidden');
        });
    }
}

// --- GENERAL INITIALIZATION ---

async function main() {
    await loadTemplate('header.html', 'header-placeholder');
    await loadTemplate('footer.html', 'footer-placeholder');

    // Add active class to current navigation link
    const path = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === path || (path === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    if (document.getElementById('gallery-grid')) {
        setupGalleryPage();
    } else if (document.getElementById('home-gallery-grid') || document.getElementById('home-courses-grid')) {
        loadAndFilterHomePage();
    }

    if (document.getElementById('courses-list')) {
        setupCoursesPage();
    }

    setupNewsletterForm();
}

document.addEventListener('DOMContentLoaded', main);
