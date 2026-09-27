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
        <article class="product-card" data-product-index="${productIndex}">
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
