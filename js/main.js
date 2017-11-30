function setup() {
    setupStates();
    showState("informed_consent");
    console.log("finished");
}

var questionResults = {};

// Welcome Page
//////////////////////////////////////////

function showWelcomePage() {
    hideHighLevelPages();
    showElements($("#welcome_page"));
}

function gotoWelcomePage(index) {
    hideElements($(".welcome_sub_page"));
    showElements($("#welcome_page_" + index));
}

// Create Profile Page
//////////////////////////////////////////

function showCreateProfilePage() {
    hideHighLevelPages();
    showElements($("#create_profile_page"));
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

function changeIdText(id, text) {
    document.getElementById(id).innerHTML = text;
}

function hideHighLevelPages() {
    hideElements(getHighLevelPages());
}

function showIdElements(id) {
    showElements($("#" + id));
}

function hideIdElements(id) {
    hideElements($("#" + id));
}

function hideElements(elements) {
    elements.css("display", "none");
}

function showElements(element) {
    element.css("display", "block");
}

function getHighLevelPages() {
    return $(".high_level_page");
}

function doNothing() {}

class State {
    constructor(show, hide, skip = doNothing) {
        this.show = show;
        this.hide = hide;
        this.skip = skip;
    }
}

class SimpleState extends State {
    constructor(elements) {
        super(
            function () { showElements(elements) },
            function () { hideElements(elements) }
        )
    }
}

class InformedConsentPageState extends State {
    constructor() {
        function show() {
            showIdElements("informed_consent_page");
            $("#informed_consent_continue")[0].onclick = function() {
                if ($("#informed_consent_checkbox")[0].checked) {
                    showState("welcome_1");
                } else {
                    showIdElements("informed_consent_warning");
                }
            }
        }
        function hide() {
            hideIdElements("informed_consent_page");
            hideIdElements("informed_consent_warning");
        }
        super(show, hide);
    }
}

class CreateProfileState extends State {
    constructor(step) {
        var formElements = [
            $("#profile_form_image"),
            $("#profile_form_occupation"),
            $("#profile_form_hobbies"),
            $("#profile_form_description")
        ]

        function show() {
            showElements($("#create_profile_page"));
            for (var i = 0; i < step; i++) {
                showElements(formElements[i]);
            }
            for (var i = 0; i < step - 1; i++) {
                formElements[i].find("input, textarea")[0].disabled = true
            }

            if (step <= 3) {
                $("#profile_next")[0].onclick = function() {
                    showState("profile_" + (step + 1));
                }
            }
            if (step >= 2) {
                $("#profile_back")[0].onclick = function() {
                    showState("profile_" + (step - 1));
                }
            }
            $("#profile_section_header")[0].innerHTML = `Section ${step}/4`;
            if (step < 4) {
                $("#profile_next")[0].innerHTML = "Next";
            } else {
                $("#profile_next")[0].innerHTML = "Go to game";
                $("#profile_next")[0].onclick = function() {
                    showState("connect");
                }
            }
        }
        function hide() {
            hideElements($("#create_profile_page"));
            for (var i = 0; i < 4; i++) {
                hideElements(formElements[i]);
                formElements[i].find("input, textarea")[0].disabled = false;
            }
            $("#profile_back")[0].onclick = null;
            $("#profile_next")[0].onclick = null;
        }
        super(show, hide);
    }
}

class QuestionsOnCreateProfileState extends State {
    constructor(id, question, nextState, skipTarget) {
        function show() {
            var slider = $("#question_overlay_slider")[0]
            if (!(id in questionResults)) {
                slider.value = 50;
            }
            showIdElements("create_profile_page");
            showIdElements("question_overlay");
            showIdElements("start_questions_header");
            changeIdText("question_container", question);
            $("#next_question_button")[0].onclick = function () {
                questionResults[id] = slider.value;
                showState(nextState);
            }
        }
        function hide() {
            hideIdElements("create_profile_page");
            hideIdElements("question_overlay");
            hideIdElements("start_questions_header");
            $("#next_question_button")[0].onclick = null;
        }
        function skip() {
            showState(skipTarget);
        }

        super(show, hide, skip);
    }
}

class ConnectWithPlayersState extends State {
    constructor() {
        function show() {
            showIdElements("page_connect");

            var totalPlayerAmount = 5;
            var offset = 0;
            for (var i = 0; i <= totalPlayerAmount; i++) {
                window.setTimeout(function(current) {
                    $("#connect_amount")[0].innerHTML = current + "/" + totalPlayerAmount;
                }, offset, i);
                offset += Math.random() * 2000;
            }

            window.setTimeout(function() {
                showState("player_selection");
            }, offset + 2000);
        }
        function hide() {
            hideIdElements("page_connect");
        }
        function skip() {
            showState("player_selection");
        }
        super(show, hide, skip);
    }
}

class SelectPlayerState extends State {
    constructor(playersNeeded) {
        function show() {
            showIdElements("select_players_page");
        }
        function hide() {
            hideIdElements("select_players_page");
        }
        super(show, hide);
    }
}

var states;
function setupStates() {
    states = {
        informed_consent: new InformedConsentPageState(),
        welcome_1: new SimpleState($("#welcome_page_1")),
        welcome_2: new SimpleState($("#welcome_page_2")),
        welcome_3: new SimpleState($("#welcome_page_3"))
    }
    for (var i = 0; i < questionsBefore.length; i++) {
        let prefix = "question_before_";
        let questionData = questionsBefore[i];
        let nextState;
        if (i < questionsBefore.length - 1) {
            nextState = prefix + questionsBefore[i + 1].id;
        } else {
            nextState = "profile_1";
        }
        states[prefix + questionData.id] = new QuestionsOnCreateProfileState(questionData.id, questionData.text, nextState, "profile_1");
    }
    for (var i = 1; i <= 4; i++) {
        states["profile_" + i] = new CreateProfileState(i);
    }
    states["connect"] = new ConnectWithPlayersState();
    states["player_selection"] = new SelectPlayerState(3);
}


var currentState = null
function showState(name) {
    hideAllStates();
    states[name].show();
    currentState = states[name];
}

function hideAllStates() {
    Object.values(states).forEach( (state) => { state.hide(); } );
}


document.addEventListener("keyup", function(event) {
    if (event.ctrlKey && event.key == " ") {
        if (currentState != null) {
            currentState.skip();
        }
    }
});
