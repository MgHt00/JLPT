let kaVocab = [];
let hiVocab = [];
let enVocab = [];
let randomYesNo = randomInput;
let qChoice = qChoiceInput;
let qNo = 0;

const vocabMapping = {
  ka: kaVocab,
  hi: hiVocab,
  en: enVocab
};

// Fetch questions from JSON file
fetch('assets/data/n5-vocab.json')
  .then(response => response.json())
  .then(data => {
    vocabArray = data;
    fetchOneCategory(vocabArray, kaVocab, ka); // le2
    fetchOneCategory(vocabArray, hiVocab, hi);
    fetchOneCategory(vocabArray, enVocab, en);

    // Call start() after the data is loaded (sn1.MD)
    start();
  })
  .catch(error => console.error('Error loading vocab JSON file:', error));


function displayQuestion(array_in, random, qChoice) {
  let i = randomNo(0, (array_in.length-1));

  if (random) {
    displayContent(sectionQuestion, array_in[i][qChoice]);
  }
  else {
    displayContent(sectionQuestion, array_in[qNo][qChoice]);
    qNo++;
  }
}

function displayAnswers(aChoice, choiceNum) {
  let selectedArray = vocabMapping[aChoice];
  
  //log(selectedArray, "selectedArray: ");
  //log(selectedArray.length, "selectedArray length: ");

  //console.log("Type of selectedArray: ", typeof selectedArray);
  //console.log("Is selectedArray an array?: ", Array.isArray(selectedArray));
  
  if (!selectedArray) {
    console.error(`No vocab array found for choice: ${aChoice}`);
    return;
  }

  if (selectedArray.length === 0) {
    console.error(`The vocab array is empty for choice: ${aChoice}`);
    return;
  }

  choiceNum = Math.min(choiceNum, selectedArray.length);

  for (let loopI = 0; loopI < choiceNum; loopI++) {
    let randomIndex = randomNo(0, (selectedArray.length-1));
    let answerLocalArr = [selectedArray[randomIndex]];
    log(answerLocalArr, `Answer${loopI}`);
  }
}

function checkDuplications() {

}

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
  log(target);
}