const { response } = require('express');
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username exists
    const foundUser = users.find(user => user.username === username);
    if(!foundUser) {
        return false;
    }
    return true;
}

const authenticatedUser = (username, password) => {
    // Check if username and password match the one we have in records
    const foundUser = users.find((user) => user.username === username && user.password === password);
    if(!foundUser) {
        return false;
    }
    return true;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    // Check username and password provided
    if(!username || !password) {
        return res.status(400).send("You must enter a username and password");
    }
    // Check username exists
    if(!isValid(username)) {
        return res.status(400).send("Username doesn't exists");
    }
    // Validate login
    if(!authenticatedUser(username, password)) {
        return res.status(400).json({ error: "Invalid login details" })
    }

    const token = jwt.sign(
        { data: password },
        'envSecretKey',
        { expiresIn: 60 * 60 }
    );

    req.session.authorization = { token, username };

    return res.status(200).send("User logged in successfully");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const book = books[isbn];
    const { username } = req.session.authorization;

    // Check review provided
    if(!review) {
        return res.status(400).json({ error: "No review provided" });
    }

    // Check if book exists
    if(!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const reviewsArr = Object.values(book.reviews);
    const reviewIndex = reviewsArr.findIndex((reviewObj) => reviewObj.username === username);

    console.log(reviewIndex);

    if(reviewIndex > 0) { // Exists
        // Replace review
        reviewsArr[reviewIndex] = { username, review };
    } else {
        // Add new review
        reviewsArr.push({ username, review });
    }

    // Update review array for book
    book.reviews = reviewsArr;    
    return res.status(200).send("Review added")
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];
    const { username } = req.session.authorization;

    // Check if book exists
    if(!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    book.reviews = book.reviews.filter(review => review.username !== username);
    return res.status(200).send("Review deleted");
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
