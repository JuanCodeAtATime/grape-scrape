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



