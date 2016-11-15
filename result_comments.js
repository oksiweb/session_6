// Handling HTTP error statuses from https://github.com/github/fetch
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
    //кешируем обращение к DOM в локальную переменную для повторного использования
    var book = document.getElementById('book');
    //устанавливаем текст, который будет видеть пользователь ожидая загрузки
    book.textContent = 'Please wait. Book is loading';
    //обращание к api
    fetch('api/books/' + id)
        // проверка статуса запроса
        .then(checkStatus)
        // выводим название книги
        .then(function(response){
            book.textContent = response.name;
        })
        // обработка ошибки
        .catch(function(error){
            book.textContent = 'Error. Please refresh your browser';
            console.log('failed', error);
        });
}

function loadPage(bookId) {
    //кешируем обращение к DOM в локальные переменные
    var book = document.getElementById('book');
    var author = document.getElementById('author');
    var similar = document.getElementById('similar');
    // задаем текстовое содержимое
	book.textContent = 'Please wait. Book is loading';
	author.textContent = 'Please wait. Author details are loading';
	similar.textContent = 'Please wait. Similar books are loading';
    // обращение к api по id
	fetch('api/books/' + bookId)
	    // проверяем статус запроса
	    .then(checkStatus)
	    // получаем Book detais
	    .then(function(response){
	        // выводим название книги
            book.textContent = response.name;
            // обращаемся к апи, получаем Author detais
            return fetch('api/authors' + response.authorId);
        })
        .then(function(response){
            // устанавливаем имя автора
            author.textContent = response.name;
            // в масиве books хранится id каждой книги, нужно сделать ряд запросов
            // и вернуть обещание когда все обещания будут выполнены,
            // для трансформации масива используем метод map
            return Promise.all(response.books.map(function(bookid) {
                return fetch('api/bestsellers/similar/' + bookid);
            }))
        })
        .then(function(response){
            // устанавливаем "счетчик"
            var similarBooksLoaded = 0;
            // получаем длину масива ответов
            var similarBooksAmount = response.lenght;
            // перебираем в цикле масив ответов
            response.forEach(function(similarBook) {
                // устанавливаем название книги
                var p = similar.appendChild('p').textContent = similarBook;
                // увеличиваем значение счетчика на еденицу
                similarBooksLoaded += 1;
            })
            // если значения равны значит все названия книг обработаны
            // возвращаем уведомление алерт 'Horray everything loaded'
            if(similarBooksLoaded === similarBooksAmount) {
                return alert('Horray everything loaded');
            }
        })
        // обработка ошибки
        .catch(function(error){
            book.textContent = 'Error. Please refresh your browser';
            console.log('failed',error);
        })
}