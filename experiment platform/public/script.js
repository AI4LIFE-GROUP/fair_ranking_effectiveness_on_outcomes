//Briefing
var startedBriefing = 0;
var briefingStep = 0; //Step of the briefing the user is currently looking at
var wrongBriefingCounter = 0;
const briefingStage = 0;

//Ranking
var startedRanking = [];
var rankingType = -1; // index of the treatment(ranking type) the user was served with
var rankingOrder = [];
var alreadyHovered = [];
var selected = 0;
var requiredSelected = 4;
var lastTimeHoverWasLogged = 0;
const rankingStage = 1;
var jobDescriptions = new Map();
jobDescriptions.set("Moving Assistance", "We need moving assistance to move from our " +
    "old office to a new one. Work materials have to be carefully packed and office furniture " +
    "dismantled and brought into the hired vans. Then everything has to be set up and unpacked again at our new location.");
jobDescriptions.set("Event Staffing", "For the opening ceremony of our new office, we need staff to prepare " +
    "the event room and to provide our guests with drinks and snacks. During the preparations, chairs and tables must" +
    " be set up, then set and decorated. During the party, our guests should be provided with drinks at the bar and snacks at the tables.");
jobDescriptions.set("Shopping", "For the opening ceremony of our office, we need support with the purchase of beverages, food and decorations." +
    " Together with one of our employees, all the necessary items have to be bought in a nearby supermarket and loaded into a van rented for this " +
    "purpose. After that, all purchases must be carefully unpacked and stored in the cold room.")
//Survey
var startedSurvey = 0;
var surveyQuestionStep = 1;
var endSurvey = 0;
const surveyStage = "survey";

//logging
const logs = [];

//Mturk Parameters
var workerID = '';


//########################For development; Remove for MTurk#############################
function createDummyID() {
    var userId = Math.round(Math.random() * 100000000);
    var date = Date.now();
    this.workerID = "" + date + "A" + userId;
}

//######################################################################################

//########################Briefing Page ################################################
function load() {
    var q = new URL(window.location.href);
    this.workerID = q.searchParams.get("uID");
    document.addEventListener('keypress', startBriefingButton);
    document.getElementById('consent_form').addEventListener('submit', function (e) {
        e.preventDefault();
    }, false);
    if (this.workerID === null) {
        createDummyID();
        var href = 'briefing?uID=' + this.workerID;
        window.location.href = href;
    }

}

var fired = false;

function removeFired(event) {
    if (event.which === 13 && fired) {
        fired = false;
        document.removeEventListener("keyup", removeFired);
    }
}

function startBriefingButton(event) {
    if (event.which === 13 && !event.repeat && !fired) {
        event.stopImmediatePropagation();
        fired = true;
        document.addEventListener("keyup", removeFired);
        startBriefing();
    }
}

function nextButton(event) {
    if (event.which === 13 && !event.repeat && !fired) {
        event.stopImmediatePropagation();
        fired = true;
        document.addEventListener("keyup", removeFired);
        if (briefingStep < 6) {
            next();
        } else {
            checkAnswersButton(event);
        }
    }
}

function checkAnswersButton(event) {
    if (event.which === 13 && !event.repeat && !fired) {
        event.stopImmediatePropagation();
        fired = true;
        document.addEventListener("keyup", removeFired);
        checkAnswers();
        return false;
    } else {
        return true;
    }
}

function getNextRankingButton(event) {
    if (event.which === 13 && !event.repeat && !fired) {
        event.stopImmediatePropagation();
        fired = true;
        document.addEventListener("keyup", removeFired);
        getNextRanking();
    }
}

function nextQuestionButton(event) {
    if (event.which === 13 && !event.repeat && !fired) {
        event.stopImmediatePropagation();
        fired = true;
        document.addEventListener("keyup", removeFired);
        nextQuestion();
    }
}

function startBriefing() {
    var q = new URL(window.location.href);
    this.workerID = q.searchParams.get("uID");
    if (this.workerID === null) {
        createDummyID();
        var href = 'briefing?uID=' + this.workerID;
        startedBriefing = Date.now();
        window.location.href = href;
    } else {
        var workerIDEntered = document.getElementById("workerID").value;
        var checkboxChecked = document.getElementById("consent").checked;
        if (checkboxChecked && workerIDEntered !== "" && workerIDEntered.length > 1) {
            startedBriefing = Date.now();
            registerWorker(workerIDEntered);
            document.getElementById("briefing_counter").innerHTML = '<p>0/6</p>';
            document.getElementById("btn_next").onclick = next();
            document.getElementById("btn_next").innerHTML = '<b>Next</b>';
            document.removeEventListener('keypress', startBriefingButton);
            document.addEventListener('keypress', nextButton);
            try {
                document.getElementById("consent_tools").innerHTML = '';
                document.getElementById("consent_tools").style.border = 'none';
            } catch (e) {

            }
        } else {
            if (!checkboxChecked && (workerIDEntered === "" || workerIDEntered.length <= 1)) {
                document.getElementById("errorbox").innerHTML = '<b>Please read the form and give your consent to continue.<br/>Please enter a valid worker ID.</b>';
                document.getElementById("consent_tools").style.border = 'solid red';
            } else if (checkboxChecked && (workerIDEntered === "" || workerIDEntered.length <= 1)) {
                document.getElementById("errorbox").innerHTML = '<b>Please enter a valid worker ID.</b>';
                document.getElementById("consent_tools").style.border = 'solid red';
            } else if (!checkboxChecked && workerIDEntered !== "" && workerIDEntered.length > 1) {
                document.getElementById("errorbox").innerHTML = '<b>Please read the form and give your consent to continue.</b>';
                document.getElementById("consent_tools").style.border = 'solid red';
            }
        }
    }
}

function registerWorker(workerID) {
    var http = new XMLHttpRequest();
    var url = "/register";
    var q = new URL(window.location.href);
    var uID = q.searchParams.get("uID");
    var params = "workerID=" + workerID + "&uID=" + uID;
    http.open("GET", url + "?" + params, true);
    http.send();
}

function previous() {
    if (briefingStep > 2) {
        if (briefingStep == 6) {
            var nextButton = document.getElementById("btn_next");
            nextButton.innerHTML = "<b>Next</b>";
            nextButton.onclick = next
        }
        briefingStep -= 1;
    } else {
        if (briefingStep == 2) {
            briefingStep = 1;
        }
    }
    displayText();
}

function next() {
    if (briefingStep < 6) {
        briefingStep++;
    }
    log("briefingEvent", "displayBriefingStep", 0, briefingStep);
    displayText();
}

function displayText() {
    var textField = document.getElementById("briefing_paragraph");
    document.getElementById("briefing_counter").innerHTML = "<p>" + briefingStep + "/6</p>";
    switch (briefingStep) {
        case 1:
            var html = 'In the following task, you will be asked to help select <b>gig workers</b> to perform <b>moving assistance, event staffing and shopping</b> tasks.';
            textField.innerHTML = html;
            var buttons = '<button id="btn_next" type="reset" onclick="next();"><b>Next</b></button>';
            document.getElementById("btn_container").innerHTML = buttons;
            break;
        case 2:
            var buttons = '<button id="btn_previous" type="reset" onclick="previous();"><b>Previous</b></button>';
            buttons += '<button id="btn_next" type="reset" onclick="next();"><b>Next</b></button>';
            document.getElementById("btn_container").innerHTML = buttons;
            var html = "The candidates are listed on an online platform, and you will";
            html += " have access to basic information about their ";
            html += "<b>number of completed tasks, reliability and positive reviews</b> to help you evaluate their fit.";
            textField.innerHTML = html;
            break;
        case 3:
            var html = "The candidates also provide <b>a full resume to the platform</b>, but";
            html += " to make the process more efficient, this information is used by ";
            html += "a computer algorithm that automatically reads candidates\' ";
            html += "resumes and compares them to historical hiring patterns. The ";
            html += "algorithm then ranks candidates according to criteria including ";
            html += "how likely they are to be hired and successfully complete the task.";
            textField.innerHTML = html;
            break;
        case 4:
            var html = "<p/>Candidates that the computer believes are more likely to result in a hiring decision are ranked higher.";
            html += " <p/>The candidate the algorithm believes is the best according to its criteria will be in position 1.";
            html += " <p/><b>All workers are paid hourly and receive the same hourly wage.</b>";
            textField.innerHTML = html;
            break;
        case 5:
            var html = "<p/><p/>You will need <b>four</b> candidates for each job. ";
            html += "You will see gender, name, reliability, number of completed tasks and review score of the candidates.";
            html += "Your goal is";
            html += " to choose the candidates that you think would complete the job satisfactorily and you would recommend for hiring.";
            html += "<p/> To select a candidate, click on that candidate. You can unselect a candidate by clicking again.";
            html += "<p/> Your selection will be reviewed by clients from the platform, and if your selections ";
            html += "result in hiring, you will receive a bonus of $0.15";
            textField.innerHTML = html;
            break;
        case 6:
            document.removeEventListener('keypress', nextButton);
            document.addEventListener('keypress', checkAnswersButton);
            var headline = document.getElementById("headline");
            headline.innerHTML = "Quiz";
            var question = '<p style="text-align: left;"><b>1.</b> What are you hiring workers for?</p><form style="text-align: left;">';
            question += '';
            question += '<label for="garden"><input type="radio" id="garden" name="task" value="garden">Gardening, furniture assembly and shopping</label><br>';
            question += '';
            question += '<label for="move"><input type="radio" id="move" name="task" value="move">Moving assistance, event staffing and shopping</label><br>';
            question += '';
            question += '<label for="cleaning"><input type="radio" id="cleaning" name="task" value="cleaning">Cleaning, home repairs and furniture assembly</label><br>';
            question += '';
            question += '<label for="deliverydriver"><input type="radio" id="deliverydriver" name="task" value="deliverydriver">Furniture delivery, shopping and furniture assembly</label></form><br><b><p id="warning1" style="color: red;"></p></b>';

            question += '<p style="text-align: left;"><b>2.</b> The computer algorithm uses _______ to make its rankings:</p><form style="text-align: left;">';
            question += '';
            question += '<label for="workexperience"><input type="radio" id="workexperience" name="parameters" value="workexperience">Work experience</label><br>';
            question += '';
            question += '<label for="resumedata"><input type="radio" id="resumedata" name="parameters" value="resumedata">Resume data</label><br>';
            question += '';
            question += '<label for="names"><input type="radio" id="names" name="parameters" value="names">Names</label></form><br><b><p id="warning2" style="color: red;"></p></b>';

            question += '<p style="text-align: left;"><b>3.</b> What color has the sky? So that we know you have read the question,';
            question += ' please type \'cotton candy\' into the box below.</p><form style="text-align: left;">';
            question += '<input type="text" id="test" name="test" value="" onkeypress="return checkAnswersButton(event)">';
            question += '<form><br><b><p id="warning3" style="color: red;"></p></b><br>';

            textField.innerHTML = question;
            var nextButton = document.getElementById("btn_next");
            nextButton.innerHTML = "<b>Start</b>";
            nextButton.onclick = checkAnswers;
            break;
    }
}

function checkAnswers() {
    var question1 = document.getElementById("move").checked;
    var question2 = document.getElementById("resumedata").checked;
    var question3 = (document.getElementById("test").value === "cotton candy");

    if (question1 && question2 && question3) {
        var q = new URL(window.location.href);
        this.workerID = q.searchParams.get("uID");
        var href = 'test?uID=' + this.workerID;
        createAndSendLog(briefingStage, href);
    } else {
        wrongBriefingCounter++;
        log("FailedBriefingQuestionaire", "wrongBriefingCounter: " + wrongBriefingCounter);
        if (!question1) {
            document.getElementById("warning1").innerHTML = "Wrong answer. Please read the briefing again to find the right answer.";
            var chefChecked = document.getElementById("garden").checked;
            var bookkeeperChecked = document.getElementById("cleaning").checked;
            var deliverydriverChecked = document.getElementById("deliverydriver").checked;
            if (chefChecked) {
                log("wrongAnswerBriefingQuestion1", "gardenChecked");
            } else if (bookkeeperChecked) {
                log("wrongAnswerBriefingQuestion1", "cleaningChecked");
            } else if (deliverydriverChecked) {
                log("wrongAnswerBriefingQuestion1", "deliverydriverChecked");
            }
        }
        if (!question2) {
            document.getElementById("warning2").innerHTML = "Wrong answer. Please read the briefing again to find the right answer.";
            var workExperienceChecked = document.getElementById("workexperience").checked;
            var namesChecked = document.getElementById("names").checked;
            if (workExperienceChecked) {
                log("wrongAnswerBriefingQuestion2", "workExperienceChecked");
            } else if (namesChecked) {
                log("wrongAnswerBriefingQuestion2", "namesChecked");
            }
        }
        if (!question3) {
            document.getElementById("warning3").innerHTML = "Wrong answer. Please read the question again.";
            var enteredText = document.getElementById("test").value;
            log("wrongAnswerBriefingQuestion3", enteredText);
        }
    }
}

//########################Ranking Page##################################################
function getRankingByUser() {
    document.addEventListener('keypress', getNextRankingButton)
    var http = new XMLHttpRequest();
    var url = "/user";
    var q = new URL(window.location.href);
    workerID = q.searchParams.get("uID");
    var params = "uID=" + workerID;
    http.open("GET", url + "?" + params, true);
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            var data = JSON.parse(http.responseText);
            createRanking(data);
            logObject(data.ranking);
        }
    };
    http.send();
}

function getNextRanking() {
    if (checkSelected()) {
        selected = 0;
        document.getElementById("priority-list").innerHTML = '<li class="" id="1-li"></li>\n' +
            '            <li class="" id="2-li"></li>\n' +
            '            <li class="" id="3-li"></li>\n' +
            '            <li class="" id="4-li"></li>';
        var http = new XMLHttpRequest();
        var url = "/nextRanking";
        var q = new URL(window.location.href);
        workerID = q.searchParams.get("uID");
        var params = "uID=" + workerID;
        http.open("GET", url + "?" + params, true);
        http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
                var data = JSON.parse(http.responseText);
                if (data.end == true) {
                    startSurvey();
                } else {
                    createRanking(data);
                    logObject(data.ranking);

                }
            }
        };
        http.send();
    }
}

function createRanking(data) {
    var ranking = document.getElementById("ranking");
    ranking.innerHTML = data.html;
    var loadTime = Date.now();
    rankingOrder = data.rankingOrder;
    rankingType = data.rankingType;
    var twoListTypes = [];
    if (!twoListTypes.includes(rankingType)) {
        const tableRows = document.getElementsByClassName("spacing_row");
        for (const tableRow of tableRows) {
            tableRow.innerHTML = '<td style="padding-bottom: 10px; padding-top: 10px;"/><td style="padding-bottom: 10px; padding-top: 10px;"/>' +
                '<td style="padding-bottom: 10px; padding-top: 10px;"/>';
            tableRow.setAttribute("style", "padding-top: 10px; padding-bottom: 10px;");
        }
    }
    const tableSpacings = document.getElementsByClassName("center");
    for (const spacing of tableSpacings) {
        //spacing.parentNode.removeChild(spacing);
    }
    document.getElementById("task").innerHTML = data.jobTitle;
    document.getElementById("task_description").innerHTML = jobDescriptions.get(data.jobTitle);
    startedRanking.push(loadTime);
    log("serverEvent", "loadNewRankingType", 0, rankingType);
}

function checkSelected() {
    if (selected < requiredSelected) {
        var errorBox = document.getElementById("error-box");
        var candidatesNeeded = requiredSelected - selected;
        if (candidatesNeeded == 1) {
            errorBox.innerHTML = '<h3 style="color: red; border: solid red;">Please select ' + candidatesNeeded + ' more candidate!</h3>';
            return false;
        } else {
            errorBox.innerHTML = '<h3 style="color: red; border: solid red;">Please select ' + candidatesNeeded + ' more candidates!</h3>';
            return false;
        }
    }
    return true;
}

//#####################################################################

//#############################Survey##################################
function startSurvey() {
    startedSurvey = Date.now();
    var q = new URL(window.location.href);
    workerID = q.searchParams.get("uID");
    var href = "survey?uID=" + workerID;
    createAndSendLog(rankingStage, href);
    return false;
}

function checkIfSurveyQuestionAnswered() {
    //var checkboxes = document.querySelectorAll('input[type="radio"]');
    //return Array.prototype.slice.call(checkboxes).map(x => x.checked);

    var radios = document.querySelectorAll('input[type="radio"]');
    var selected = 0;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            selected++;
        }
    }
    if (surveyQuestionStep == 1 && selected == 1) {
        return true;
    }
    if (surveyQuestionStep === 5) {
        var textfield = document.getElementById("descriptionUserAlgo");
        if (textfield.value === "") {
            return false;
        } else if (textfield.value.length < 40) {
            return false;
        }
        return true;
    }
    if (surveyQuestionStep == 6 && selected == 4) {
        return true;
    }
    if (selected === 4 && surveyQuestionStep != 5) {
        return true;
    }
    return false;
    // var checkedOne =
    // var somethingElseTextEntered = true;
    // if (surveyQuestionStep !== 3) {
    //     var somethingElseChecked = document.getElementById("somethingElse").checked;
    //     var somethingElseRadio = document.getElementById("somethingElse").selected;
    //     if (somethingElseChecked || somethingElseRadio) {
    //         var somethingElseText = document.getElementById("somethingElseText");
    //         if (somethingElseText.value === "") {
    //             somethingElseTextEntered = false;
    //         }
    //     }
    // }

    //
    // if (surveyQuestionStep === 3) {
    //     var textfield = document.getElementById("descriptionAlgo");
    //     if (textfield.value === "") {
    //         return false;
    //     } else if (textfield.value.length < 50) {
    //         return false;
    //     }
    // }
    // if (surveyQuestionStep === 3) {
    //     try {
    //         var e = document.getElementById("dropdownBiased");
    //         var selectedDropdown = e.options[e.selectedIndex].value;
    //         if (selectedDropdown === "placeholder") {
    //             return false;
    //         } else {
    //             return true;
    //         }
    //     } catch (e) {
    //         var checkDropdown = true;
    //     }
    //     return checkDropdown
    // }
    // return checkedOne && somethingElseTextEntered;
}

function logSurveyAnswers() {
    var checkboxes = document.querySelectorAll('input[type="radio"]');
    var surveyQuestion = {};
    surveyQuestion["question"] = surveyQuestionStep;
    var checked = [];
    for (var i = 0; i < checkboxes.length; i++) {
        var box = checkboxes[i];
        if (box.checked) {
            checked.push(box.value + " "+box.id);
            if (box.id === "didSomethingElse") {
                checked.push(document.getElementById("didSomethingElseText").value);
            }
            if (box.id === "somethingElse") {
                checked.push(document.getElementById("somethingElseText").value);
            }
        }
    }
    if (surveyQuestionStep === 5) {
        var textarea = document.getElementById("descriptionUserAlgo");
        checked.push(textarea.value);
    }
    surveyQuestion["answers"] = checked;
    logObject(surveyQuestion);
}

function nextQuestion() {
    logSurveyAnswers();
    if (checkIfSurveyQuestionAnswered()) {
        surveyQuestionStep++;
        if (surveyQuestionStep === 7) {
            endSurvey = Date.now();
            createAndSendLog(surveyStage);
        }
        loadSurveyQuestions();
        return false;
    } else {
        log("noAnswer", "noAnswerAtSurveyStep", 0, surveyQuestionStep);
        if (surveyQuestionStep == 1) {
            document.getElementById("warning").innerHTML = "Please select an answer.";
        }else if(surveyQuestionStep == 5){
            document.getElementById("warning").innerHTML = "Please describe how you selected candidates with at least 40 characters.";
        } else {
            document.getElementById("warning").innerHTML = "Please select an answer for all categories.";
        }

    }
}
function getSeenRankingForSurvey(job){
    var http = new XMLHttpRequest();
    var url = "/jobRankingSeen";
    var q = new URL(window.location.href);
    workerID = q.searchParams.get("uID");
    var params = "uID=" + workerID + "&job="+job;
    http.open("GET", url + "?" + params, true);
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            var data = JSON.parse(http.responseText);
            var ranking = document.getElementById("ranking");
            if(data.ranking.hasOwnProperty("html")){
                ranking.innerHTML = data.ranking.html;
            }else{
                ranking.innerHTML = data.ranking;
            }

            var items = document.getElementsByClassName("item");
            for(var i=0; i<items.length; i++){
                items[i].setAttribute("onclick","");
                items[i].setAttribute("onhmouseenter","");
                items[i].setAttribute("onhmouseleave","");
            }
        }
    };
    http.send();
}

function loadSurveyQuestions(genderSelected = false) {
    document.addEventListener('keypress', nextQuestionButton);
    var textField = document.getElementById("survey_paragraph");
    var question = '';
    log("serverEvent", "loadSurveyQuestion", 0, surveyQuestionStep);
    switch (surveyQuestionStep) {
        case 1:
            question = '<p style="text-align: left;"><b>1.</b> How much do you trust the computer system\'s assessment of the job candidates?</p><form id="questionForm" style="text-align: left;">';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<label class="features-label" for="trust-1"><input class="features" type="radio" id="trust-1" name="trust" value="1"/><p>Not at all (1)</p></label>';
            question += '<label class="features-label" for="trust-2"><input class="features" type="radio" id="trust-2" name="trust" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label class="features-label" for="trust-3"><input class="features" type="radio" id="trust-3" name="trust" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label class="features-label" for="trust-4"><input class="features" type="radio" id="trust-4" name="trust" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label class="features-label" for="trust-5"><input class="features" type="radio" id="trust-5" name="trust" value="5"/><p>Very much (5)</p></label>';
            question += '</form><br><br><b><p id="warning" style="color: red;"></p></b>';
            break;
        case 2:
            getSeenRankingForSurvey("Moving Assistance");
            document.getElementById("ranking_description").innerHTML= 'Review the ranking for the task <b>\"Moving Assistance\"';
            question = '<p style="text-align: center;"><b>2.</b> Please indicate how important the following features were to you for your selections for the task:<br> <b>\"Moving Assistance\"</b>:</p><form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Number of tasks completed</b></p>';
            question += '<label class="features-label" for="movingAssistnace-tasks-1"><input class="features" type="radio" id="movingAssistnace-tasks-1" name="movingAssistnace-tasks" value="1"/><p>Not important (1)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-tasks-2"><input class="features" type="radio" id="movingAssistnace-tasks-2" name="movingAssistnace-tasks" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-tasks-3"><input class="features" type="radio" id="movingAssistnace-tasks-3" name="movingAssistnace-tasks" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-tasks-4"><input class="features" type="radio" id="movingAssistnace-tasks-4" name="movingAssistnace-tasks" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-tasks-5"><input class="features" type="radio" id="movingAssistnace-tasks-5" name="movingAssistnace-tasks" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Positive Reviews</b></p>';
            question += '<label class="features-label" for="movingAssistnace-reviews-1"><input class="features" type="radio" id="movingAssistnace-reviews-1" name="movingAssistnace-reviews" value="1"/><p>Not important (1)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reviews-2"><input class="features" type="radio" id="movingAssistnace-reviews-2" name="movingAssistnace-reviews" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reviews-3"><input class="features" type="radio" id="movingAssistnace-reviews-3" name="movingAssistnace-reviews" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reviews-4"><input class="features" type="radio" id="movingAssistnace-reviews-4" name="movingAssistnace-reviews" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reviews-5"><input class="features" type="radio" id="movingAssistnace-reviews-5" name="movingAssistnace-reviews" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Reliability</b></p>';
            question += '<label class="features-label" for="movingAssistnace-reliable-1"><input class="features" type="radio" id="movingAssistnace-reliable-1" name="movingAssistnace-reliable" value="1"/><p>Not important (1)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reliable-2"><input class="features" type="radio" id="movingAssistnace-reliable-2" name="movingAssistnace-reliable" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reliable-3"><input class="features" type="radio" id="movingAssistnace-reliable-3" name="movingAssistnace-reliable" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reliable-4"><input class="features" type="radio" id="movingAssistnace-reliable-4" name="movingAssistnace-reliable" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-reliable-5"><input class="features" type="radio" id="movingAssistnace-reliable-5" name="movingAssistnace-reliable" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Gender</b></p>';
            question += '<label class="features-label" for="movingAssistnace-gender-1"><input class="features" type="radio" id="movingAssistnace-gender-1" name="movingAssistnace-gender" value="1"/><p>Not important (1)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-gender-2"><input class="features" type="radio" id="movingAssistnace-gender-2" name="movingAssistnace-gender" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-gender-3"><input class="features" type="radio" id="movingAssistnace-gender-3" name="movingAssistnace-gender" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-gender-4"><input class="features" type="radio" id="movingAssistnace-gender-4" name="movingAssistnace-gender" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label class="features-label" for="movingAssistnace-gender-5"><input class="features" type="radio" id="movingAssistnace-gender-5" name="movingAssistnace-gender" value="5"/><p>Very important (5)</p></label>';
            question += '</form><br><br><b><p id="warning" style="color: red;"></p></b>';
            break;
        case 3:
            window.scrollTo(0, 0);
            getSeenRankingForSurvey("Event Staffing");
            document.getElementById("ranking_description").innerHTML= 'Review the ranking for the task <b>\"Event Staffing\"';
            question = '<p style="text-align: center;"><b>3.</b> Please indicate how important the following features were to you for your selections for the task:<br> <b>\"Event Staffing\"</b>:</p><form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Number of tasks completed</b></p>';
            question += '<label for="eventStaffing-tasks-1"><input type="radio" id="eventStaffing-tasks-1" name="eventStaffing-tasks" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="eventStaffing-tasks-2"><input type="radio" id="eventStaffing-tasks-2" name="eventStaffing-tasks" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="eventStaffing-tasks-3"><input type="radio" id="eventStaffing-tasks-3" name="eventStaffing-tasks" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="eventStaffing-tasks-4"><input type="radio" id="eventStaffing-tasks-4" name="eventStaffing-tasks" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="eventStaffing-tasks-5"><input type="radio" id="eventStaffing-tasks-5" name="eventStaffing-tasks" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Positive Reviews</b></p>';
            question += '<label for="eventStaffing-reviews-1"><input type="radio" id="eventStaffing-reviews-1" name="eventStaffing-reviews" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="eventStaffing-reviews-2"><input type="radio" id="eventStaffing-reviews-2" name="eventStaffing-reviews" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="eventStaffing-reviews-3"><input type="radio" id="eventStaffing-reviews-3" name="eventStaffing-reviews" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="eventStaffing-reviews-4"><input type="radio" id="eventStaffing-reviews-4" name="eventStaffing-reviews" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="eventStaffing-reviews-5"><input type="radio" id="eventStaffing-reviews-5" name="eventStaffing-reviews" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Reliability</b></p>';
            question += '<label for="eventStaffing-reliable-1"><input type="radio" id="eventStaffing-reliable-1" name="eventStaffing-reliable" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="eventStaffing-reliable-2"><input type="radio" id="eventStaffing-reliable-2" name="eventStaffing-reliable" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="eventStaffing-reliable-3"><input type="radio" id="eventStaffing-reliable-3" name="eventStaffing-reliable" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="eventStaffing-reliable-4"><input type="radio" id="eventStaffing-reliable-4" name="eventStaffing-reliable" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="eventStaffing-reliable-5"><input type="radio" id="eventStaffing-reliable-5" name="eventStaffing-reliable" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Gender</b></p>';
            question += '<label for="eventStaffing-gender-1"><input type="radio" id="eventStaffing-gender-1" name="eventStaffing-gender" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="eventStaffing-gender-2"><input type="radio" id="eventStaffing-gender-2" name="eventStaffing-gender" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="eventStaffing-gender-3"><input type="radio" id="eventStaffing-gender-3" name="eventStaffing-gender" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="eventStaffing-gender-4"><input type="radio" id="eventStaffing-gender-4" name="eventStaffing-gender" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="eventStaffing-gender-5"><input type="radio" id="eventStaffing-gender-5" name="eventStaffing-gender" value="5"/><p>Very important (5)</p></label>';
            question += '</form><br><br><b><p id="warning" style="color: red;"></p></b>';
            break;
        case 4:
            window.scrollTo(0, 0);
            getSeenRankingForSurvey("Shopping");
            document.getElementById("ranking_description").innerHTML= 'Review the ranking for the task <b>\"Shopping\"';
            question = '<p style="text-align: center;"><b>4.</b> Please indicate how important the following features were to you for your selections for the task:<br> <b>\"Shopping\"</b>:</p><form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Number of tasks completed</b></p>';
            question += '<label class="features" for="shopping-tasks-1"><input type="radio" id="shopping-tasks-1" name="shopping-tasks" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="shopping-tasks-2"><input type="radio" id="shopping-tasks-2" name="shopping-tasks" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="shopping-tasks-3"><input type="radio" id="shopping-tasks-3" name="shopping-tasks" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="shopping-tasks-4"><input type="radio" id="shopping-tasks-4" name="shopping-tasks" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="shopping-tasks-5"><input type="radio" id="shopping-tasks-5" name="shopping-tasks" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Positive Reviews</b></p>';
            question += '<label for="shopping-reviews-1"><input type="radio" id="shopping-reviews-1" name="shopping-reviews" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="shopping-reviews-2"><input type="radio" id="shopping-reviews-2" name="shopping-reviews" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="shopping-reviews-3"><input type="radio" id="shopping-reviews-3" name="shopping-reviews" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="shopping-reviews-4"><input type="radio" id="shopping-reviews-4" name="shopping-reviews" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="shopping-reviews-5"><input type="radio" id="shopping-reviews-5" name="shopping-reviews" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Reliability</b></p>';
            question += '<label for="shopping-reliable-1"><input type="radio" id="shopping-reliable-1" name="shopping-reliable" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="shopping-reliable-2"><input type="radio" id="shopping-reliable-2" name="shopping-reliable" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="shopping-reliable-3"><input type="radio" id="shopping-reliable-3" name="shopping-reliable" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="shopping-reliable-4"><input type="radio" id="shopping-reliable-4" name="shopping-reliable" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="shopping-reliable-5"><input type="radio" id="shopping-reliable-5" name="shopping-reliable" value="5"/><p>Very important (5)</p></label>';
            question += '</form>';
            question += '<form id="questionForm" style="text-align: left;">';
            question += '<p><b>Feature: Gender</b></p>';
            question += '<label for="shopping-gender-1"><input type="radio" id="shopping-gender-1" name="shopping-gender" value="1"/><p>Not important (1)</p></label>';
            question += '<label for="shopping-gender-2"><input type="radio" id="shopping-gender-2" name="shopping-gender" value="2"/><p style="text-align: center;">(2)</p></label>';
            question += '<label for="shopping-gender-3"><input type="radio" id="shopping-gender-3" name="shopping-gender" value="3"/><p style="text-align: center;">(3)</p></label>';
            question += '<label for="shopping-gender-4"><input type="radio" id="shopping-gender-4" name="shopping-gender" value="4"/><p style="text-align: center;">(4)</p></label>';
            question += '<label for="shopping-gender-5"><input type="radio" id="shopping-gender-5" name="shopping-gender" value="5"/><p>Very important (5)</p></label>';
            question += '</form><br><br><b><p id="warning" style="color: red;"></p></b>';
            break;
        case 5:
            window.scrollTo(0, 0);
            document.getElementById("ranking").innerHTML = "";
            document.getElementById("ranking_description").innerHTML ="";
            question = '<p style="text-align: center;"><b>5.</b> Please describe briefly <br>how you made your decision when selecting candidates<b> with at least 40 characters</b>:</p><form id="questionForm" style="text-align: left;">';
            question += '<textarea id="descriptionUserAlgo" name="descriptionUserAlgo" placeholder="Please describe" style="width: 650px; height: 150px"></textarea>';
            question += '</form><br></b><p id="warning" style="color: red;"></p><br>';
            break;
        case 6:
            fired = false;
            question = '<p style="text-align: left;"><b>6.</b> A few last questions...</p><form id="questionForm1" style="text-align: left;"><br>';
            question += '<p style="text-align: left;"><b>To which gender identity do you most identify?</b></p><br>';
            question += '<label for="male"><input type="radio" id="male" name="gender" value="male">Male</label>';
            question += '<label for="female"><input type="radio" id="female" name="gender" value="female">Female</label>';
            question += '<label for="somethingElse"><input type="radio" id="somethingElse" name="gender" value="somethingElse">Other:<input type="text" style="width: 70px;" id="somethingElseText" value="" onkeypress="event.preventDefault();"></label>';
            question += '<label for="noAnswer"><input type="radio" id="noAnswer" name="gender" value="noAnswer">Prefer not to answer</label></form><br>';
            question += '<p style="text-align: left;"><b>How old are you?</b></p><form id="questionForm2" style="text-align: left;"><br>';
            question += '<label for="1824"><input type="radio" id="1824" name="age" value="1824">18-24 years</label>';
            question += '<label for="2534"><input type="radio" id="2534" name="age" value="2534">25-34 years</label>';
            question += '<label for="3544"><input type="radio" id="3544" name="age" value="3544">35-44 years</label>';
            question += '<label for="4554"><input type="radio" id="4554" name="age" value="4554">45-54 years</label>';
            question += '<label for="ge55"><input type="radio" id="ge55" name="age" value="ge55">\>54 years</label>';
            question += '<label for="noAnswer"><input type="radio" id="noAnswer" name="age" value="noAnswer">Prefer not to answer</label></form><br>';
            question += '<p style="text-align: left;"><b>What is the highest level of education you have completed?</b></p><form id="questionForm4" style="text-align: left;"><br>';
            question += '<label for="none"><input type="radio" id="none" name="edu" value="lessthanhs">Less than high school diploma</label>';
            question += '<label for="highschool"><input type="radio" id="highschool" name="edu" value="highschool">High school diploma</label>';
            question += '<label for="college"><input type="radio" id="college" name="edu" value="college">Undergraduate degree</label><br>';
            question += '<label for="master"><input type="radio" id="master" name="edu" value="master">Masters degree</label>';
            question += '<label for="PhD"><input type="radio" id="PhD" name="edu" value="PhD">PhD degree</label>';
            question += '<label for="noAnswer"><input type="radio" id="noAnswer" name="edu" value="noAnswer">Prefer not to answer</label></form><br>';
            question += '<p style="text-align: left;"><b>What is your total household income?</b></p><form id="questionForm3" style="text-align: left;"><br>';
            question += '<label for="less10k"><input type="radio" id="less10k" name="income" value="less10k">Less than $10,000</label>';
            question += '<label for="10k29k"><input type="radio" id="10k29k" name="income" value="10k29k">$10,000 to $29,999</label>';
            question += '<label for="30k59k"><input type="radio" id="30k59k" name="income" value="30k59k">$30,000 to $59,999</label><br><br>';
            question += '<label for="60k89k"><input type="radio" id="60k89k" name="income" value="60k89k">$60,000 to $89,999</label>';
            question += '<label for="90k119k"><input type="radio" id="90k119k" name="income" value="90k119k">$90,000 to $119,999</label>';
            question += '<label for="120kandMore"><input type="radio" id="120kandMore" name="income" value="120kandMore">$120,000 or more</label>';
            question += '<label for="noAnswer"><input type="radio" id="noAnswer" name="income" value="noAnswer">Prefer not to answer</label><br>';
            question += '</form><br><br><b><p id="warning" style="color: red;"></p></b>';
    }
    textField.innerHTML = question;
    try {
        document.getElementById('questionForm').addEventListener('submit', function (e) {
            e.preventDefault();
        }, false);
    } catch (e) {

    }
}

//#####################################################################

//#############################Logging#################################
function enter() {
    lastTimeHoverWasLogged = Date.now();
}

function leave(id) {
    var time = Date.now();
    var duration = time - lastTimeHoverWasLogged;
    if (alreadyHovered.includes(id) && duration >= 2000) {
        log("mouseEvent", "longHover", duration, id);
    } else {
        alreadyHovered.push(id);
        log("mouseEvent", "firstHover", duration, id);
    }
}

function createAndSendLog(stage, href = "") {
    if (stage === "survey") {
        var durationOfSurvey = endSurvey - startedSurvey;
        var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var durationOverall = endSurvey - startedBriefing;
        log("btn", "finishedTest", durationOfSurvey);
        log("screenWidth", screenWidth);
        log("timeStamps", "durationOverall", durationOverall);
        var q = new URL(window.location.href);
        workerID = q.searchParams.get("uID");
        var href = "end?uID=" + workerID;
        sendLog(stage, href);
    } else {
        if (stage === 0) {
            var durationOfBriefing = startedRanking[0] - startedBriefing;
            log("timeStamps", "briefingDuration", durationOfBriefing);
            stage = "briefing";
            sendLog(stage, href);
        }
        if (stage === 1) {
            var durationOfRanking = startedSurvey - startedRanking[startedRanking.length - 1];
            log("timeStamps", "rankingOverallDuration", durationOfRanking);
            stage = "ranking";
            sendLog(stage, href);
            //Only for multiple treatments
            //log("timeStamps", "rankingDurations", startedRanking);
            //log("treatmentOrder", rankingOrder);
        }

    }

}

function displayUniqueID() {
    var q = new URL(window.location.href);
    workerID = q.searchParams.get("uID");
    document.getElementById("survey_code").innerHTML = workerID;
}

function sendLog(stage, href = "") {
    var xhr = new XMLHttpRequest();
    var q = new URL(window.location.href);
    this.workerID = q.searchParams.get("uID");
    var url = "/log?uID=" + this.workerID + "&stage=" + stage;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (href !== "") {
                window.location.href = href;
            }
        }
    };

    xhr.send(JSON.stringify(logs));
}

function logObject(obj) {
    if ('answers' in obj) {
        obj["timeOfEvent"] = Date.now();
        obj["category"] = "surveyQuestionAnswers";
        logs.push(obj);
    } else {
        var logEntry = {};
        logEntry["category"] = "rankingRepresentation";
        logEntry["timeOfEvent"] = Date.now();
        logEntry["ranking"] = obj;
        logs.push(logEntry);
    }

}

function log(category, eventDescription, duration = 0, itemID = "none") {
    if (eventDescription === 1) {
        try {
            document.getElementById("error-box").innerHTML = '';
        } catch (e) {
            console.log(e.stackTrace);
        }
        itemID = category;
        try {
            if (document.getElementById(itemID).getAttribute("selected") == "false") {
                eventDescription = "select";
                category = "mouseEvent";
            } else if (document.getElementById(itemID).getAttribute("selected") == "true") {
                eventDescription = "unselect";
                category = "mouseEvent";
            } else {
                eventDescription = "click";
                category = "mouseEvent";
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (eventDescription === "hover") {
        itemID = category;
        category = "mouseEvent";
    }
    let logEntry = {};
    logEntry["category"] = category;
    logEntry["eventName"] = eventDescription;
    logEntry["itemID"] = itemID;
    logEntry["timeOfEvent"] = Date.now();
    logEntry["eventDuration"] = duration;
    logs.push(logEntry);
}

//#####################################################################################

//#####################################Dynamic Page Elements###########################
//Briefing

//ranking
function tag(id) {
    var ele = document.getElementById(id);
    if (ele.getAttribute("selected") == "false" && selected < requiredSelected) {
        ele.setAttribute("selected", "true");
        ele.setAttribute("style", "background-color: steelblue;");
        var prioList = document.getElementById((selected+1)+"-li");
        var name = ele.getElementsByTagName("h3")[1].innerText;
        prioList.innerText = name;
        prioList.setAttribute("class",name);
        selected++;
    } else if (ele.getAttribute("selected") == "true") {
        ele.setAttribute("selected", "false");
        ele.setAttribute("style", "");
        var name = ele.getElementsByTagName("h3")[1].innerText;
        var listElement = document.getElementsByClassName(name)[0];
        listElement.setAttribute("class","");
        listElement.innerText = "";
        var orderedList = document.getElementById("priority-list").children;
        for(var i=0; i <orderedList.length; i++){
            if(orderedList[i].innerText == "" && i+1 < 4){
                orderedList[i].innerText = orderedList[i+1].innerText;
                orderedList[i].setAttribute("class",orderedList[i+1].getAttribute("class"))
                orderedList[i+1].innerText = "";
                orderedList[i+1].setAttribute("class","");
            }
        }
        selected--;
    } else if (ele.getAttribute("selected") == "false" && selected >= requiredSelected) {
        log("mouseEvent", "fourthElementSelected", 0, id);
        html = '<h3 style="color: red; border: solid red;">You have already selected ' + requiredSelected + ' candidates.';
        html += 'If you want to select another candidate, first deselect one.</h3>';
        document.getElementById("error-box").innerHTML = html;
    }
}

//######################################################################################