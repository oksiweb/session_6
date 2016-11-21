function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function getBookById(id) {
    var book = document.getElementById('book');
    book.textContent = 'Please wait. Book is loading';
    fetch('api/books/' + id)
        .then(function(response){
            return checkStatus(response);
        })
        .then(function(response){
            book.textContent = response.name;
        })
        .catch(function(error){
            book.textContent = 'Error. Please refresh your browser';
            console.log('failed', error);
        });
}

function loadPage(bookId) {
    var book = document.getElementById('book');
    var author = document.getElementById('author');
    var similar = document.getElementById('similar');

	book.textContent = 'Please wait. Book is loading';
	author.textContent = 'Please wait. Author details are loading';
	similar.textContent = 'Please wait. Similar books are loading';

	fetch('api/books/' + bookId)
	    .then(function(response){
            return checkStatus(response);
        })
	    .then(function(response){
            book.textContent = response.name;
            return fetch('api/authors' + response.authorId);
        })
        .then(function(response){
            author.textContent = response.name;
            return Promise.all(response.books.map(function(bookid) {
                return fetch('api/bestsellers/similar/' + bookid);
            }))
        })
        .then(function(response){
            var similarBooksLoaded = 0;
            var similarBooksAmount = response.lenght;
            response.forEach(function(similarBook) {
                var p = similar.appendChild('p').textContent = similarBook;
                similarBooksLoaded += 1;
            })
            if(similarBooksLoaded === similarBooksAmount) {
                return alert('Horray everything loaded');
            }
        })
        .catch(function(error){
            book.textContent = 'Error. Please refresh your browser';
            console.log('failed', error);
        })
}