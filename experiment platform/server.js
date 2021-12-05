const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const XMLHttpRequest = require('xhr2');
const fs = require('fs');
const path = require('path');
const numberOfRankingTypes = 8;
const lastNames = JSON.parse(fs.readFileSync('./data/lastNames.json'))["lastNames"];
const maleNames = JSON.parse(fs.readFileSync('./data/maleNames.json'))["maleNames"];
const femaleNames = JSON.parse(fs.readFileSync('./data/femaleNames.json'))["femaleNames"];
var users = new Map();
var userTreatmentPosition = new Map();
var userClickData = new Map();
var userTreatmentOrder = new Map();
var userNamesLists = new Map();
var userRankingsSeenInOrder = new Map();
const jobTitleOrder = ["Moving Assistance", "Event Staffing", "Shopping"];
const skill1 = " Positive Reviews";
const skill2 = "\% Reliable";
const skill3 = "Tasks Completed";
global.rankingTypeDist = [1, 1, 1, 1, 0, 0];
//const Zip = require('node-zip');

app.use(bodyParser.json());

app.post('/log', function (req, res) {
    var workerID = req.query.uID;
    var stage = req.query.stage;
    var newData = req.body;
    if (stage === "survey") {
        let oldData = userClickData.get(workerID);
        oldData['' + stage] = newData;
        oldData["treatmentOrder"] = userTreatmentOrder.get(workerID);
        userClickData.set(workerID, oldData);
        fs.writeFile('./data/logs/' + workerID + '.json', JSON.stringify(oldData), function (err, result) {
            if (err) console.log('error', err);
        });
        userClickData.delete(workerID);
    } else {
        if (!userClickData.has(workerID)) {
            var oldData = {};
            oldData['' + stage] = newData;
            userClickData.set(workerID, oldData);
        } else {
            let oldData = userClickData.get(workerID);
            oldData['' + stage] = newData;
            userClickData.set(workerID, oldData);
        }
    }
    res.status(200);
    res.send();
});
app.get('/jobRankingSeen', function (req,res) {
var workerID = req.query.uID;
var jobTitle = req.query.job;
var ranking = userRankingsSeenInOrder.get(workerID).get(jobTitle);
var response = {};
response.ranking = ranking;
res.status(200);
res.send(JSON.stringify(response));
});
app.get('/nextRanking', function (req, res) {
    var workerID = req.query.uID;
    var rankingOrder = users.get(workerID);
    var treatmentPosition = userTreatmentPosition.get(workerID);
    var response = {};
    if (treatmentPosition < rankingOrder.length - 1) {
        treatmentPosition = treatmentPosition + 1;
        userTreatmentPosition.set(workerID, treatmentPosition);
        treatmentPosition = userTreatmentOrder.get(workerID)[treatmentPosition];
        let data = getDataByRankingType(rankingOrder[treatmentPosition], treatmentPosition, workerID);
        response.rankingType = rankingOrder[treatmentPosition];
        response.html = data.html;
        response.ranking = data.data;
        var userRankingSeenMap = userRankingsSeenInOrder.get(workerID);
        userRankingSeenMap.set(jobTitleOrder[treatmentPosition],data.html);
        userRankingsSeenInOrder.set(workerID,userRankingSeenMap);
        response.jobTitle = jobTitleOrder[treatmentPosition];
        response.rankingOrder = rankingOrder;
        response.end = false;
        res.status(200);
        res.send(JSON.stringify(response));
    } else {
        treatmentPosition = userTreatmentOrder.get(workerID)[treatmentPosition];
        response.rankingType = rankingOrder[treatmentPosition];
        response.rankingOrder = rankingOrder;
        response.end = true;
        res.status(200);
        res.send(JSON.stringify(response));
    }

});

function createUserTreatmentOrder(workderID){
    var treatmentOrder = [0,1,2];
    treatmentOrder = shuffle(treatmentOrder);
    userTreatmentOrder.set(workderID,treatmentOrder);
}

app.get('/user', function (req, res) {
    var workerID = req.query.uID;
    var rankingOrder;
    var position;
    if (!users.has(workerID)) {
        rankingOrder = getRankingOrder();
        position = 0;
        userNamesLists.set(workerID,[]);
        users.set(workerID, rankingOrder);
        userTreatmentPosition.set(workerID, position);
        userRankingsSeenInOrder.set(workerID,new Map());
        createUserTreatmentOrder(workerID);
    } else {
        rankingOrder = users.get(workerID);
        position = userTreatmentPosition.get(workerID);
        position = userTreatmentOrder.get(workerID)[position];
    }
    var data = getDataByRankingType(rankingOrder[position], userTreatmentOrder.get(workerID)[position], workerID);
    var userRankingSeenMap = userRankingsSeenInOrder.get(workerID);
    userRankingSeenMap.set(jobTitleOrder[userTreatmentOrder.get(workerID)[position]],data);
    userRankingsSeenInOrder.set(workerID,userRankingSeenMap);
    var response = {};
    response.rankingType = rankingOrder[position];
    response.html = data.html;
    response.ranking = data.data;
    response.jobTitle = jobTitleOrder[userTreatmentOrder.get(workerID)[position]];
    response.rankingOrder = rankingOrder;
    //response.treatmentPosition = position;
    res.status(200);
    res.send(JSON.stringify(response));
});

app.get('/register', function (req, res) {
    var user = {};
    var workerID = req.query.workerID;
    var uID = req.query.uID;
    user.workerID = workerID;
    user.uID = uID;
    fs.writeFile('./data/registered/' + workerID + '.json', JSON.stringify(user), function (err, result) {
        if (err) console.log('error', err);
    });
    res.status(200);
    res.send();
});

app.get('/briefing', function (req, res) {
    res.sendFile(__dirname + "/public/" + "briefing.html");
});

app.get('/test', function (req, res) {
    res.sendFile(__dirname + "/public/" + "demo.html");
});

app.get('/end', function (req, res) {
    res.sendFile(__dirname + "/public/" + "end.html");
});

app.get('/survey', function (req, res) {
    res.sendFile(__dirname + "/public/" + "survey.html");
});

app.get('/stylesheet.css', function (req, res) {
    res.sendFile(__dirname + "/public/" + "stylesheet.css");
});

app.get('/script.js', function (req, res) {
    res.sendFile(__dirname + "/public/" + "script.js");
});

app.get('/male.png', function (req, res) {
    res.sendFile(__dirname + "/public/" + "male.png");
});

app.get('/female.png', function (req, res) {
    res.sendFile(__dirname + "/public/" + "female.png");
});

app.get('/tasks_completed.png', function (req, res) {
    res.sendFile(__dirname + "/public/" + "tasks_completed.png");
});

app.get('/star.png', function (req, res) {
    res.sendFile(__dirname + "/public/" + "star.png");
});

app.get('/reliable.png', function (req, res) {
    res.sendFile(__dirname + "/public/" + "reliable.png");
});

function getMinOfRankingTypes() {
    var min = rankingTypeDist[0];
    var min_index = 0;
    for(var i = 1; i < rankingTypeDist.length; i++){
        if(rankingTypeDist[i] < min){
            min = rankingTypeDist[i];
            min_index = i;
        }
    }
    console.log(min_index);
    return min_index;
}

function getRankingOrder() {
    //var array = Array.from(Array(numberOfRankingTypes).keys());
    //return shuffle(array);
    var array = [];
    lastRankingType = getMinOfRankingTypes();
    array.push(lastRankingType);
    array.push(lastRankingType);
    array.push(lastRankingType);
    rankingTypeDist[lastRankingType]++;

    return array;
}

function drawMaleName(workerId) {
    var firstNameIndex = Math.floor(Math.random() * maleNames.length);
    var lastNameIndex = Math.floor(Math.random() * lastNames.length);
    var name = maleNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    var namesUsed = userNamesLists.get(workerId);
    while(namesUsed.includes(name)){
        firstNameIndex = Math.floor(Math.random() * maleNames.length);
        lastNameIndex = Math.floor(Math.random() * lastNames.length);
        name = maleNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    }
    namesUsed.push(name);
    userNamesLists.set(workerId,namesUsed);
    return name;
}

function drawFemaleName(workerId) {
    var firstNameIndex = Math.floor(Math.random() * femaleNames.length);
    var lastNameIndex = Math.floor(Math.random() * lastNames.length);
    var name = femaleNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    var namesUsed = userNamesLists.get(workerId);
    while(namesUsed.includes(name)){
        firstNameIndex = Math.floor(Math.random() * femaleNames.length);
        lastNameIndex = Math.floor(Math.random() * lastNames.length);
        name = femaleNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    }
    namesUsed.push(name);
    userNamesLists.set(workerId,namesUsed);
    return name;
}

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function createOneListNotMonotonic(rawdata, jobTitle, workerId, showScore = false) {
    var obj = JSON.parse(rawdata);
    var data = shuffle(obj.totaldata)

    var html = '';
    for (var i = 0; i < data.length - 1; i = i + 2) {
        var candidate1 = data[i];
        if(candidate1.tag1 == null){
            var cand1Tag1 = "No  ";
        }
        var cand1Tag1 = " " + candidate1.tag1 + skill1;
        var cand1Tag2 = " " + candidate1.tag2 + skill2;
        var cand1Tag3 = " " + candidate1.tag3 +" "+jobTitle+" "+ skill3;
        var cand1ID = candidate1.id;
        if (candidate1["gender"] == "f") {
            var cand1Picture = "female.png";
            var cand1Name = drawFemaleName(workerId);
        } else {
            var cand1Picture = "male.png";
            var cand1Name = drawMaleName(workerId);
        }
        (data[i])["name"] = cand1Name;
        (data[i])["rank"] = (i + 1);
        var candidate2 = data[i + 1];
        var cand2Tag1 = " " + candidate2.tag1 + skill1;
        var cand2Tag2 = " " + candidate2.tag2 + skill2;
        var cand2Tag3 = " " + candidate2.tag3 +" "+jobTitle+" "+ skill3;
        var cand2ID = candidate2.id;
        if (candidate2["gender"] == "f") {
            var cand2Picture = "female.png";
            var cand2Name = drawFemaleName(workerId);
        } else {
            var cand2Picture = "male.png";
            var cand2Name = drawMaleName(workerId);
        }
        (data[i + 1])["name"] = cand2Name;
        (data[i + 1])["rank"] = (i + 2);
        var hover = 'hover';
        var click = 'click';
        html += '<tr class="ranking_row"><td class="item first" selected="false" id="' + cand1ID + '" onmouseenter="enter();"';
        html += 'onmouseleave="leave(' + cand1ID + ');" onclick="log(' + cand1ID + ',1);';
        html += 'tag(' + cand1ID + ');"><table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var cand1Score = candidate1.score;
            html += '<td class="score"><div class="score-div">' + cand1Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand1Picture + '"/></td><td class="text" colspan="2">';
        html += '<h3>' + cand1Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand1Tag3 + '</div><div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand1Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand1Tag2 + '</span></div></td></tr></tbody></table></td><td class="center"/>';

        html += '<td class="item second" selected="false" id="' + cand2ID + '" onmouseenter="enter();"';
        html += ' onmouseleave="leave(' + cand2ID + ');" onclick="log(' + cand2ID + ',1); tag(' + cand2ID + ');">';
        html += '<table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 2) + '.</h3></td>';
        if (showScore) {
            var cand2Score = candidate2.score;
            html += '<td class="score"><div class="score-div">' + cand2Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand2Picture + '"/></td><td class="text" colspan="2"><h3>' + cand2Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand2Tag3 + '</div>';
        html += '<div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand2Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand2Tag2 + '</span></div></td></tr></tbody></table></td>';

        html += '</tr><tr class="spacing_row"/>';
    }
    var object = {};
    object["html"] = html;
    object["data"] = data;
    return object;

}

function createOneListMonotonic(rawdata, jobTitle, workerId, showScore = false) {
    var obj = JSON.parse(rawdata);
    var data = obj.totaldata.sort(function (a, b) {
        var keyA = a.scorerank;
        var keyB = b.scorerank;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var html = '';
    for (var i = 0; i < data.length - 1; i = i + 2) {
        var candidate1 = data[i];
        var cand1Tag1 = " " + candidate1.tag1 + skill1;
        var cand1Tag2 = " " + candidate1.tag2 + skill2;
        var cand1Tag3 = " " + candidate1.tag3 +" "+jobTitle+" "+ skill3;
        var cand1ID = candidate1.id;
        if (candidate1["gender"] == "f") {
            var cand1Picture = "female.png";
            var cand1Name = drawFemaleName(workerId);
        } else {
            var cand1Picture = "male.png";
            var cand1Name = drawMaleName(workerId);
        }
        (data[i])["name"] = cand1Name;
        (data[i])["rank"] = (i + 1);
        var candidate2 = data[i + 1];
        var cand2Tag1 = " " + candidate2.tag1 + skill1;
        var cand2Tag2 = " " + candidate2.tag2 + skill2;
        var cand2Tag3 = " " + candidate2.tag3 +" "+jobTitle+" "+ skill3;
        var cand2ID = candidate2.id;
        if (candidate2["gender"] == "f") {
            var cand2Picture = "female.png";
            var cand2Name = drawFemaleName(workerId);
        } else {
            var cand2Picture = "male.png";
            var cand2Name = drawMaleName(workerId);
        }
        (data[i + 1])["name"] = cand2Name;
        (data[i + 1])["rank"] = (i + 2);
        var hover = 'hover';
        var click = 'click';
        html += '<tr class="ranking_row"><td class="item" selected="false" id="' + cand1ID + '" onmouseenter="enter();"';
        html += 'onmouseleave="leave(' + cand1ID + ');" onclick="log(' + cand1ID + ',1);';
        html += 'tag(' + cand1ID + ');"><table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var cand1Score = candidate1.score;
            html += '<td class="score"><div class="score-div">' + cand1Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand1Picture + '"/></td><td class="text" colspan="2">';
        html += '<h3>' + cand1Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand1Tag3 + '</div><div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand1Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand1Tag2 + '</span></div></td></tr></tbody></table></td><td class="center"/>';


        html += '<td class="item second" selected="false" id="' + cand2ID + '" onmouseenter="enter();"';
        html += ' onmouseleave="leave(' + cand2ID + ');" onclick="log(' + cand2ID + ',1); tag(' + cand2ID + ');">';
        html += '<table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 2) + '.</h3></td>';
        if (showScore) {
            var cand2Score = candidate2.score;
            html += '<td class="score"><div class="score-div">' + cand2Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand2Picture + '"/></td><td class="text" colspan="2"><h3>' + cand2Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand2Tag3 + '</div>';
        html += '<div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand2Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand2Tag2 + '</span></div></td></tr></tbody></table></td>';

        html += '</tr><tr class="spacing_row"/>'
    }
    var object = {};
    object["html"] = html;
    object["data"] = data;
    return object;

}

function createOneListFair(rawdata, jobTitle, workerId, showScore = false) {
    var obj = JSON.parse(rawdata);
    var data = obj.totaldata.sort(function (a, b) {
        var keyA = a.fairrank;
        var keyB = b.fairrank;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var html = '';
    for (var i = 0; i < data.length - 1; i = i + 2) {
        var candidate1 = data[i];
        var cand1Tag1 = " " + candidate1.tag1 + skill1;
        var cand1Tag2 = " " + candidate1.tag2 + skill2;
        var cand1Tag3 = " " + candidate1.tag3 +" "+jobTitle+" "+ skill3;
        var cand1ID = candidate1.id;
        if (candidate1["gender"] == "f") {
            var cand1Picture = "female.png";
            var cand1Name = drawFemaleName(workerId);
        } else {
            var cand1Picture = "male.png";
            var cand1Name = drawMaleName(workerId);
        }
        (data[i])["name"] = cand1Name;
        (data[i])["rank"] = (i + 1);
        var candidate2 = data[i + 1];
        var cand2Tag1 = " " + candidate2.tag1 + skill1;
        var cand2Tag2 = " " + candidate2.tag2 + skill2;
        var cand2Tag3 = " " + candidate2.tag3 +" "+jobTitle+" "+ skill3;
        var cand2ID = candidate2.id;
        if (candidate2["gender"] == "f") {
            var cand2Picture = "female.png";
            var cand2Name = drawFemaleName(workerId);
        } else {
            var cand2Picture = "male.png";
            var cand2Name = drawMaleName(workerId);
        }
        (data[i + 1])["name"] = cand2Name;
        (data[i + 1])["rank"] = (i + 2);
        var hover = 'hover';
        var click = 'click';
        html += '<tr class="ranking_row"><td class="item" selected="false" id="' + cand1ID + '" onmouseenter="enter();"';
        html += 'onmouseleave="leave(' + cand1ID + ');" onclick="log(' + cand1ID + ',1);';
        html += 'tag(' + cand1ID + ');"><table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var cand1Score = candidate1.score;
            html += '<td class="score"><div class="score-div">' + cand1Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand1Picture + '"/></td><td class="text" colspan="2">';
        html += '<h3>' + cand1Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand1Tag3 + '</div><div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand1Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand1Tag2 + '</span></div></td></tr></tbody></table></td><td class="center"/>';


        html += '<td class="item second" selected="false" id="' + cand2ID + '" onmouseenter="enter();"';
        html += ' onmouseleave="leave(' + cand2ID + ');" onclick="log(' + cand2ID + ',1); tag(' + cand2ID + ');">';
        html += '<table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 2) + '.</h3></td>';
        if (showScore) {
            var cand2Score = candidate2.score;
            html += '<td class="score"><div class="score-div">' + cand2Score + '</div></td>';
        }
        html += '<td class="img"><img src="' + cand2Picture + '"/></td><td class="text" colspan="2"><h3>' + cand2Name + '</h3><div style="text-align:left;"><img style="height: 16px; width: 16px;" src="tasks_completed.png"/>' + cand2Tag3 + '</div>';
        html += '<div class="tags"><img style="height: 16px; width: 16px; text-align: left;" src="star.png"/><span class="tagspan">' + cand2Tag1 + '     </span><p style="margin: 5px;"></p><img style="height: 16px; width: 16px; text-align: left;" src="reliable.png"/><span class="tagspan">' + cand2Tag2 + '</span></div></td></tr></tbody></table></td>';

        html += '</tr><tr class="spacing_row"/>'
    }
    var object = {};
    object["html"] = html;
    object["data"] = data;
    return object;

}

function createTwoListMonotonicWomenLeft(rawdata, showScore = false) {
    var obj = JSON.parse(rawdata);
    var female_data = obj.data.female.sort(function (a, b) {
        var keyA = a.xp_ranking;
        var keyB = b.xp_ranking;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    var male_data = obj.data.male.sort(function (a, b) {
        var keyA = a.xp_ranking;
        var keyB = b.xp_ranking;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    var data = [];
    var html = '';
    for (var i = 0; i < female_data.length; i++) {
        var maleName = drawMaleName();
        var maleTag1 = "" + male_data[i].tag1 + skill1;
        var maleTag2 = "" + male_data[i].tag2 + skill2;
        var maleTotal = "" + male_data[i].totalExp;
        var maleID = male_data[i].id;
        var femaleName = drawFemaleName();
        var femaleTag1 = "" + female_data[i].tag1 + skill1;
        var femaleTag2 = "" + female_data[i].tag2 + skill2;
        var femaleID = female_data[i].id;
        var femaleTotal = "" + female_data[i].totalExp;
        (female_data[i]["name"]) = femaleName;
        (female_data[i]["rank"]) = (i + 1);
        data[i] = new Array(2);
        data[i][0] = female_data[i];
        (male_data[i]["name"]) = maleName;
        (male_data[i]["rank"]) = (i + 1);
        data[i][1] = male_data[i];
        var hover = 'hover';
        var click = 'click';
        html += '<tr class="ranking_row"><td class="item" selected="false" id="' + femaleID + '" onmouseenter="enter();"';
        html += 'onmouseleave="leave(' + femaleID + ');" onclick="log(' + femaleID + ',1);';
        html += 'tag(' + femaleID + ');"><table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var femaleScore = female_data[i].score;
            html += '<td class="score"><div class="score-div">' + femaleScore + '</div></td>';
        }
        html += '<td class="img"><img src="female.png"/></td><td class="text" colspan="2">';
        html += '<h3>' + femaleName + '</h3><div style="text-align:left;">Total Experience ' + femaleTotal + ' years</div><div class="tags"><span class="tagspan">' + femaleTag1 + '     </span><p style="margin: 5px;"></p><span class="tagspan">' + femaleTag2 + '</span>';
        html += '</div></td></tr></tbody></table></td><td class="center"/><td class="item" selected="false" id="' + maleID + '" onmouseenter="enter();"';
        html += ' onmouseleave="leave(' + maleID + ');" onclick="log(' + maleID + ',1); tag(' + maleID + ');">';
        html += '<table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var maleScore = male_data[i].score;
            html += '<td class="score"><div class="score-div">' + maleScore + '</div></td>';
        }
        html += '<td class="img"><img src="male.png"/></td><td class="text" colspan="2"><h3>' + maleName + '</h3><div style="text-align:left;">Total Experience ' + maleTotal + ' years</div>';
        html += '<div class="tags"><span class="tagspan">' + maleTag1 + '     </span><p style="margin: 5px;"></p><span class="tagspan">' + maleTag2 + '</span></div></td></tr></tbody></table></td></tr><tr class="spacing_row"/>';
    }
    var object = {};
    object["html"] = html;
    object["data"] = data;
    return object;

}

function createTwoListMonotonicWomenRight(rawdata, showScore = false) {
    var obj = JSON.parse(rawdata);
    var female_data = obj.data.female.sort(function (a, b) {
        var keyA = a.xp_ranking;
        var keyB = b.xp_ranking;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    var male_data = obj.data.male.sort(function (a, b) {
        var keyA = a.xp_ranking;
        var keyB = b.xp_ranking;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    var data = [male_data.length];
    var html = '';
    for (var i = 0; i < female_data.length; i++) {
        var maleName = drawMaleName();
        var maleTag1 = "" + male_data[i].tag1 + skill1;
        var maleTag2 = "" + male_data[i].tag2 + skill2;
        var maleTotal = "" + male_data[i].totalExp;
        var maleID = male_data[i].id;

        var femaleName = drawFemaleName();
        var femaleTag1 = "" + female_data[i].tag1 + skill1;
        var femaleTag2 = "" + female_data[i].tag2 + skill2;
        var femaleID = female_data[i].id;
        var femaleTotal = "" + female_data[i].totalExp;
        data[i] = new Array(2);
        (female_data[i]["name"]) = femaleName;
        (female_data[i]["rank"]) = (i + 1);
        data[i][1] = female_data[i];
        (male_data[i]["name"]) = maleName;
        (male_data[i]["rank"]) = (i + 1);
        data[i][0] = male_data[i];
        var hover = 'hover';
        var click = 'click';
        html += '<tr class="ranking_row"><td class="item" selected="false" id="' + maleID + '" onmouseenter="enter();"';
        html += 'onmouseleave="leave(' + maleID + ');" onclick="log(' + maleID + ',1);';
        html += 'tag(' + maleID + ');"><table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var maleScore = male_data[i].score;
            html += '<td class="score"><div class="score-div">' + maleScore + '</div></td>';
        }
        html += '<td class="img"><img src="male.png"/></td><td class="text" colspan="2">';
        html += '<h3>' + maleName + '</h3><div style="text-align:left;">Total Experience ' + maleTotal + ' years</div><div class="tags"><span class="tagspan">' + maleTag1 + '     </span><p style="margin: 5px;"></p><span class="tagspan">' + maleTag2 + '</span>';
        html += '</div></td></tr></tbody></table></td><td class="center"/><td class="item" selected="false" id="' + femaleID + '" onmouseenter="enter();"';
        html += ' onmouseleave="leave(' + femaleID + ');" onclick="log(' + femaleID + ',1); tag(' + femaleID + ');">';
        html += '<table class="inner" style="min-width: 450px;"><tbody><tr><td><h3>' + (i + 1) + '.</h3></td>';
        if (showScore) {
            var femaleScore = female_data[i].score;
            html += '<td class="score"><div class="score-div">' + femaleScore + '</div></td>';
        }
        html += '<td class="img"><img src="female.png"/></td><td class="text" colspan="2"><h3>' + femaleName + '</h3><div style="text-align:left;">Total Experience ' + femaleTotal + ' years</div>';
        html += '<div class="tags"><span class="tagspan">' + femaleTag1 + '     </span><p style="margin: 5px;"></p><span class="tagspan">' + femaleTag2 + '</span></div></td></tr></tbody></table></td></tr><tr class="spacing_row"/>';
    }
    var object = {};
    object["html"] = html;
    object["data"] = data;
    return object;

}

function getDataByRankingType(rankingType, position, workerId) {
    var rawdata = "";
    var data = {};
    var taskName = "";
    switch (position) {
        case 0:
            taskName ="help_moving";
            break;
        case 1:
            taskName = "event_staffing";
            break;
        case 2:
            taskName = "shopping";
            break;
    }
    console.log(rankingType);
    switch (rankingType) {
        case 0: //shuffled original
            rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'.json');
            data = createOneListNotMonotonic(rawdata, jobTitleOrder[position], workerId);
            break;
        case 1: //shuffled swapped
            rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'_swapped.json');
            data = createOneListNotMonotonic(rawdata, jobTitleOrder[position], workerId);
            break;
        case 2: //score rank original
            rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'.json');
            data = createOneListMonotonic(rawdata, jobTitleOrder[position], workerId);
            break;
        case 3: //score rank swapped
            rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'_swapped.json');
            data = createOneListMonotonic(rawdata, jobTitleOrder[position], workerId);
            break;
         case 4:
             rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'.json');
             data = createOneListFair(rawdata, jobTitleOrder[position], workerId);
             break;
         case 5:
             rawdata = fs.readFileSync('./data/rabbitData/cleanedData/'+taskName+'_swapped.json');
             data = createOneListFair(rawdata, jobTitleOrder[position], workerId);
             break;
        /**
        case 6:
            rawdata = fs.readFileSync('./data/30_data_f_'+position+'.json');
            data = createTwoListMonotonicWomenRight(rawdata);
            break;
        case 7:
            rawdata = fs.readFileSync('./data/30_data_m_'+position+'.json');
            data = createTwoListMonotonicWomenRight(rawdata);
            break;
 **/
    }
    return data;
}

app.listen(8080, function () {
    console.log('Survey server up and running.');
});