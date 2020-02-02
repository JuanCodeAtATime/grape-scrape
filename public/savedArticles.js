/* global bootbox */
$(document).ready(function () {

    displaySavedArticles();

    // Getting a reference to the saved article container div we will be rendering all articles inside of
    var savedArticles = $(".saved-articles");
    // Adding event listeners for dynamically generated buttons for deleting articles,
    // pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.del-article-btn", deleteArticle);
    $(document).on("click", ".btn.notes-btn", articleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);
    $(".clear").on("click", handleArticleClear);




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
                    "<button type='button' class='btn btn-info notes-btn'>My Notes</button>" +
                    "</section></p>");
            }
        });
    }





    function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // Setting up an array of notes to render after finished
        // Also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // If we have no notes, just display a message explaining this
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            // If we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // Constructs an li element to contain our noteText and a delete button
                currentNote = $("<li class='list-group-item note'>")
                    .text(data.notes[i].noteText)
                    .append($("<button class='btn btn-danger note-delete'>x</button>"));
                // Store the note id on the delete button for easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // Adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // Now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
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
    function articleNotes(event) {
        // This function handles opening the notes modal and displaying our notes
        // We grab the id of the article to get notes for from the card element the delete button sits inside
        var currentArticle = $(this)
            .parents("section")
            .data();
        // Grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function (data) {
            // Constructing our initial HTML to add to the notes modal
            var modalText = $("<div class='container-fluid text-center'>").append(
                $("<h4>").text("Notes For Article: " + currentArticle._id),
                $("<hr>"),
                $("<ul class='list-group note-container'>"),
                $("<textarea placeholder='New Note' rows='4' cols='60'>"),
                $("<button class='btn btn-success save'>Save Note</button>")
            );
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // Adding some information about the article and article notes to the save button for easy access
            // When trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        // This function handles what happens when a user tries to save a new note for an article
        // Setting a variable to hold some formatted data about our note,
        // grabbing the note typed into the input box
        var noteData;
        var newNote = $(".bootbox-body textarea")
            .val()
            .trim();
        // If we actually have data typed into the note input field, format it
        // and post it to the "/api/notes" route and send the formatted noteData as well
        if (newNote) {
            noteData = { _headlineId: $(this).data("article")._id, noteText: newNote };
            $.post("/api/notes", noteData).then(function () {
                // When complete, close the modal
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        // This function handles the deletion of notes
        // First we grab the id of the note we want to delete
        // We stored this data on the delete button when we created it
        var noteToDelete = $(this).data("_id");
        // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function () {
            // When done, hide the modal
            bootbox.hideAll();
        });
    }

    function handleArticleClear() {
        $.get("api/clear")
            .then(function () {
                savedArticles.empty();
                loadPage();
            });
    }
});


