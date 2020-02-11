/* global bootbox */
$(document).ready(function () {

    displaySavedArticles();

    // Getting a reference to the saved article container div we will be rendering all articles inside of
    var savedArticles = $(".saved-articles");
    // Adding event listeners for dynamically generated buttons for deleting articles,
    // pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.del-article-btn", deleteArticle);
    $(document).on("click", "#notes-btn", myNotes);
    $(document).on("click", "#savenote", saveMyNote);
    // $(document).on("click", ".btn.note-delete", handleNoteDelete);
    // $(".clear").on("click", handleArticleClear);




    function displaySavedArticles() {
        $.getJSON("/saved-articles", function (data) {
            // For each one
            for (var i = 0; i < data.length; i++) {
                baseURL = "https://www.winebusiness.com"
                storyURL = baseURL + data[i].link;
                // Display the apropos information on the page
                $(".saved-articles").append("<section><h5 data-id='" +
                    data[i]._id + "'>" + data[i].title + "</h5>" + "<p class='story-summ'>" + data[i].summary + "<hr>" +
                    "<button type='button' class='btn btn-danger del-article-btn'>Remove Article</button>" +
                    "<button type='button' class='btn btn-info' id='notes-btn'>My Notes</button>" +
                    "</section></p>");


            }
        });
    }


    function deleteArticle() {
        var section = $(this)
            .parents("section")
        const title = section.find('h5').html();
        const link = section.find('a').attr('href');
        const summary = section.find('p').html();

        // Remove that saved article from the page
        $(this)
            .parents("section")
            .remove();
        // Using a delete method here just to be semantic since we are deleting an article/headline
        $.ajax({
            type: "GET",
            url: "/delete/",
            data: {
                saved: true,
                title,
                link,
                summary
            }
        }).then(function (data) {
            // If this works out, run loadPage again which will re-render our list of saved articles
            if (data.ok) {
                displaySavedArticles();
            }
        });
    }


    // Whenever someone clicks My Notes button
    function myNotes() {
        var section = $(this).parents("section")
        const articleTitle = section.find('h5').html();
        // const link = section.find('a').attr('href');
        // const summary = section.find('p').html();
        const id = section.find('h5').attr("data-id");

        // Empty the notes from the note section
        $("#article-notes").empty();

        // Save the id associated with this button
        // Now make an ajax call for the Article
        $.ajax({
            method: "GET",
            url: "/saved-articles/",
            data: {
                id
            }
        })
            // With that done, add the note information to the page
            .then(function (data) {
                // console.log("==============================================================");
                console.log("=======This is the 'id' and title being passed through: " + id + " and " + articleTitle);
                // The title of the article
                $("#article-notes").append("<h4>" + articleTitle + "</h4>");
                // An input to enter a new title
                $("#article-notes").append("<input id='titleinput' name='title' placeholder='Give your note a cool title'>");
                // A textarea to add a new note body
                $("#article-notes").append("<textarea id='bodyinput' name='body' placeholder='Write memorable note here'></textarea>");
                // A button to submit a new note, with the id of the article saved to it
                $("#article-notes").append("<button class='btn' data-id='" + id + "' id='savenote'>Save Note</button>");

                // If there's a note in the article
                if (data.note) {
                    console.log(data.note);
                    // Place the title of the note in the title input
                    titleinput = $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    bodyinput = $("#bodyinput").val(data.note.body);
                    console.log("This is the title input, line 108 savedArticles.js file " + titleinput);
                }
            });
    }

    // When you click the savenote button
    function saveMyNote() {
        // Grab the id associated with the article from the submit button
        const section = $(this).parents("section");
        const id = section.find('h5').attr("data-id");
        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/saved-articles/",
            data: {
                id,
                // Value taken from title input               
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log("This is the data.note on LINE 135, savedArticles.js file " + data);
                // Empty the notes section
                $("#article-notes").empty();
            });

        // Also, remove the values entered in the input and textarea for note entry
        $("#titleinput").val("");
        $("#bodyinput").val("");
    };

});


