const THEME_STORAGE_KEY = 'coffee-house-theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

const root = document.documentElement;

function getSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

function applyTheme(theme) {
    root.dataset.theme = theme;

    const themeToggle = document.querySelector('.header__theme-toggle');

    if (!themeToggle) {
        return;
    }

    const isDarkTheme = theme === DARK_THEME;

    themeToggle.setAttribute('aria-pressed', String(isDarkTheme));
    themeToggle.setAttribute(
        'aria-label',
        isDarkTheme
            ? 'Switch to light theme'
            : 'Switch to dark theme'
    );
}

function toggleTheme() {
    const currentTheme = root.dataset.theme;
    const nextTheme =
        currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
}

applyTheme(getSavedTheme());

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.header__theme-toggle');

    if (themeToggle) {
        applyTheme(root.dataset.theme);
        themeToggle.addEventListener('click', toggleTheme);
    }
});

const PRODUCTS_URL = 'products.json';
const MOBILE_BREAKPOINT = 768;
const INITIAL_VISIBLE_COUNT = 4;

const IMAGE_EXTENSION_BY_CATEGORY = {
    coffee: 'jpg',
    tea: 'png',
    dessert: 'png',
};

let allProducts = [];
let currentCategory = 'coffee';
let isExpanded = false;

function getProductImage(product, indexInCategory) {
    const extension = IMAGE_EXTENSION_BY_CATEGORY[product.category];

    return `assets/images/${product.category}-${indexInCategory}.${extension}`;
}

function getCategoryProducts(category) {
    return allProducts.filter((product) => product.category === category);
}

function getVisibleLimit() {
    return window.innerWidth > MOBILE_BREAKPOINT ? Infinity : INITIAL_VISIBLE_COUNT;
}

function createProductCard(product, indexInCategory, productIndex) {
    const listItem = document.createElement('li');
    listItem.className = 'menu__grid-item';

    listItem.innerHTML = `
        <article
            class="product-card"
            data-product-index="${productIndex}"
            tabindex="0"
            role="button"
            aria-label="View details for ${product.name}"
        >
            <div class="product-card__image-wrapper">
                <img
                    src="${getProductImage(product, indexInCategory)}"
                    alt="${product.name}"
                    class="product-card__image"
                >
            </div>
            <div class="product-card__content">
                <h2 class="product-card__title">${product.name}</h2>
                <p class="product-card__description">${product.description}</p>
                <p class="product-card__price">$${product.price}</p>
            </div>
        </article>
    `;

    return listItem;
}

function updateVisibility() {
    const grid = document.getElementById('menuGrid');
    const loadMoreButton = document.querySelector('.menu__load-more');

    if (!grid || !loadMoreButton) {
        return;
    }

    const cards = Array.from(grid.children);
    const limit = isExpanded ? Infinity : getVisibleLimit();

    cards.forEach((card, index) => {
        card.hidden = index >= limit;
    });

    const hasHiddenCards = cards.length > limit;
    loadMoreButton.style.display = hasHiddenCards ? '' : 'none';
}

function renderCategory(category) {
    const grid = document.getElementById('menuGrid');

    if (!grid) {
        return;
    }

    const categoryProducts = getCategoryProducts(category);

    grid.innerHTML = '';

    categoryProducts.forEach((product, categoryIndex) => {
        const productIndex = allProducts.indexOf(product);
        const card = createProductCard(product, categoryIndex + 1, productIndex);

        grid.appendChild(card);
    });

    updateVisibility();
}

function setActiveTab(activeButton) {
    document.querySelectorAll('.menu__tab').forEach((tab) => {
        const isActive = tab === activeButton;

        tab.classList.toggle('menu__tab--active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });
}

function handleTabClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.category;

    if (category === currentCategory) {
        return;
    }

    currentCategory = category;
    isExpanded = false;

    setActiveTab(button);
    renderCategory(currentCategory);
}

function handleLoadMoreClick() {
    isExpanded = true;
    updateVisibility();
}

function initMenuCatalog() {
    const grid = document.getElementById('menuGrid');

    if (!grid) {
        return;
    }

    fetch(PRODUCTS_URL)
        .then((response) => response.json())
        .then((products) => {
            allProducts = products;
            renderCategory(currentCategory);
        })
        .catch((error) => {
            console.error('Failed to load products:', error);
        });

    document.querySelectorAll('.menu__tab').forEach((tab) => {
        tab.addEventListener('click', handleTabClick);
    });

    const loadMoreButton = document.querySelector('.menu__load-more');

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', handleLoadMoreClick);
    }

    window.addEventListener('resize', updateVisibility);
}

document.addEventListener('DOMContentLoaded', initMenuCatalog);

function initMobileNav() {
    const burger = document.querySelector('.header__burger');
    const mobileNav = document.getElementById('mobileNav');
    const header = document.querySelector('.header');

    if (!burger || !mobileNav || !header) {
        return;
    }

    function updateHeaderHeightVar() {
        root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    }

    function openMobileNav() {
        updateHeaderHeightVar();
        mobileNav.classList.add('mobile-nav--open');
        burger.classList.add('header__burger--active');
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('no-scroll');
    }

    function closeMobileNav() {
        mobileNav.classList.remove('mobile-nav--open');
        burger.classList.remove('header__burger--active');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('no-scroll');
    }

    function isMobileNavOpen() {
        return mobileNav.classList.contains('mobile-nav--open');
    }

    function toggleMobileNav() {
        if (isMobileNavOpen()) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    burger.addEventListener('click', toggleMobileNav);

    mobileNav.querySelectorAll('a.mobile-nav__link').forEach((link) => {
        link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMobileNavOpen()) {
            closeMobileNav();
        }
    });

    window.addEventListener('resize', () => {
        updateHeaderHeightVar();

        if (window.innerWidth > MOBILE_BREAKPOINT && isMobileNavOpen()) {
            closeMobileNav();
        }
    });

    updateHeaderHeightVar();
}

document.addEventListener('DOMContentLoaded', initMobileNav);

function initFavoriteSlider() {
    const slides = document.querySelectorAll('.favorite__slide');
    const indicators = document.querySelectorAll('.favorite__pagination-item');
    const prevButton = document.querySelector('.favorite__button--prev');
    const nextButton = document.querySelector('.favorite__button--next');

    if (slides.length === 0) {
        return;
    }

    let activeIndex = Array.from(slides).findIndex((slide) =>
        slide.classList.contains('favorite__slide--active')
    );

    if (activeIndex === -1) {
        activeIndex = 0;
    }

    function showSlide(index) {
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('favorite__slide--active', slideIndex === index);
        });

        indicators.forEach((indicator, indicatorIndex) => {
            const isActive = indicatorIndex === index;

            indicator.classList.toggle('favorite__pagination-item--active', isActive);

            if (isActive) {
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.removeAttribute('aria-current');
            }
        });

        activeIndex = index;
    }

    function showNextSlide() {
        showSlide((activeIndex + 1) % slides.length);
    }

    function showPrevSlide() {
        showSlide((activeIndex - 1 + slides.length) % slides.length);
    }

    if (prevButton) {
        prevButton.addEventListener('click', showPrevSlide);
    }

    if (nextButton) {
        nextButton.addEventListener('click', showNextSlide);
    }
}

document.addEventListener('DOMContentLoaded', initFavoriteSlider);

function initProductModal() {
    const modal = document.getElementById('productModal');
    const grid = document.getElementById('menuGrid');

    if (!modal || !grid) {
        return;
    }

    const closeButton = document.getElementById('productModalClose');
    const modalImageWrapper = document.getElementById('productModalImageWrapper');
    const modalImage = document.createElement('img');
    modalImage.className = 'modal__image';
    modalImage.id = 'productModalImage';
    modalImageWrapper.appendChild(modalImage);
    const modalTitle = document.getElementById('productModalTitle');
    const modalDescription = document.getElementById('productModalDescription');
    const modalSizes = document.getElementById('productModalSizes');
    const modalAdditives = document.getElementById('productModalAdditives');
    const modalTotal = document.getElementById('productModalTotal');

    let lastFocusedCard = null;
    let currentProduct = null;
    let selectedSizeKey = null;
    let selectedAdditiveIndexes = new Set();

    function formatPrice(value) {
        return `$${value.toFixed(2)}`;
    }

    function updateTotal() {
        const basePrice = Number(currentProduct.price);
        const sizeAddPrice = Number(currentProduct.sizes[selectedSizeKey]['add-price']);
        const additivesPrice = Array.from(selectedAdditiveIndexes).reduce((sum, index) => {
            return sum + Number(currentProduct.additives[index]['add-price']);
        }, 0);

        modalTotal.textContent = formatPrice(basePrice + sizeAddPrice + additivesPrice);
    }

    function renderSizes() {
        modalSizes.innerHTML = '';

        Object.keys(currentProduct.sizes).forEach((sizeKey) => {
            const isActive = sizeKey === selectedSizeKey;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'modal__option';
            button.dataset.sizeKey = sizeKey;
            button.setAttribute('aria-pressed', String(isActive));
            button.innerHTML = `
                <span class="modal__option-key" aria-hidden="true">${sizeKey.toUpperCase()}</span>
                <span>${currentProduct.sizes[sizeKey].size}</span>
            `;

            modalSizes.appendChild(button);
        });
    }

    function renderAdditives() {
        modalAdditives.innerHTML = '';

        currentProduct.additives.forEach((additive, index) => {
            const isActive = selectedAdditiveIndexes.has(index);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'modal__option';
            button.dataset.additiveIndex = String(index);
            button.setAttribute('aria-pressed', String(isActive));
            button.innerHTML = `
                <span class="modal__option-key" aria-hidden="true">${index + 1}</span>
                <span>${additive.name}</span>
            `;

            modalAdditives.appendChild(button);
        });
    }

    function selectSize(sizeKey, button) {
        selectedSizeKey = sizeKey;

        modalSizes.querySelectorAll('.modal__option').forEach((option) => {
            option.setAttribute('aria-pressed', String(option === button));
        });

        updateTotal();
    }

    function toggleAdditive(index, button) {
        if (selectedAdditiveIndexes.has(index)) {
            selectedAdditiveIndexes.delete(index);
        } else {
            selectedAdditiveIndexes.add(index);
        }

        button.setAttribute('aria-pressed', String(selectedAdditiveIndexes.has(index)));
        updateTotal();
    }

    modalSizes.addEventListener('click', (event) => {
        const button = event.target.closest('.modal__option');

        if (button) {
            selectSize(button.dataset.sizeKey, button);
        }
    });

    modalAdditives.addEventListener('click', (event) => {
        const button = event.target.closest('.modal__option');

        if (button) {
            toggleAdditive(Number(button.dataset.additiveIndex), button);
        }
    });

    function openModal(product, imageSrc) {
        currentProduct = product;
        selectedSizeKey = Object.keys(product.sizes)[0];
        selectedAdditiveIndexes = new Set();

        modalImage.src = imageSrc;
        modalImage.alt = product.name;
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;

        renderSizes();
        renderAdditives();
        updateTotal();

        modal.hidden = false;
        document.body.classList.add('no-scroll');

        const firstSizeButton = modalSizes.querySelector('.modal__option');

        if (firstSizeButton) {
            firstSizeButton.focus();
        }
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove('no-scroll');

        if (lastFocusedCard) {
            lastFocusedCard.focus();
        }
    }

    function openModalForCard(card) {
        const productIndex = Number(card.dataset.productIndex);
        const product = allProducts[productIndex];

        if (!product) {
            return;
        }

        const cardImage = card.querySelector('.product-card__image');

        lastFocusedCard = card;
        openModal(product, cardImage ? cardImage.src : '');
    }

    grid.addEventListener('click', (event) => {
        const card = event.target.closest('.product-card');

        if (card) {
            openModalForCard(card);
        }
    });

    grid.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const card = event.target.closest('.product-card');

        if (!card) {
            return;
        }

        event.preventDefault();
        openModalForCard(card);
    });

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function getFocusableElements() {
        const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        return Array.from(modal.querySelectorAll(selector)).filter(
            (element) => element.offsetParent !== null
        );
    }

    document.addEventListener('keydown', (event) => {
        if (modal.hidden) {
            return;
        }

        if (event.key === 'Escape') {
            closeModal();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const isFocusInsideModal = modal.contains(document.activeElement);

        if (event.shiftKey) {
            if (!isFocusInsideModal || document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else if (!isFocusInsideModal || document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', initProductModal);
