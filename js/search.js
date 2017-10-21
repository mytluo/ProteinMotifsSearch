var searchResults = {}; // global var to store data returned from SQL query

// checks user input for non-empty valid IUPAC amino acid codes and FASTA format, if applicable
function validateQuery(term) {
    var description,
        fastaCheck,
        prots,
        protCheck;

    if(term == "") {
        errorAlert("Empty input");
        return null;
    }
    
    term = term.trim();

    description = />.+/;
    fastaCheck = term.match(description);
    if(fastaCheck == null) {
        errorAlert("Input not in FASTA format.")
        return null;
    }
    else {
        prots = term.replace(description, "\n"); //remove FASTA header to check IUPAC codes
        protCheck = /[ACDEFGHIKLMNPQRSTVWY\n]+/gi;
        if(!protCheck.test(prots)) {
            errorAlert("Input contains invalid characters.");
            return null;
        } else {
            return term;
        }
    }
}

// error alerts for any errors thrown
function errorAlert(errorThrown){
    alert("Failed to perform search! \nError: (" + errorThrown + ")");
}

// execute search via AJAX call
function runSearch(term) {
    // store cleaned up protein sequence input from validateQuery() to use in AJAX call
    var queries = validateQuery(term);
    $.ajax({
        url: "./motif_search.cgi",
        dataType: "json",
        data: {"search_term": queries},
        success: function(data, textStatus, jqXHR) {
            console.warn(jqXHR.responseText);
            // if multiple proteins queried, generate checkbox menu
            if(Object.keys(data).length > 1) {
                searchResults = data;
                getMenu(data);
            } else {
                resetResults();
                generateTable(data); // if only one protein queried, generate results table
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.warn(jqXHR.responseText);
            errorAlert(errorThrown);    
        }
    });
}

// resets form and clear previous results, if any
function resetResults(){
    $("#menu").hide();
    $("#selection").empty();
    $("#count").empty();
    $("#sites").empty();
    $("#motif_search").hide();
    $("#toggleform").show();
}

// generate checkbox menu for multiple protein queries
function getMenu(data) {
    var selectText,
        menu,
        input,
        label;

    // loop through submitted query proteins to create dynamic checkbox menu
    $.each(data, function(protein, info) {
        selectText = protein + "<br>&emsp;&nbsp;<b>" + info.matches + "</b> matches found.";
        menu = $("<p/>")
            .addClass("menuitem")
            .attr("role", "menuitem")
            .appendTo($("#selection"));
        input = $("<input/>")
            .addClass("proteinselect")
            .attr("name", "protein")
            .attr("value", protein)
            .attr("type", "checkbox")
            .appendTo(menu);
        label = $("<label/>")
            .attr("for", protein)
            .html(selectText)
            .appendTo(menu);
        });    

    $("#menu").show();
}

// find common motifs in multiple protein queries
function commonMotifs(data) {
    var allMotifs = {};
    var sharedMotifs = {};

    $.each(data, function(fastaLine, info) {
        $.each(info.sites, function(id, site) {
            if(allMotifs.hasOwnProperty(id)) {
                allMotifs[id].push(fastaLine); 
            } else {
                allMotifs[id] = new Array(fastaLine);
            }
        });
    });

    $.each(allMotifs, function(id, proteinList) {
        if(proteinList.length > 1) {
            sharedMotifs[id] = proteinList;
        }
    });

    return sharedMotifs;
}

// generate object containing common motifs in selected protein queries to pass to generateTable()
function processSelection(selectedProteins, motifs) {
    var proteins,
        sharedResults,
        fastaLine,
        noMatches;

    // code from: https://stackoverflow.com/questions/31835447/check-if-one-array-is-contained-in-another-array
    Array.prototype.contains = function(array) {
        return array.every(function(item) {
            return this.indexOf(item) !== -1;
        }, this);
    }

    proteins = new Array();
    sharedResults = {};
    // loop through selectedProteins to get which proteins were selected by user, and create dictionary/map for sharedResults
    $.each(selectedProteins, function(i, info){  
        fastaLine = info.value;
        proteins.push(fastaLine);
        sharedResults[fastaLine] = {};
        sharedResults[fastaLine]["sequence"] = searchResults[fastaLine]["sequence"];
        sharedResults[fastaLine]["sites"] = {};
        sharedResults[fastaLine]["matches"] = 0;
    });

    // boolean value to determine if no shared matches were found
    noMatches = true;
    $.each(motifs, function(id, proteinList) {
        if(proteinList.contains(proteins)) {
            noMatches = false;
            for(var i = 0; i < proteins.length; i++) {
                sharedResults[proteins[i]]["sites"][id] = searchResults[proteins[i]]["sites"][id];
                sharedResults[proteins[i]]["matches"] += 1;
            }
        }
    });

    if(noMatches) {
        $("#results").html("No shared motifs were found.");
        $("#results").show();
    } else {
        generateTable(sharedResults);
    }
};

// generate results table of motifs found
function generateTable(data) {
    var initialIter,
        siteCount,
        protStr,
        re,
        matchArray,
        queryStr,
        siteDiv,
        siteInfo,
        type,
        pattern,
        notes,
        queryDiv,
        queryP;

    // set boolean to determine type of results table to be generated
    initialIter = true;

    // iterate over each match and add a div element to the results container 
    $.each(data, function(fastaLine, info) {
        if(siteCount === undefined) {
            siteCount = $("<p/>")
                .html("<b>" + info.matches + "</b> possible site(s) found.")
                .appendTo($("#count"));
        } else {
            // div container for matched site already created
            initialIter = false; 
        }
        $.each(info.sites, function(id, site) {
            protStr = info.sequence;
            re = new RegExp(site.regex, "g");
            // find all matches in protein sequence to the specific pattern and store in array
            matchArray = protStr.match(re);
            // for each match, add a <mark> tag to highlight matches
            if(matchArray) {
                $.each(matchArray, function(i, regexMatch) {
                    protStr = protStr.replace(regexMatch, "<mark>" + regexMatch + "</mark>");
                });
            }
            queryStr = ">" + fastaLine + "\n" + protStr;

            if(initialIter) {
                // create a div element and append it to the results container
                siteDiv = $("<div/>") 
                    .addClass("site")
                    .appendTo($("#sites"));
                siteInfo = $("<div/>")
                    .addClass("info")
                    .appendTo(siteDiv);
                motif = $("<p/>")
                    .html(site.motif)
                    .appendTo(siteInfo);
                type = $("<p/>")
                    .html(site.type)
                    .appendTo(siteInfo);  
                pattern = $("<p/>") 
                    .html("<span class='pattern'>" + site.pattern + "</span>")
                    .appendTo(siteInfo); 
                notes = $("<p/>") 
                    .html("<span class='label'>Notes:</span> " + site.notes)
                    .appendTo(siteInfo); 
                queryDiv = $("<div/>")
                    .addClass("query")
                    .attr("id", "site_" + id)
                    .appendTo(siteDiv);
            }
            queryP = $("<p/>") 
                .html(queryStr)
                .appendTo("#site_" + id);
        });
    });
    $("#results").show();
};

// run javascript once the page is ready
$(document).ready(function() {
    // define what should happen when a user clicks submit on our search form
    $("#submit").click(function() {
        resetResults();
        runSearch($(".queryfield").val());
        // prevents "normal" form submission
        return false;
    });
    // define what should happen when a user clicks on "submit selection"
    $("#checked").click(function() {
        // clear previous selections and results, if any
        $("#count").empty();
        $("#sites").empty();

        var selectedProteins = $("input[name='protein']:checked");
        if(selectedProteins.length > 1) {
            var sharedMotifs = commonMotifs(searchResults);
            processSelection(selectedProteins, sharedMotifs);
        } else { //only 1 protein query selected; generate results table directly
            var singleProt = {};
            singleProt[selectedProteins[0].value] = searchResults[selectedProteins[0].value];
            generateTable(singleProt);
        }
    });
    // define what should happen when a user clicks "New Input" button
    $("#toggleform").click(function() {
        $("#motif_search").show();
        $("#toggleform").hide();
    });
});
