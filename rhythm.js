// This test is cobbled together as a proof of concept. I was never a great programmer, and I am very out of practice.
// most of the code is directly lifted from the tutorial examples from surikov's webaudiofont resource.
// I am so grateful for all the examples on stack overflow for how to implement things I needed!
// I have left some currently unused code in here that I may want in future development.
const snare = _drum_40_0_Chaos_sf2_file;
const highConga = _drum_63_0_Chaos_sf2_file;
const lowConga = _drum_64_0_Chaos_sf2_file;
const lowCongaNote = 64;
const snareNote = 38;
const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContextFunc();
const output = audioContext.destination;
const player = new WebAudioFontPlayer();
player.loader.decodeAfterLoading(audioContext, '_drum_40_0_Chaos_sf2_file');
player.loader.decodeAfterLoading(audioContext, '_drum_64_0_Chaos_sf2_file');
player.loader.decodeAfterLoading(audioContext, '_drum_63_0_Chaos_sf2_file');

let exampleLen = 4;

let bpm = 60; //Set Tempo
let beatLen = 60 / bpm; // 60 / 60bpm gives value of 1, which appears to make bpm work accurately
let startTime = 0;
let notes = [[]];
let beats = [];
let solution = "";
let replayOK = 0;
let curatedSet = 0;
let curatedSetChoice = [];
let beatDiv = 4;
let countoffLen = 2;
let answerSet = [" "];
let answerSetDisplay = [];
let latestAnswerCount = 0;
let currentDifficulty = 4

const testResultField = document.getElementById("testResult")
const selectedLengthField = document.getElementById("selectedLength")
const userAnswerField = document.getElementById("userAnswer")
const difficultyField = document.getElementById("selectedDifficulty")


let simpleSet=[
    {"rhythm": "cheese", "beats": [1,0,0,0], "difficulty": 1},
    {"rhythm": "frenchtoast", "beats": [1,0,1,0], "difficulty": 1},
    {"rhythm": "hamburger", "beats": [1,0,1,1], "difficulty": 2},
    {"rhythm": "watermelon", "beats": [1,1,1,1], "difficulty": 2},
    {"rhythm": "eggsand", "beats": [1,0,0,1], "difficulty": 3},
    {"rhythm": "bacon", "beats": [1,1,0,0], "difficulty": 3},
    {"rhythm": "wafflesand", "beats": [1,1,0,1], "difficulty": 3},
    {"rhythm": "applejuice", "beats": [1,1,1,0], "difficulty": 3},
    {"rhythm": "triplet", "beats": [1,1,1], "difficulty": 4}
];
let currentChunks = [...simpleSet]
showChunks()

let wooHoo = new Audio('./assets/sounds/woohoo.mp3');
let tryAgain = new Audio('./assets/sounds/tryagain.mp3');
let groovy = new Audio('./assets/sounds/groovy.mp3');


function setExampleLen(dropchoice) {
    curatedSet = 0;
    exampleLen = dropchoice;
    selectedLengthField.innerHTML = `Selected length: ${exampleLen} beats`;
    replayOK = 0;
}

function setDifficulty(difficultyChoice) {
    currentDifficulty = difficultyChoice
    difficultyField.innerHTML = `Selected difficulty: ${currentDifficulty}`
    showChunks()
}

function cancel(){
    player.cancelQueue(audioContext);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createExample() {
    if (curatedSet == 0) {
        let randomRhythm
        for (let n = 0; n < exampleLen; n++) {
            randomRhythm = currentChunks[getRandomInt(currentChunks.length)];
            beats[n] = randomRhythm["rhythm"];
            notes[n] = randomRhythm["beats"];
        }
    }
}

function countoff() {
    let timing=0;
    for (let n = 0;n < countoffLen; n++) {
        timing = n * beatLen;
        player.queueWaveTable(audioContext, output, lowConga, startTime + timing , lowCongaNote, 1);
    }	
}

function playFun() {
    let noteTiming=0;
    let beatTiming=0;
    for (let n = 0; n < exampleLen; n++) { 
        beatTiming = n * beatLen;
        /* player.queueWaveTable(audioContext, output, lowConga, startTime + beatTiming , lowCongaNote, 1); */
        for (let x = 0; x < notes[n].length; x++) {
            noteTiming = beatTiming + (x * (beatLen / notes[n].length));
            if (notes[n][x] == 1) {
                player.queueWaveTable(audioContext, output, snare, startTime + noteTiming , snareNote, 1);
            }
        }
    }
}

function start() {
    initializeValues()
    showChunks()
    display();
    createExample();
    countOffAndPlay()
    replayOK = 1;
}

function initializeValues() {
    selectedLengthField.innerHTML = `Selected length: ${exampleLen} beats`;
    userAnswerField.innerHTML = "";
    testResultField.innerHTML = "";
    answerSet = [];
    answerSetDisplay = [];
    latestAnswerCount = 0;
}

function showChunks() {
    currentChunks = simpleSet.filter(rhythm => rhythm["difficulty"] <= currentDifficulty)

    let rhythmTemplate = document.getElementById("rhythm-template").innerHTML
    let rhythmGenerator = _.template(rhythmTemplate)
    let rhythmTarget = document.getElementById("rhythm-list")
    rhythmTarget.innerHTML = ""

    for (let chunk of currentChunks) {
        console.log(chunk)
        let rhythmHTML = rhythmGenerator(chunk)
        rhythmTarget.innerHTML += rhythmHTML
    }
}

function countOffAndPlay() {
    startTime = audioContext.currentTime + 0.1;
    countoff();
    startTime = audioContext.currentTime + (countoffLen * beatLen);
    playFun();
}
    
function replay() {
    if (replayOK == 1) {
        countOffAndPlay()
    }
}

// displays answer when button is pressed ---THIS NEEDS TO BE REWRITTEN!!!!!!!
function display() {
    userAnswerField.innerHTML = "Your Answer:" + answerSetDisplay.join("");
}

function addRhythm(rhythmID) {
    answerSet[latestAnswerCount] = rhythmID;
    answerSetDisplay[latestAnswerCount] = `<img src="${rhythmID}.png">`;
    display();
    latestAnswerCount++;
}

function delRhythm() {
    answerSet.pop();
    answerSetDisplay.pop();
    display();
    if (latestAnswerCount > 0) {
        latestAnswerCount--;
    }
}

function testAnswer()  {
    let xT = answerSet.join();
    let yT = beats.join();
    if (xT == yT) {
        wooHoo.play();
        testResultField.innerHTML = "YOU WERE RIGHT!";
    } else {
        tryAgain.play();
        testResultField.innerHTML = "Try Again...";
    }
}

const delRhythmButton = document.getElementById("delRhythmButton")
delRhythmButton.addEventListener("onClick", (e) => {
    e.preventDefault()
    delRhythm()
})

const diffSelects = document.querySelectorAll(".diff-choose")
for (i = 0; i < diffSelects.length; i++) {
    diffSelects[i].addEventListener("click", (e) => {
        e.preventDefault()
        setDifficulty(e.target.value)
    })
}