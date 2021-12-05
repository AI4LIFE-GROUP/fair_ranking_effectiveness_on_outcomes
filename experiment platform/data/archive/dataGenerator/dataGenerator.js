var numberOfCandidates = 10;
var minMen = 1;
var maxMen = 11; //exclusive
var minWomen = 0;
var maxWomen = 10; //exclusive

function generateExperienceList(min, max){
	var sum = 0;
	for(var i = 0; i<numberOfCandidates; i++){
		var add = (Math.random() * (max - min) + min).toFixed(1);
		sum = sum + add;
		console.log(add);
	}
}

console.log("Men");
generateExperienceList(minMen,maxMen);
console.log("Women");
