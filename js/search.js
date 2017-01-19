// checks user input for non-empty valid IUPAC amino acid codes and FASTA format, if applicable
function validateQuery(term) {
    var fastaCheck,
        prots;

    if($('.queryfield').val() == "") {
        errorAlert("Empty input");
        return null;
    }
    // if in FASTA format, remove description line
    fastaCheck = $('.queryfield').val().replace(/>.+\n/, "");
    prots = /^[ACDEFGHIKLMNPQRSTVWY\s]+$/;

    if(!prots.test(fastaCheck)) {
        errorAlert("Input contains invalid characters.\n" +
            "FASTA format or protein sequence as a string in IUPAC nomenclature.");
        return null;
    } else {
        // if valid format, remove all whitespace and return protein sequence as a single string
        protStr = fastaCheck.replace(/\s+/g, "");
        return protStr;
    }
}

// error alerts for any errors thrown
function errorAlert(errorThrown){
    alert("Failed to perform search! \nError: (" + errorThrown + ")");
}

// execute search via AJAX call
function runSearch(term) {
    // store cleaned up protein sequence input from validateQuery() to use in AJAX call
    var protStr = validateQuery(term);
    $.ajax({
        url: './motif_search.cgi',
        dataType: 'json',
        data: {'search_term': protStr},
        success: function(data, textStatus, jqXHR) {
            processJSON(data);
        },
        error: function(jqXHR, textStatus, errorThrown){
            errorAlert(errorThrown);    
        }
    });
}

// toggles view of results, input form, and "Show Input Form" button
function resetResults(){
    // hide and clear the previous results, if any
    $('#results').hide();
    $('tbody').empty();
    $('#motif_search').hide();
    $('.toggleform').show();
}

// processes a passed JSON structure representing motif matches and draws it to the results container
function processJSON(data) {
    var fastaLine,
        next_div_num,
        protStr,
        protStrFmt,
        matchId,
        re,
        matchArray,
        queryStr;

    resetResults();

    $('#possible_matches').text(data.possible_matches);
    
    // store description line if in FASTA format
    fastaLine = $('.queryfield').val().match(/>.+\n/)[0],
    // this will be used to keep track of div identifiers
    next_div_num = 1,
    // clean up protein sequence string
    protStr = validateQuery($('.queryfield').val());

    // iterate over each match and add a div element to the results container 
    $.each(data.matches, function(i, item) {
        matchId = 'match_' + next_div_num++;
        re = new RegExp(item.regex, "g");

        // find all matches in protein sequence to the specific pattern and store in array
        matchArray = protStr.match(re);

        // for each match, add a <mark> tag to highlight matches
        if(matchArray) {
            protStrFmt = protStr;
            $.each(matchArray, function(i, regexMatch) {
                protStrFmt = protStrFmt.replace(regexMatch, "<mark>" + regexMatch + "</mark>");
            });
        }
        if(fastaLine) {
            queryStr = fastaLine + "\n" + protStrFmt;
        } else {
            queryStr = protStrFmt;
        }
        // create a div element and append it to the results container
        $("<div/>", {"id": matchId, "class": "match"}).appendTo('#matches');
        $("<div/>", {"class": "info"}).appendTo('#' + matchId);
        $("<p/>", {"html": item.motif}).appendTo("#" + matchId + " .info");
        $("<p/>", {"html": item.type}).appendTo("#" + matchId + " .info");  
        $("<p/>", {"html": "<span class='pattern'>" + item.pattern + "</span>"}).appendTo("#" + matchId + " .info"); 
        $("<p/>", {"html": "<span class='label'>Notes:</span> " + item.notes}).appendTo("#" + matchId + " .info"); 
        $("<div/>", {"class": "query"}).appendTo('#' + matchId);
        $("<p/>", {"html": queryStr}).appendTo("#" + matchId + " .query");
    });
    
    // show results section
    $('#results').show();
}

// run javascript once the page is ready
$(document).ready(function() {
    // define what should happen when a user clicks submit on our search form
    $('#submit').click(function() {
        runSearch();
        // prevents 'normal' form submission
        return false;
    });
    // define what should happen when a uesr clicks "Show Input Form" button
    $(".toggleform").click(function() {
        resetResults();
        $('#motif_search').show();
        $('.toggleform').hide();
    });
});
