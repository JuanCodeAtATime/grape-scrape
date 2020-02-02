// Function to grab the scraped wine articles as a json

function displayArticles() {
    $.getJSON("/articles?saved=false", function (data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            baseURL = "https://www.winebusiness.com"
            storyURL = baseURL + data[i].link;
            // Display the apropos information on the page
            $("#articles").append("<section><h5 data-id='" +
                data[i]._id + "'>" + data[i].title + "</h5>" + "<p class='story-summ'>" + data[i].summary + "<hr>" + "<a href='" +
                storyURL + "'><button type='button' class='bg-danger storyBtn'>Go to Story</a>" +
                "<button type='button' class='bg-primary storyBtn saveStory'>Save Story</button>" +
                "</section></p>");
        }
    });
}


$(document).on("click", ".saveStory", saveArticles);
$(document).on("click", ".scrapeBtn", scrapeArticles);
$(document).on("click", ".clearBtn", clearArticles);
var articleDump = $(".article-dump");



function scrapeArticles() {
    // This function handles the user clicking any "scrape new article" buttons      
    $.get("/scrape").then(function (data) {
        console.log('DATA:   ', data)
        articleDump.empty();
        displayArticles();
        // reloadNew();
        // document.getElementById("disappear").innerHTML = "";
        //Create function for loading bar
        console.log("Scrape Articles button clicked")

    });
}

function clearArticles() {
    $.get("/clearall").then(function () {
        articleDump.empty();
        document.getElementById("articles").innerHTML =
            "<h3>" + "Nothing to see (or drink) here..." +
            "<br>" + "Hit" + "<em>" + " 'Scrape New Articles' " + "</em>" + "to catch the latest buzz!" +
            "</h3>";
        console.log("Clear Articles button clicked")
        //Create function to write inner html message informing user there's nothing to show
        // displayArticles();
    });
}

function saveArticles() {
    // Function to save articles by data-id   
    var section = $(this)
        .parents("section")

    const title = section.find('h5').html();
    const link = section.find('a').attr('href');
    const summary = section.find('p').html();
    // Remove that article from page and send it to the Saved Articles page
    $(this)
        .parents("section")
        .remove();

    // Using a patch method to be semantic since this is an update to an existing record in our collection
    $.ajax({
        method: "POST",
        url: "/submit",
        data: {
            saved: true,
            title,
            link,
            summary
        }

    }).then(function (data) {
        // If the data was saved successfully
        if (data.saved) {
            // Run the displayArticles function again to reload the wine articles
            reloadNew();
            console.log("LINE 88, app.js||||||||THIS IS THE SAVED DATA: " + data.saved)
        }
    });
}



// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});



