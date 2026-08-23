
const content = {
    books: [],
    favourites: [],
}

const elements = {
    searchInput: document.querySelector('#search-input'),
    searchButton: document.querySelector('#search-button'),
};

function binders() {
    elements.searchButton.addEventListener('click', getBooks);
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
        console.log(content.books);
    });

}

function init() {
    binders();
}

init();