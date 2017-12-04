function setup() {
    loadInformedConsent();
    loadDebrief();
    loadOtherProfiles();
    setupStates();
    showState("questions_beginning");
    console.log("finished");
}

function loadInformedConsent() {
    $("#informed_consent_text").load("resources/informed_consent.html");
}

function loadDebrief() {
    $("#debrief_text").load("resources/debrief.html");
}

function loadOtherProfiles() {
    var playerBar = $("#player_selection_bar")[0];
    src_profiles.forEach((profile) => {
        var profileDiv = document.createElement("div");

        var imagePath = "resources/profiles/" + profile.image;
        var imageElement = document.createElement("img");
        imageElement.src = imagePath;
        imageElement.style.display = "block";
        imageElement.style.width = "100px";
        imageElement.style.height = "100px";
        imageElement.style.cursor = "pointer";

        profileDiv.appendChild(imageElement);
        playerBar.appendChild(profileDiv);
    });
}



function loadProfilePicture(input) {
    var reader = new FileReader();
    reader.onload = function(e) {
        $("#profile_picture").attr("src", e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
}


function changeIdText(id, text) {
    document.getElementById(id).innerHTML = text;
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

function removeAllSubElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


class State {
    constructor() {}

    show() {}
    hide() {}
}

class SimpleState extends State {
    constructor(elements) {
        super();
        this.elements = elements;
    }

    show() {
        showElements(this.elements);
    }

    hide() {
        hideElements(this.elements);
    }
}

class InformedConsentPageState extends State {
    constructor(nextState) {
        super();
        this.nextState = nextState;
    }

    show() {
        showIdElements("informed_consent_page");
        $("#informed_consent_continue")[0].onclick = this.onNextClick.bind(this);
    }

    hide() {
        hideIdElements("informed_consent_page");
        hideIdElements("informed_consent_warning");
    }

    onNextClick() {
        if (this.allChecked()) {
            showState(this.nextState);
        } else {
            showIdElements("informed_consent_warning");
        }
    }

    allChecked() {
        var elements = $(".informed_consent_check");
        for (var i = 0; i < elements.length; i++) {
            if (!elements[i].checked) return false;
        }
        return true;
    }
}

class CreateProfileState extends State {
    constructor(nextState) {
        super();
        this.formElements = [
            $("#profile_form_image"),
            $("#profile_form_occupation"),
            $("#profile_form_hobbies"),
            $("#profile_form_three_words"),
            $("#profile_form_description")
        ]
        this.backButton = $("#profile_back")[0];
        this.nextButton = $("#profile_next")[0];
        this.nextState = nextState;
    }

    show() {
        this.section = 1;
        showIdElements("create_profile_page");
        this.backButton.onclick = this.onBackClick.bind(this);
        this.nextButton.onclick = this.onNextClick.bind(this);
        this.updatePage();
    }

    hide() {
        hideIdElements("create_profile_page");
    }

    updatePage() {
        this.updateInputFields();
        this.updateSectionText();
        this.updateButtons();
    }

    updateInputFields() {
        for (let i = 0; i < this.formElements.length; i++) {
            if (i < this.section) {
                showElements(this.formElements[i]);
            } else {
                hideElements(this.formElements[i]);
            }
            this.formElements[i].find("input, textarea")[0].disabled = i < this.section - 1
        }
    }

    updateSectionText() {
        $("#profile_section_header")[0].innerHTML = `Section ${this.section}/${this.formElements.length}`;
    }

    updateButtons() {
        this.backButton.disabled = this.section <= 1;
        this.nextButton.innerHTML = (this.section == this.formElements.length) ? "Go to game" : "Next"
    }

    onNextClick() {
        if (this.section < this.formElements.length) {
            this.section++;
            this.updatePage();
        } else {
            showState(this.nextState);
        }
    }

    onBackClick() {
        if (this.section > 1) {
            this.section--;
            this.updatePage();
        }
    }
}

class ConnectWithPlayersState extends State {
    constructor(nextState) {
        super();
        this.nextState = nextState;
    }

    show() {
        showIdElements("page_connect");

        var totalPlayerAmount = src_profiles.length;
        var offset = 0;
        for (var i = 0; i <= totalPlayerAmount; i++) {
            window.setTimeout(function(current) {
                changeIdText("connect_amount", current + " players found...");
            }, offset, i);
            offset += Math.random() * 2000;
        }

        window.setTimeout(() => {
            showState(this.nextState);
        }, offset + 2000);
    }

    hide() {
        hideIdElements("page_connect");
    }
}

class SelectPlayerState extends State {
    constructor(playersNeeded, nextState) {
        super();
        this.playersNeeded = playersNeeded;
        this.selectionAmount = 0;
        this.imageElements = Array.from($("#player_selection_bar img"));
        this.nextState = nextState;
    }

    show() {
        showIdElements("select_players_page");

        this.imageElements.forEach((element, i) => {
            element.onclick = this.toggleSelection.bind(this, i);
            element.onmouseover = this.onMouseOverImage.bind(this, i);
            this.deselect(i);
        });
        $("#select_players_start")[0].onclick = this.startGame.bind(this);
        this.selectionAmount = 0;
        this.showDetailsOf(0);
        this.updatePage();
    }
    hide() {
        hideIdElements("select_players_page");
    }

    startGame() {
        showState(this.nextState);
    }

    onMouseOverImage(index) {
        this.showDetailsOf(index);
    }

    showDetailsOf(index) {
        var profile = src_profiles[index];
        changeIdText("selected_player_occupation", profile.occupation);
        changeIdText("selected_player_hobbies", profile.hobbies);
        changeIdText("selected_player_three_words", profile.threeWords);
        changeIdText("selected_player_description", profile.description);
    }

    toggleSelection(index) {
        if (this.isSelected(index)) {
            this.deselect(index);
        } else {
            this.select(index);
        }
        this.updatePage();
    }

    isSelected(index) {
        return jQuery(this.imageElements[index]).hasClass("selectedBox");
    }

    select(index) {
        if (!this.isSelected(index)) this.selectionAmount++;
        jQuery(this.imageElements[index]).removeClass("notSelectedBox");
        jQuery(this.imageElements[index]).addClass("selectedBox");
    }

    deselect(index) {
        if (this.isSelected(index)) this.selectionAmount--;
        jQuery(this.imageElements[index]).removeClass("selectedBox");
        jQuery(this.imageElements[index]).addClass("notSelectedBox");
    }

    updatePage() {
        this.updateSelectionAmount();
        this.updateStartButton();
    }

    updateSelectionAmount() {
        changeIdText("select_players_amount", this.selectionAmount + " of " + this.playersNeeded + " selected");
        if (this.selectionAmount < this.playersNeeded) {
            changeIdText("select_players_command", "Please select more persons.");
        } else if (this.selectionAmount == this.playersNeeded) {
            changeIdText("select_players_command", "Perfect, you can now start the game.");
        } else {
            changeIdText("select_players_command", "You have selected to many persons. Please deselect someone.");
        }
    }

    updateStartButton() {
        $("#select_players_start")[0].disabled = this.selectionAmount != this.playersNeeded;
    }
}

class CalculatePlayersState extends State {
    constructor(nextState) {
        super();
        this.nextState = nextState;
    }

    show() {
        showIdElements("calculate_players_page");
        window.setTimeout(() => {
            showState(this.nextState)
        }, 3000);
    }

    hide() {
        hideIdElements("calculate_players_page");
    }
}

class NotChosenState extends State {
    constructor(nextState) {
        super();
        this.nextState = nextState;
    }

    show() {
        showIdElements("not_chosen_page");
        $("#not_chosen_next")[0].onclick = () => { showState(this.nextState); };
    }

    hide() {
        hideIdElements("not_chosen_page");
    }
}

class CannotContinueState extends State {
    constructor(nextState) {
        super();
        this.nextState = nextState;
    }

    show() {
        showIdElements("cannot_continue_page");
        $("#cannot_continue_next")[0].onclick = () => { showState(this.nextState); };
    }

    hide() {
        hideIdElements("cannot_continue_page");
    }
}

class DebriefState extends State {
    constructor() {
        super();
    }

    show() {
        showIdElements("debrief_page");
    }

    hide() {
        hideIdElements("debrief_page");
    }
}

class QuestionsState extends State {
    constructor(questionSet, nextState) {
        super();
        this.questions = questionSet;
        this.questionIndex = 0;
        this.inputElements = [];
        this.nextState = nextState;
        this.skipped = false;

        this.answers = Array(questionSet.length);
        this.answers.fill(null);
    }

    show() {
        showIdElements("questions_page");
        $("#questions_back")[0].onclick = this.onBackClick.bind(this);
        $("#questions_next")[0].onclick = this.onNextClick.bind(this);
        this.updateQuestion();
    }

    hide() {
        hideIdElements("questions_page");
    }

    getQuestionResults() {
        var results = {};
        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions.get(i);
            var groupName = this.questions.getGroupName(i);
            var answer = this.answers[i];
            if (!(groupName in results)) results[groupName] = {};
            results[groupName][question.question] = answer;
        }
        return results;
    }

    updateQuestion() {
        var data = this.getCurrentQuestionData();
        var question = data.question;
        var answers = data.answers;
        var multiple = data.multiple;

        $("#questions_question")[0].innerHTML = question;
        var answersContainer = $("#questions_answers")[0];
        removeAllSubElements(answersContainer);

        this.inputElements = []
        for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var answerId = "answer_" + answer;
            var inputElement = document.createElement("input");
            inputElement.type = (multiple) ? "checkbox" : "radio";
            inputElement.id = answerId;
            inputElement.name = question;
            inputElement.value = answer;
            var labelElement = document.createElement("label");
            labelElement.setAttribute("for", answerId);
            labelElement.innerHTML = " " + answer;

            var answerContainer = document.createElement("div");
            answerContainer.appendChild(inputElement);
            answerContainer.appendChild(labelElement);

            answersContainer.appendChild(answerContainer);
            this.inputElements.push(inputElement);
        }

        this.restoreCurrentAnswer();
        this.updateButtons();
        this.updateQuestionCounter();
    }

    onNextClick(event) {
        if (event.ctrlKey || event.altKey) {
            this.skipped = true;
            showState(this.nextState);
        }
        if (this.getCurrentAnswer() === null) {
            return;
        }

        this.storeCurrentAnswer();
        if (this.questionIndex + 1 >= this.questions.length) {
            showState(this.nextState);
        } else {
            this.questionIndex++;
            this.updateQuestion();
        }
    }

    onBackClick() {
        this.storeCurrentAnswer();
        if (this.questionIndex > 0) {
            this.questionIndex--;
            this.updateQuestion();
        }
    }

    getCurrentQuestionData() {
        return this.questions.get(this.questionIndex);
    }

    getCurrentAnswer() {
        var answer = null;
        var data = this.getCurrentQuestionData();
        if (data.multiple) {
            answer = []
            this.inputElements.forEach((element) => {
                if (element.checked) answer.push(element.value);
            });
        } else {
            this.inputElements.forEach((element) => {
                if (element.checked) answer = element.value;
            });
        }
        return answer;
    }

    restoreCurrentAnswer() {
        var answer = this.answers[this.questionIndex];
        if (answer === undefined) return;

        var data = this.getCurrentQuestionData();
        if (data.multiple) {
            this.inputElements.forEach((element) => {
                element.checked = $.inArray(element.value, answer) >= 0;
            });
        } else {
            this.inputElements.forEach((element) => {
                element.checked = element.value == answer;
            });
        }
    }

    storeCurrentAnswer() {
        this.answers[this.questionIndex] = this.getCurrentAnswer();
    }

    updateButtons() {
        var backButton = $("#questions_back")[0];
        var nextButton = $("#questions_next")[0];
        var index = this.questionIndex;

        backButton.disabled = index === 0;
        nextButton.innerHTML = (index < this.questions.length - 1) ? "Next" : "Finish Questions";
    }

    updateQuestionCounter() {
        changeIdText("question_counter", "Question " + (this.questionIndex+1) + " of " + this.questions.length);
    }
}

class Question {
    constructor(question, answers, multiple = false) {
        this.question = question;
        this.answers = answers;
        this.multiple = multiple;
        Object.freeze(this);
    }
}

controlQuestions1 = [];
src_controlQuestions1.forEach((object) => {
    controlQuestions1.push(new Question(object.question, object.answers, object.multiple));
});

controlQuestions2 = [];
src_controlQuestions2.forEach((object) => {
    controlQuestions2.push(new Question(object.question, object.answers, object.multiple));
});

smdScaleQuestions = [];
src_smdScale.forEach((question) => {
    smdScaleQuestions.push(new Question(question, ["yes", "no"]));
});

lonelinessQuestions = [];
src_lonelinessScale.forEach((question) => {
    lonelinessQuestions.push(new Question(question, ["Never", "Rarely", "Sometimes", "Often"]));
});

panasQuestions = [];
src_panasScale.forEach((question) => {
    panasQuestions.push(new Question("How much do you currently feel: " + question,
        ["Very slightly or not at all", "A little", "Moderately", "Quite a bit", "Extremely"]));
});

class QuestionSet {
    constructor() {
        this.questions = [];
        this.groupNames = [];
    }

    insertQuestions(questions, groupName) {
        questions.forEach((question) => {
            this.questions.push(question);
            this.groupNames.push(groupName);
        });
    }

    get length() {
        return this.questions.length;
    }

    get(index) {
        return this.questions[index];
    }

    getGroupName(index) {
        return this.groupNames[index];
    }
}

var firstQuestionSet = new QuestionSet();
firstQuestionSet.insertQuestions(controlQuestions1, "Control Q1");
firstQuestionSet.insertQuestions(smdScaleQuestions, "SMD");
firstQuestionSet.insertQuestions(controlQuestions2, "Control Q2");
firstQuestionSet.insertQuestions(lonelinessQuestions, "Loneliness");
firstQuestionSet.insertQuestions(panasQuestions, "Panas");

function getPanasQuestionsSet(id) {
    var panasQuestionsSet = new QuestionSet();
    panasQuestionsSet.insertQuestions(panasQuestions, "Panas" + id);
    return panasQuestionsSet;
}

var states;
function setupStates() {
    states = {
        informed_consent: new InformedConsentPageState("welcome_1"),
        welcome_1: new SimpleState($("#welcome_page_1")),
        welcome_2: new SimpleState($("#welcome_page_2")),
        welcome_3: new SimpleState($("#welcome_page_3")),
        before_start: new SimpleState($("#before_start_page")),
        questions_beginning: new QuestionsState(firstQuestionSet, "create_profile"),
        create_profile: new CreateProfileState("connect"),
        connect: new ConnectWithPlayersState("player_selection_1"),

        player_selection_1: new SelectPlayerState(5, "calculate_players_1"),
        calculate_players_1: new CalculatePlayersState("not_chosen_1"),
        not_chosen_1: new NotChosenState("questions_panas_1"),
        questions_panas_1: new QuestionsState(getPanasQuestionsSet(1), "player_selection_2"),

        player_selection_2: new SelectPlayerState(3, "calculate_players_2"),
        calculate_players_2: new CalculatePlayersState("not_chosen_2"),
        not_chosen_2: new NotChosenState("questions_panas_2"),
        questions_panas_2: new QuestionsState(getPanasQuestionsSet(2), "player_selection_3"),

        player_selection_3: new SelectPlayerState(4, "calculate_players_3"),
        calculate_players_3: new CalculatePlayersState("not_chosen_3"),
        not_chosen_3: new NotChosenState("questions_panas_3"),
        questions_panas_3: new QuestionsState(getPanasQuestionsSet(3), "player_selection_4"),

        player_selection_4: new SelectPlayerState(2, "calculate_players_4"),
        calculate_players_4: new CalculatePlayersState("cannot_continue_4"),
        cannot_continue_4: new CannotContinueState("questions_panas_4"),
        questions_panas_4: new QuestionsState(getPanasQuestionsSet(4), "debrief"),

        debrief: new DebriefState()
    }
}

function showState(name) {
    hideAllStates();
    states[name].show();
}

function hideAllStates() {
    Object.values(states).forEach( (state) => { state.hide(); } );
}


function getQuestionResultsJson() {
    return JSON.stringify(getAllQuestionResults());
}

function getAllQuestionResults() {
    results = {};
    for (var stateName in states) {
        if (!states.hasOwnProperty(stateName)) continue;
        var state = states[stateName];
        if (!(state instanceof QuestionsState)) continue;

        var stateResults = state.getQuestionResults();
        for (var groupName in stateResults) {
            if (!stateResults.hasOwnProperty(groupName)) continue;
            results[groupName] = stateResults[groupName];
        }
    }
    return results;
}
