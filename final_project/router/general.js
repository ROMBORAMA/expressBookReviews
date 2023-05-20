const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check username and password provided
    if(!username || !password) {
        return res.status(400).send("You must enter a username and password");
    }

    // Check if username exists
    const filteredUsers = users.filter((user) => user.username === username);
    if(filteredUsers.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });
    return res.status(200).send("New user registered");

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    booksJSON = await books;
    return res.status(200).send(JSON.stringify(booksJSON, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;
    const book = await books[isbn];

    if(!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    return res.status(200).send(JSON.stringify(book, null, 4));
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;
    const booksArr = await Object.values(books);

    const filteredBooks = booksArr.filter((book) => book.author === author);

    if(filteredBooks.length > 0) {
        return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    }
    return res.status(404).json({ error: "Book not found" });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;
    const booksArr = await Object.values(books);

    const filteredBooks = booksArr.filter((book) => book.title === title);

    if(filteredBooks.length > 0) {
        return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    }
    return res.status(404).json({ error: "Book not found" });
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    const { isbn } = req.params;
    const book = await books[isbn];

    if(!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

module.exports.general = public_users;
