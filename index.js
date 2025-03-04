const express = require('express');
const app = express();
const path = require('path'); // importing the path module provides utilities for working with file and directory paths
const fs = require('file-system');
const { unlink, rename } = require('fs');
const { log } = require('console');
const port = 3000;

app.use(express.json()); // express.json() is like a translator. It takes the raw JSON data sent by the user and translates it into a JavaScript object that your app can understand and use.
app.use(express.urlencoded({ extended: true })); // This line of code is middleware in an Express.js application that is used to parse URL-encoded data sent in the body of an HTTP request. It makes the parsed data available in the req.body object.
app.use(express.static(path.join(__dirname, 'public'))); // Any request to the server for static files will be handled by looking in the directory defined.
app.set('view engine', 'ejs'); // This line of code is used to tell the app that EJS is the templating engine you want to use for rendering views.

// Define a route for the root URL ('/') of the application.
app.get('/', function (req, res) {
    // Reads the contents of the './files' directory
    fs.readdir('./files', (err, files) => {
        res.render('index', { files: files });
    });
});

// This routes handles the show request
app.get('/files/:fileName', function (req, res) {
    const fn = req.params.fileName;
    // Reads the file from './files' directory
    fs.readFile("files/" + fn, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('show', {
                data: data,
                fileName: fn
            });
        }
    });
});

// This route handles the delete request 
app.get('/delete/:fileName', function (req, res) {
    const fn = req.params.fileName;
    // Deletes file from './files' directory
    unlink("files/" + fn, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('delete', {
                fileName: fn
            });
        }
    });
});

// This route handles the edit request
app.get('/edit/:fileName', function (req, res) {
    const fntxt = req.params.fileName;
    const fileLength = fntxt.length;
    const fn = fntxt.slice(0, fileLength - 4);

    fs.readFile("files/" + fntxt, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('edit', {
                data: data,
                fileName: fn
            });
        }
    });
});

// Updates the note
app.post('/update/:fileName', function (req, res) {
    // updates the fil content 
    if (req.params.fileName == req.body.title) {
        fs.writeFile(`./files/${req.body.title}.txt`, req.body.note, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    else {
        // Renames the file
        rename(`files/${req.params.fileName}.txt`, `files/${req.body.title}.txt`, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    res.redirect('/');
});

// Creates a new note
app.post('/create', function (req, res) {
    fs.readdir('./files', (err, files) => {
        if (err) {
            console.log(err);
        }
        else {
            let flag = 0;
            // checks whether a file with same name is already present or not.
            files.every((element) => {
                if (element == `${req.body.title}.txt`) {
                    flag = 1;
                    return false;
                }
                else {
                    return true;
                }
            });
            // if NO
            if (flag == 0) {
                fs.writeFile(`./files/${req.body.title}.txt`, req.body.note, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.redirect('/');
            }
            // if YES
            else {
                res.status(400).send({ error: "File with the same name already exists. Choose a different name." });
            }
        }
    });
});

// make the server live
app.listen(port, () => {
    console.log(`Server is running at port: ${port}`)
});
