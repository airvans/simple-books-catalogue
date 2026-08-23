

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

    const headers = new Headers({
        "User-Agent": "simple-books-catalog/1.0 (evan.della24@gmail.com)"
    });

    const options = {
        method: 'GET',
        headers: headers
    };



}

function init() {
    binders();
}

init();