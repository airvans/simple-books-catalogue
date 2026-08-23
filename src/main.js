
const content = {
    books: [],
    favourites: [],
}

const elements = {
    searchInput: document.querySelector('#search-input'),
    searchButton: document.querySelector('#search-button'),
    contentContainer: document.querySelector('#content'),
    favouritesContainer: document.querySelector('#favourites'),
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
    })
    .catch(error => console.error('Error:', error)).finally(() => {
        renderBooks();
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
        const favouriteElement = favouritescardfactory(fav.title, fav.author, fav.cover);
        elements.favouritesContainer.appendChild(favouriteElement);
    });
}

function addToFavourites(title, author, cover) {

    content.favourites.push({ title, author, cover });
    localStorage.setItem('favourites', JSON.stringify(content.favourites));

    const favouriteElement = favouritescardfactory(title, author, cover);
    elements.favouritesContainer.appendChild(favouriteElement);
}

function removeFromFavourites(event) {
    const title = event.target.parentElement.querySelector('h3').textContent;
    content.favourites = content.favourites.filter(fav => fav.title !== title);
    localStorage.setItem('favourites', JSON.stringify(content.favourites));

    event.target.parentElement.remove();
}

function favouritescardfactory(title, author, cover) {

    const favouritecontainer = document.createElement('li');
    const favouriteElement = document.createElement('article');
    const favouritecontentcontainer = document.createElement('div');
    const favouriteRemoveButton = document.createElement('button');
    const favouritesubcontentcontainer = document.createElement('div');
    const favouriteImage = document.createElement('img');
    const favouriteTitle = document.createElement('h3');
    const favouriteAuthor = document.createElement('p');

    favouriteElement.className = 'flex justify-between items-center gap-1 p-1 border';
    favouriteRemoveButton.className = 'bg-gray-500 size-5 text-white p-1 active:scale-95';
    favouritecontentcontainer.className = 'flex gap-1';
    favouriteImage.className = 'size-10 object-cover';
    favouriteTitle.className = 'text-sm';
    favouriteAuthor.className = 'text-xs';

    favouriteRemoveButton.addEventListener('click', removeFromFavourites);

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

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}


function bookcardfactory(title, author, year, cover) {
    const bookElement = document.createElement('article');
    const favouriteButton = document.createElement('button');
    const bookImage = document.createElement('img');
    const bookTitle = document.createElement('h3');
    const bookAuthor = document.createElement('p');
    const bookYear = document.createElement('span');

    bookElement.className = 'border relative p-2 flex flex-col gap-1';
    favouriteButton.className = 'absolute top-1 right-1 bg-gray-500 text-white p-1 active:scale-95';
    bookImage.className = 'w-full h-3/4 object-cover border';
    bookTitle.className = 'text-sm';
    bookAuthor.className = 'text-xs';
    bookYear.className = 'text-xs text-gray-500';

    favouriteButton.addEventListener('click', () => addToFavourites(title, author, cover));

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

function init() {
    binders();
    loadFavourites()
}

init();