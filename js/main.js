function setup() {
    showPage("welcome");
    console.log("finished");
}

function showPage(id) {
    hideAllPages();
    $("#page_"+id).css("display", "block");
}

function hideAllPages() {
    getPageElements().css("display", "none");
}

function getPageElements() {
    return $("#pages").children();
}

function loadImage(input) {
    var reader = new FileReader();
    reader.onload = function(e) {
        $("#profile_picture").attr("src", e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
}

var connectTimerID = null;

function startTimer() {
    connectTimerID = setTimeout(function() {
        showPage("ready");
    }, 3000);
    console.log(connectTimerID);
}

function stopTimer() {
    clearTimeout(connectTimerID);
}
