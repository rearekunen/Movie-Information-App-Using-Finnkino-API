// JSON objects containing information about the theatres and movies
var allTheatres;
var chosenTheatreArea;
var chosenMovies;

function loadTheatres() {

    // Preparing a dropdown menu for choosing a theatre, and the JSON object containing information about the theatres
    var listOfTheatres = "<label id='dropdownLabel' for='theaters'>Area/theatre</label><br>";
    listOfTheatres += "<select id='theaters' onchange='loadMovies()'>";
    var JSONPreparation = '{ "theatres": [';

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var XMLDoc = xmlhttp.responseXML;

            // Fetching the names and IDs of the areas/theatres
            var theatreNames = XMLDoc.getElementsByTagName("Name");
            var theatreIDs = XMLDoc.getElementsByTagName("ID");

            for (var i = 0; i < theatreNames.length; i++) {

                if (i == 0) {
                    // Checks for the first item on the XML file which isn't a theatre
                    listOfTheatres += "<option value=''>Choose area/theatre</option>";

                } else {
                    // Adds theatre/area names to the dropdown menu and all information to the variable 
                    // that will become a JSON object containing the theatre information
                    var theatreName = theatreNames[i].childNodes[0].nodeValue;
                    var theatreID = theatreIDs[i].childNodes[0].nodeValue;
                    listOfTheatres += "<option value='" + theatreName + "'>" + theatreName + "</option>";
                    JSONPreparation += '{ "name":"' + theatreName + '" , "id":"' + theatreID + '" },';
                }

            }

            // Cutting out an unwanted character and parsing the variable into a JSON object
            var fixedJSONPreparation = JSONPreparation.substring(0, JSONPreparation.length - 1);
            fixedJSONPreparation += ']}';
            allTheatres = JSON.parse(fixedJSONPreparation);

            // Adding the dropdown menu to the page
            $("#theatreList").html(listOfTheatres);

        }
    }
}

function chooseTheatre() {
    //Looking up what theatre/area is selected from the dropdown menu and returning the ID of the theatre/area

    chosenTheatreArea = document.getElementById("theaters").value;
    for (i = 0; i < Object.keys(allTheatres.theatres).length; i++) {
        var name = allTheatres.theatres[i].name;
        var id = allTheatres.theatres[i].id;
        if (name == chosenTheatreArea) {
            return id;

        }
    }
}

function loadMovies() {
    // Fetching the XML document for the chosen theatre/area
    var XMLUrl = "https://www.finnkino.fi/xml/Events/?area=" + chooseTheatre();

    // Preparing the JSON object containing the movie information
    var JSONPreparation = '{ "movies": [';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", XMLUrl, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

            var XMLDoc = xmlhttp.responseXML;

            // Counting how many movies are being shown
            var count = XMLDoc.getElementsByTagName("Event");
			console.log(count);

            // Preparing the list of movies shown on the sidebar of the page
            var list = "<ul id='allMovies' style='display:none'>";

            // Checks to see if there are no movies being shown in the theatre at the moment
            if (count.length == 0) {
                resetFields();
                $("#movieInfo").html("No movies are being shown here at the moment.");
            } else {
                // Fetching all the wanted information about the movie
                var ids = XMLDoc.getElementsByTagName("ID");
                var titles = XMLDoc.getElementsByTagName("Title");
                var years = XMLDoc.getElementsByTagName("ProductionYear");
                var lengths = XMLDoc.getElementsByTagName("LengthInMinutes");
                var synopsises = XMLDoc.getElementsByTagName("ShortSynopsis");
                var movieImages = XMLDoc.getElementsByTagName("EventMediumImagePortrait");
				
				// As trailer video titles also use the "Title" tag in the XML file, they need to be removed
				for (i = 0; i < titles.length; i++) {
					if (titles[i].childNodes[0].nodeValue == "Traileri") {
						titles[i].parentNode.removeChild(titles[i]);
					}
				}

                // Inserting an info text and emptying the movie list
                resetFields();
                $("#movieInfo").html("Choose a movie from the list on the left.");

                for (i = 0; i < count.length; i++) {
                    // Adding the titles of the movies to the list and all the information to the JSON object
                    var id = ids[i].childNodes[0].nodeValue;
                    var title = titles[i].childNodes[0].nodeValue;
                    var year = years[i].childNodes[0].nodeValue;
                    var length = lengths[i].childNodes[0].nodeValue;
                    var synopsis = synopsises[i].childNodes[0].nodeValue;
					// Remove quotation marks from the synopsis to avoid errors
					synopsis = synopsis.replace(/"|'/g, '');
                    var movieImage = movieImages[i].childNodes[0].nodeValue;

                    list += "<li class='movie' onclick='loadMovieInfo(" + id + "), loadShowingTimes(" + id + ")'>" + title + "</li>";
                    JSONPreparation += '{ "id":"' + id + '", "title":"' + title + '" , "year":"' + year + '" , "length":"' + length + '" , "synopsis":"' + synopsis + '" ,"movieImage":"' + movieImage + '" },';
                }

                // Cutting out an unwanted character and preparing the JSON object
                var fixedJSONPreparation = JSONPreparation.substring(0, JSONPreparation.length - 1);
                fixedJSONPreparation += ']}';
                chosenMovies = JSON.parse(fixedJSONPreparation);

                // Adding the movie list to the page
                list += "</ul>";
                $("#movieList").html(list);

                // Adding a fade-in effect to the movie list
                $(document).ready(function() {
                    $("#allMovies").fadeIn()
                });
            }
        }
    }
}

function loadMovieInfo(id) {
    // Goes through all the movies being shown to find the selected one and adds all the information to the page

    var chosenMovie = id;
    finishedInfo = "<div id='allInfo' style='display:none'>";
    for (i = 0; i < Object.keys(chosenMovies.movies).length; i++) {
        var currentID = chosenMovies.movies[i].id;
        if (currentID == chosenMovie) {
            var movieImage = chosenMovies.movies[i].movieImage;
            finishedInfo += "<img class='moviePortrait' src='" + movieImage + "'>";
            var title = chosenMovies.movies[i].title;
            finishedInfo += "<h3>" + title + "</h3>";
            var year = chosenMovies.movies[i].year;
            finishedInfo += "<br><span class='year'><b>Production year:</b> " + year + "</span><br>";
            var length = chosenMovies.movies[i].length;
            finishedInfo += "<span class='year'><b>Length:</b> " + length + " minutes</span><br><br>";
            var synopsis = chosenMovies.movies[i].synopsis;
            finishedInfo += "<span><b>Synopsis:</b></span><p class='synopsis'>" + synopsis + "</p><br>";
        }
    }
    finishedInfo += "</div>";
    $("#movieInfo").html(finishedInfo);
}

function loadShowingTimes(id) {
    // NOTE: Because of the current situation, movie theaters don't have any showings until August.
    // This function has to have been adjusted so that it searches from a specific date onwards.

    // Fetching the XML document for the chosen movie at the chosen theatre
    var XMLUrl = "https://www.finnkino.fi/xml/Schedule/?area=" + chooseTheatre() + "&eventID=" + id;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", XMLUrl, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var XMLDoc = xmlhttp.responseXML;
            // Preparing the list of showtimes
            var showings = "<div id='showingInfo' style='display:none'><h4>Showtimes</h4>";

            // Looking up how many showtimes a movie has
            var count = XMLDoc.getElementsByTagName("Show");

            // Checking to see if a movie has no showtimes
            if (count.length == 0) {
                showings += "<br><span>There are currently no upcoming showings of this movie.</span>"
            }

            showings += "<ul id='showingsList'>";

            // Fetching the information about the show and adding it to the movie information panel
            var startingTimes = XMLDoc.getElementsByTagName("dttmShowStart");
            var endingTimes = XMLDoc.getElementsByTagName("dttmShowEnd");
            var showingAt = XMLDoc.getElementsByTagName("TheatreAndAuditorium");

            for (i = 0; i < count.length; i++) {
                var showPlace = showingAt[i].childNodes[0].nodeValue;
                var startingTime = startingTimes[i].childNodes[0].nodeValue;

                // Formatting the date and time
                var day = startingTime.substring(8, 10);
                var month = startingTime.substring(5, 7);
                var year = startingTime.substring(0, 4);
                var date = day + "." + month + "." + year;
                var startTime = startingTime.substring(11, 16);

                var endingTime = endingTimes[i].childNodes[0].nodeValue;
                var endTime = endingTime.substring(11, 16);

                showings += "<li class='showing'><b>Place</b><br>" + showPlace + "<br><br><b>Date and time</b><br>" + date + ", " + startTime + " - " + endTime + "</li><br>";
            }
        }
        showings += "</ul></div>";
        $("#movieShowtimes").html(showings);

        // Adding a fade-in effect to the movie information panel
        $(document).ready(function() {
            $("#allInfo").fadeIn();
            $("#showingInfo").fadeIn();
        });

    }
}

function resetFields() {
    // Emptying out the movie list and the movie information panel
    $("#movieList").html("");
    $("#movieInfo").html("");
    $("#movieShowtimes").html("");
}