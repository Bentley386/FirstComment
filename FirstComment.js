const APIkey = ""; //Your API key here
let id;
let num;

$().ready(() => {
    $("#action").bind("click", onClick);
    $("input").keypress( e => {
        if (e.which === 13) onClick();
    });
});



function onClick(){
    id = getVidID();
    if (id==="error") {
        $("#results").html('<p class="errormsg">Error - do not use URL shorteners or additional video parameters in your link (such as linking to specific time in a video)</p>');
        return 0;
    }
    num = $("#number").val();
    $.ajax({
        type : "GET",
        url : "https://www.googleapis.com/youtube/v3/commentThreads",
        data : {
            key : APIkey,
            videoId : id,
            part : "snippet",
            maxResults : 100,
            },  
        success : (x) => onResult(x),
        error : (e1,e2,e3) => $("#results").html('<p class="errormsg">An error has occured. Are you sure you entered a valid video?</p>')
        });
}

async function onResult(result){
    let nextPageToken = result.nextPageToken;
    let currPage = result.items;
    let prevPage = [];  //Saving two last pages is required in case very last page has less comments than num
    while (typeof nextPageToken !== "undefined"){
        prevPage = currPage;
        let request_result = await $.ajax({
            type : "GET",
            url : "https://www.googleapis.com/youtube/v3/commentThreads",
            data : {
                key : APIkey,
                videoId : id,
                part : "snippet", 
                maxResults : 100,
                pageToken : nextPageToken
            },
            error : (e1,e2,e3) => {
                $("#results").html('<p class="errormsg">An error has occured. Most likely the maximum amount of requests has been reached. Try again tomorrow!</p>');
                return 0;
            }
        });
        nextPageToken = request_result.nextPageToken;
        currPage = request_result.items;
    }
    $("#results").html("");  //delete previous search results
    let commentsData = prevPage.concat(currPage);
    commentsData.reverse();
     
    if (commentsData.length < 1) {
        $("#results").html('<p class="nocomments">This video has no comments!</p>');
        return 0;
    }
    for (let i=0; i<Math.min(commentsData.length,num); i++){
        let comment = commentsData[i].snippet.topLevelComment.snippet; 
        comment = {author: comment.authorDisplayName.replace(/</g, "&lt;").replace(/>/g, "&gt;"), comment : comment.textDisplay.replace(/</g, "&lt;").replace(/>/g, "&gt;"), time : comment.updatedAt};
        $("#results").append('<div class="comment"> <span class="author">' + comment.author + '</span><span class="date">' + comment.time + "</span><br>" + comment.comment + "</div>");
    }
}


function getVidID(){
    let raw = $("#url").val();
    let index = raw.indexOf("youtu.be/");
    if (index !== -1){
        return raw.substring(index+9);
        console.log("nooot");
    }
    index = raw.indexOf("watch?v=");
    if (index !== -1){
        console.log("sem not");
        return raw.substring(index+8);
    }
    console.log("ja?");
    return "error"
}
