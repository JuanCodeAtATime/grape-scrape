// Dependencies
var bodyParser = require('body-parser');
var express = require("express");
var logger = require("morgan");
var app = express();
var mongoose = require("mongoose");


// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/grape-scrapedb", { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/grape-scrapedb";

mongoose.connect(MONGODB_URI), { useNewUrlParser: true };


//==========================================================================
// ROUTES FOR SCRAPING ARTICLES
//============================================================================


// A GET route for scraping the winebiz website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.winebusiness.com/news/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        // console.log(response)

        // Now, we grab every .wb-section-item-title class within the td tag, and do the following:
        $("td").each(function (i, element) {
            // Save an empty result object
            var result = [];

            // Add the text and href of every link, and save them as properties of the result object
            var title = $(element)
                .find(".wb-section-item-title")
                .children("a")
                .text();
            var link = $(element)
                .find("a")
                .attr("href");
            var summary = $(element)
                .find(".wb-break-word")
                .text();

            // Save these results in an object that we'll push into the results array we defined earlier
            result.push({
                title: title,
                link: link,
                summary: summary
            });

            // console.log('RESULT L70!', result)
            // Create a new Article using the `result` object built from scraping

            if (title && link && summary) {
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        // console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });

            }
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

// Route for clearing all Articles from the db
app.get("/clearall", function (req, res) {
    // Remove every note from the notes collection
    db.Article.remove({}, function (error, response) {
        // Log any errors to the console
        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            // Otherwise, send the mongojs response to the browser
            // This will fire off the success function of the ajax request
            console.log(response);
            res.send(response);
        }
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("Note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// POST route for saving a newly scraped article to the db 
app.post("/submit", function (req, res) {
    // Create a new Book in the database
    console.log("LINE 162: This is the app.post req.body from the server.js file: ", req.body);
    db.Savedarticle.create(req.body)
        .then(function (dbArticle) {
            // If the Library was updated successfully, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
    // }
});

// Route for getting saved scraped articles from the db
app.get("/saved-articles", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Savedarticle.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

app.get("/delete", function (req, res) {
    db.Savedarticle.remove({}, function (error, response) {
        // Log any errors to the console
        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            // Otherwise, send the mongojs response to the browser
            // This will fire off the success function of the ajax request
            console.log(response);
            res.send(response);
        }
    });
});

//==========================================================================
// ROUTES FOR NOTES CRUD functions
//============================================================================


// Simple index route
app.get("/", function (req, res) {
    res.send(index.html);
});

// 1. Save a note to the database's collection
// POST: /submit
// ===========================================
app.post('/submit', function (req, res) {
    console.log(req.body); // {}
    db.Note.insert(req.body, (err, saved) => {
        if (err) {
            console.log(error);
        } else {
            res.send(saved);
        }
    })
});
// 2. Retrieve all notes from the database's collection
// GET: /all
// ====================================================
app.get('/all', (req, res) => {
    db.Note.find({}, (err, results) => {
        if (err) {
            console.log(err)
        } else {
            res.json(results);
        }
    })
})
// 3. Retrieve one note in the database's collection by it's ObjectId
// TIP: when searching by an id, the id needs to be passed in
// as (mongojs.ObjectId(IdYouWantToFind))
// GET: /find/:id
// ==================================================================
app.get('/find/:id', (req, res) => {
    const id = req.params.id;
    db.Note.findOne({
        _id: mongojs.ObjectId(id) // id = 12345 => ObjectId('12345')
    }, (err, found) => {
        if (err) {
            console.log(err)
        } else {
            res.send(found)
        }
    })
})
// 4. Update one note in the database's collection by it's ObjectId
// (remember, mongojs.ObjectId(IdYouWantToFind)
// POST: /update/:id
// ================================================================
app.post('/update/:id', (req, res) => {
    const id = req.params.id;
    db.Note.update({
        _id: mongojs.ObjectId(id)
    }, {
        $set: {
            "title": req.body.title,
            "note": req.body.note,
            modified: Date.now()
        }
    }, (err, editedValue) => {
        if (err) {
            console.log(err)
        } else {
            res.send(editedValue);
        }
    })
})
// 5. Delete one note from the database's collection by it's ObjectId
// (remember, mongojs.ObjectId(IdYouWantToFind)
// GET: /delete/:id
// ==================================================================
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.Note.remove({
        _id: mongojs.ObjectId(id) // id = 12345 => ObjectId('12345')
    }, (err, removed) => {
        if (err) {
            console.log(err)
        } else {
            res.send(removed)
        }
    })
})
// 6. Clear the entire note collection
// GET: /clearall
// ===================================
app.get("/clearall", function (req, res) {
    // Remove every note from the notes collection
    db.Note.remove({}, function (error, response) {
        // Log any errors to the console
        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            // Otherwise, send the mongojs response to the browser
            // This will fire off the success function of the ajax request
            console.log(response);
            res.send(response);
        }
    });
});
// Listen on port 3000
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
