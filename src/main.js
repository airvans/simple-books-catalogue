
const content = {
    books: [],
    favourites: [],
}

const elements = {
    searchInput: document.querySelector('#search-input'),
    searchButton: document.querySelector('#search-button'),
    contentContainer: document.querySelector('#content'),
    favouritesContainer: document.querySelector('#favourites'),
    loader:document.querySelector('#loader'),
    placeholder:document.querySelector('#placeholder'),
};

function binders() {

    elements.searchButton.addEventListener('click', getBooks);

    const debouncedGetBooks = debounce(getBooks);


    // elements.searchInput.addEventListener('input', (event) => {
    //     console.log(event.target.value);
    //     debouncedGetBooks();
    //     console.log();

    // })
}


function getBooks() {

    let value = elements.searchInput.value.trim();

    console.log(encodeURIComponent(value));

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(value)}&limit=10`;

    elements.placeholder.classList.add("hidden")
    elements.loader.classList.remove("hidden")

    fetch(url)
    .then(response => response.json())
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
    .catch(error => console.error('Error:', error))
    .finally(() => {
        elements.loader.classList.add("hidden")
    });

}

function renderBooks() {
    const container = elements.contentContainer;
    container.innerHTML = '';

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

    const id = event.target.parentElement.dataset.id;
    console.log('Removing favourite with id:', id);
    content.favourites = content.favourites.filter(fav => fav.id !== id);
    localStorage.setItem('favourites', JSON.stringify(content.favourites));

    event.target.parentElement.remove();
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


    favouriteElement.className = 'favourite-card';
    favouritecontentcontainer.className = 'favouritecontentcontainer';
    favouriteRemoveButton.textContent = '+';

    favouriteRemoveButton.addEventListener('click', removeFromFavourites);
    favouriteElement.dataset.id = id;

    favouriteTitle.textContent = title;
    favouriteAuthor.textContent = author;
    favouriteImage.src = cover || './src/assets/No_Image.jpg';

    favouritesubcontentcontainer.appendChild(favouriteTitle);
    favouritesubcontentcontainer.appendChild(favouriteAuthor);
    favouritecontentcontainer.appendChild(favouriteImage);
    favouritecontentcontainer.appendChild(favouritesubcontentcontainer);
    favouriteElement.appendChild(favouritecontentcontainer);
    favouriteElement.appendChild(favouriteRemoveButton);
    favouritecontainer.appendChild(favouriteElement);

    return favouritecontainer;
}


function bookcardfactory(title, author, year, cover) {
    const bookElement = document.createElement('article');
    const favouriteButton = document.createElement('button');
    const bookImage = document.createElement('img');
    const bookTitle = document.createElement('h3');
    const bookAuthor = document.createElement('p');
    const bookYear = document.createElement('span');

    bookElement.className = 'card';

    let id = self.crypto.randomUUID();

    favouriteButton.addEventListener('click', () => addToFavourites(id, title, author, cover));

    bookTitle.textContent = title;
    bookAuthor.textContent = author;
    bookYear.textContent = `, (${year})`;
    bookImage.src = cover || './src/assets/No_Image.jpg';
    favouriteButton.textContent = '+';

    bookElement.appendChild(bookImage);
    bookElement.appendChild(bookTitle);
    bookElement.appendChild(bookAuthor);
    bookAuthor.appendChild(bookYear);
    bookElement.appendChild(favouriteButton);

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
}

init();