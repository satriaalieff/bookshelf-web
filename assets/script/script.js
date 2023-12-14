const books = [];
const RENDER = "render-books";
// Storage Key
const SAVED_BOOKS = "saved-books";

// Inisiasi awal
document.addEventListener("DOMContentLoaded", () => {
  if (browserStorageSupport()) {
    loadSavedData();
  }
  const submitForm = document.getElementById("input-book-form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });
  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });
  const editForm = document.getElementById("edit-form");
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    editBook();
    editMenu.style.display = "none";
  });
  document.getElementById("edit-menu-close").addEventListener("click", () => {
    editMenu.style.display = "none";
  });
});

// Check Storage Support
function browserStorageSupport() {
  if (typeof Storage === undefined) {
    alert("Browser tidak support Storage");
    return false;
  }
  return true;
}

// Add Book to Object
function addBook() {
  const bookTitle = document.getElementById("title").value;
  const bookWriter = document.getElementById("writer").value;
  const bookYear = document.getElementById("year").value;
  const bookFinished = document.getElementById("finished").checked;
  let isFinished = Boolean;

  if (bookFinished) {
    isFinished = true;
  } else {
    isFinished = false;
  }

  const bookId = generateId();
  const bookObject = generateBookObject(
    bookId,
    bookTitle,
    bookWriter,
    bookYear,
    isFinished
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER));
  saveData();
}

const generateId = () => {
  return +new Date();
};

const generateBookObject = (id, title, writer, year, finished) => {
  return {
    id,
    title,
    writer,
    year,
    finished,
  };
};

// Add Book to Bookshelf
function addBookshelf(bookObject) {
  const bookTitleText = document.createElement("h4");
  bookTitleText.innerText = bookObject.title;

  const bookWriterText = document.createElement("p");
  bookWriterText.innerText = `Writer : ${bookObject.writer}`;

  const bookYearText = document.createElement("span");
  bookYearText.innerText = ` (${bookObject.year})`;
  bookTitleText.append(bookYearText);

  const card = document.createElement("div");
  card.classList.add("card");

  card.append(bookTitleText, bookWriterText);
  card.setAttribute("id", `book-${bookObject.id}`);

  const cardButton = document.createElement("div");
  cardButton.classList.add("card-button");

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.innerText = "Edit";

  editButton.addEventListener("click", () => {
    openEditMenu(bookObject.id);
  });

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-button");
  removeButton.innerText = "Clear";

  removeButton.addEventListener("click", () => {
    removeBook(bookObject.id);
  });

  if (bookObject.finished) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerText = "Undo";

    undoButton.addEventListener("click", () => {
      moveToUnfinished(bookObject.id);
    });

    cardButton.append(undoButton, editButton, removeButton);
  } else {
    const finishedButton = document.createElement("button");
    finishedButton.classList.add("finished-button");
    finishedButton.innerText = "Finish";

    finishedButton.addEventListener("click", () => {
      moveToFinished(bookObject.id);
    });

    cardButton.append(finishedButton, editButton, removeButton);
  }

  card.append(cardButton);
  return card;
}

// Move Card to Finished Shelf
function moveToFinished(bookId) {
  const found = findBook(bookId);

  if (found == null) return;

  found.finished = true;
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

// Move Card to Unfinished Shelf
function moveToUnfinished(bookId) {
  const found = findBook(bookId);

  if (found === null) return;

  found.finished = false;
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

// Remove Book
function removeBook(bookId) {
  const found = findBookIndex(bookId);

  if (found === null) return;

  books.splice(found, 1);
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

// Edit Menu Open
const editMenu = document.getElementById("aside");
let editIndexFound = null;
function openEditMenu(bookId) {
  editMenu.style.display = "flex";
  const found = findBookIndex(bookId);
  if (found === null) return;
  editIndexFound = found;

  const editMenuTitle = document.getElementById("edit-menu-title");
  editMenuTitle.innerText = `${books[found].title} by ${books[found].writer}`;
}

// Edit Book Function for Edit Value
function editBook() {
  const bookTitle = document.getElementById("edit-title").value;
  const bookWriter = document.getElementById("edit-writer").value;
  const bookYear = document.getElementById("edit-year").value;

  const bookObject = generateBookObject(
    books[editIndexFound].id,
    bookTitle,
    bookWriter,
    bookYear,
    books[editIndexFound].finished
  );
  books.splice(editIndexFound, 1, bookObject);

  document.dispatchEvent(new Event(RENDER));
  saveData();
}

const findBook = (bookId) => {
  for (const book of books) {
    if (book.id == bookId) {
      return book;
    }
  }
  return null;
};

const findBookIndex = (bookId) => {
  for (let index = 0; index < books.length; index++) {
    if (books[index].id == bookId) {
      return index;
    }
  }
  return null;
};

// Render the UI
document.addEventListener(RENDER, () => {
  const unfinishedBooks = document.getElementById("unfinished-books");
  unfinishedBooks.innerHTML = "";

  const finishedBooks = document.getElementById("finished-books");
  finishedBooks.innerHTML = "";

  for (const book of books) {
    const bookElement = addBookshelf(book);

    if (book.finished) {
      finishedBooks.append(bookElement);
    } else {
      unfinishedBooks.append(bookElement);
    }
  }
});

function saveData() {
  if (browserStorageSupport) {
    const parsedObject = JSON.stringify(books);
    localStorage.setItem(SAVED_BOOKS, parsedObject);
  }
}

function loadSavedData() {
  let savedData = JSON.parse(localStorage.getItem(SAVED_BOOKS));

  if (savedData) {
    for (const data of savedData) {
      books.push(data);
    }
  }

  document.dispatchEvent(new Event(RENDER));
}

// Search Feature (Try) - Success
searchedIndex = null;

// Search Book
function searchBook() {
  const searchBookTitle = document.getElementById("search-value").value;
  if (searchBookTitle != "") {
    searchedIndex = findBookTitle(searchBookTitle);
    document.dispatchEvent(new Event(SEARCH_RENDER));
  } else {
    document.dispatchEvent(new Event(RENDER));
  }
}

// Find Book Title from Search Name
const findBookTitle = (bookTitle) => {
  for (let index = 0; index < books.length; index++) {
    if (books[index].title == bookTitle) {
      return index;
    }
  }
  return null;
};

const SEARCH_RENDER = "render-search-books";

// Event Search Render for Render UI for Showing Search Result
document.addEventListener(SEARCH_RENDER, () => {
  const unfinishedBooks = document.getElementById("unfinished-books");
  unfinishedBooks.innerHTML = "";

  const finishedBooks = document.getElementById("finished-books");
  finishedBooks.innerHTML = "";

  const query = document.getElementById("search-value").value.toLowerCase();
  const searchBook = books.filter((book) =>
    book.title.toLowerCase().includes(query)
  );

  searchBook.forEach((book) => {
    const bookElement = addBookshelf(book);
    if (book.finished) {
      finishedBooks.append(bookElement);
    } else {
      unfinishedBooks.append(bookElement);
    }
  });
});
