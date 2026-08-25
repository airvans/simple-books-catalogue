
const content = {
    books: [],
    favourites: [],
    theme:null
}

const elements = {
    searchInput: document.querySelector('#search-input'),
    searchButton: document.querySelector('#search-button'),
    contentContainer: document.querySelector('#content'),
    favouritesContainer: document.querySelector('#favourites'),
    loader:document.querySelector('#loader'),
    placeholder:document.querySelector('#placeholder'),
    themetoggle:document.querySelector('#theme-toggle'),
};

function binders() {

    elements.searchButton.addEventListener('click', getBooks);
    

    const debouncedGetBooks = debounce(getBooks);


    elements.searchInput.addEventListener('input', (event) => {
        console.log(event.target.value);
        debouncedGetBooks();
        console.log();
    })

    elements.themetoggle.addEventListener('change',()=>{
       Theme() 
    })
}

function Theme() {

    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;

    content.theme = elements.themetoggle.checked ? 'dark' : 'light'

    applyTheme(content.theme);

    localStorage.setItem('theme', content.theme);
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}


function getBooks() {

    let value = elements.searchInput.value.trim();

    if (!value) {
        content.books = [];
        showPlaceholder();
        return;
    }

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(value)}&limit=10`;

    showLoader();

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let base = Array.isArray(data.docs) ? data.docs : [];

        content.books = base.map(book => ({
            title: book.title || 'Unknown Title',
            author: Array.isArray(book.author_name) ? book.author_name.join(', ') : 'Unknown Author',
            first_publish_year: book.first_publish_year || 'Unknown Year',
            cover_id: book.cover_i || null,
        }));

        renderBooks();
    })
    .catch(error => {
        console.error('Error:', error);
        content.books = [];
        renderStatus('Unable to load books. Please try again.', 'error');
    });

}

function showLoader() {
    elements.loader.classList.add('is-visible');
    elements.contentContainer.replaceChildren(elements.loader);
}

function showPlaceholder() {
    elements.loader.classList.remove('is-visible');
    elements.contentContainer.replaceChildren(elements.placeholder);
}

function renderStatus(message, state) {
    const status = document.createElement('article');
    const statusMessage = document.createElement('h3');

    elements.loader.classList.remove('is-visible');
    status.className = `status status-${state}`;
    statusMessage.textContent = message;
    status.appendChild(statusMessage);
    elements.contentContainer.replaceChildren(status);
}

function renderBooks() {
    const container = elements.contentContainer;
    container.innerHTML = '';

    if (!content.books.length) {
        renderStatus('No books found for that query.', 'empty');
        return;
    }

    content.books.forEach(book => {
        const bookElement = bookcardfactory(book.title, book.author, book.first_publish_year, book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null);
        container.appendChild(bookElement);
    });
}

function loadFavourites() {
    content.favourites = JSON.parse(localStorage.getItem('favourites')) || [];
    content.favourites.forEach(fav => {
        const favouriteElement = favouritescardfactory(fav.id, fav.title, fav.author, fav.cover);
        elements.favouritesContainer.appendChild(favouriteElement);
    });
}

function addToFavourites(id, title, author, cover) {

    content.favourites.push({ id, title, author, cover });
    localStorage.setItem('favourites', JSON.stringify(content.favourites));

    const favouriteElement = favouritescardfactory(id, title, author, cover);
    elements.favouritesContainer.appendChild(favouriteElement);
}

function removeFromFavourites(event) {

    const removeButton = event.currentTarget;
    const favouriteCard = removeButton.closest('.favourite-card');
    const id = favouriteCard.dataset.id;

    content.favourites = content.favourites.filter(fav => fav.id !== id);
    localStorage.setItem('favourites', JSON.stringify(content.favourites));

    favouriteCard.parentElement.remove();
}

function favouritescardfactory(id,title, author, cover) {

    const favouritecontainer = document.createElement('li');
    const favouriteElement = document.createElement('article');
    const favouritecontentcontainer = document.createElement('div');
    const favouriteRemoveButton = document.createElement('button');
    const favouritesubcontentcontainer = document.createElement('div');
    const favouriteImage = document.createElement('img');
    const favouriteTitle = document.createElement('h3');
    const favouriteAuthor = document.createElement('p');
    const favouriteIcon = document.createElement('img');



    favouriteElement.className = 'favourite-card';
    favouritecontentcontainer.className = 'favouritecontentcontainer';
    favouriteIcon.className = 'favourite-icon';
    favouriteIcon.src = './bin.svg';
    favouriteIcon.alt = 'Remove from favourites';

    favouriteRemoveButton.addEventListener('click', removeFromFavourites);
    favouriteElement.dataset.id = id;

    favouriteTitle.textContent = title;
    favouriteAuthor.textContent = author;
    favouriteImage.src = cover || './No_Image.jpg';

    favouritesubcontentcontainer.appendChild(favouriteTitle);
    favouritesubcontentcontainer.appendChild(favouriteAuthor);
    favouritecontentcontainer.appendChild(favouriteImage);
    favouritecontentcontainer.appendChild(favouritesubcontentcontainer);
    favouriteElement.appendChild(favouritecontentcontainer);
    favouriteElement.appendChild(favouriteRemoveButton);
    favouritecontainer.appendChild(favouriteElement);
    favouriteRemoveButton.appendChild(favouriteIcon);


    return favouritecontainer;
}


function bookcardfactory(title, author, year, cover) {
    const bookElement = document.createElement('article');
    const favouriteButton = document.createElement('button');
    const bookImage = document.createElement('img');
    const bookTitle = document.createElement('h3');
    const bookAuthor = document.createElement('p');
    const bookYear = document.createElement('span');
    const favouriteIcon = document.createElement('img');


    bookElement.className = 'card';

    let id = self.crypto.randomUUID();

    favouriteButton.addEventListener('click', () => addToFavourites(id, title, author, cover));

    bookTitle.textContent = title;
    bookAuthor.textContent = author;
    bookYear.textContent = `, (${year})`;
    bookImage.src = cover || './No_Image.jpg';
    favouriteIcon.className = 'favourite-icon';
    favouriteIcon.src = './heart.svg';
    favouriteIcon.alt = 'Add to favourites';

    bookElement.appendChild(bookImage);
    bookElement.appendChild(bookTitle);
    bookElement.appendChild(bookAuthor);
    bookAuthor.appendChild(bookYear);
    bookElement.appendChild(favouriteButton);
    favouriteButton.appendChild(favouriteIcon);

    return bookElement;
}

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function init() {
    binders();
    loadFavourites()
    Theme()
}

init();