randomYesNo = true;
qChoiceInput = "hi";
aChoiceInput = "en";
flashYesNo = "false";
noOfAnswers = 4;

let questionObj = {};
let ansArray = [];

function assignLanguage(sectionBlock, lang) {
  sectionBlock.setAttribute("lang", lang);
  sectionBlock.classList.add(lang);
}

function displayContent(sectionBlock, content) {
  let divBlock = document.createElement("div");
  divBlock.textContent = content;
  sectionBlock.appendChild(divBlock);
}

function randomNo(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(variable, label) {
  label ? console.log(`${label}: ${variable}`) : console.log(`${variable}`);
}

function buildDOM(parent, child, content) {
  
}

function start() {
  assignLanguage(sectionQuestion, enLang);
  assignLanguage(sectionAnswer, jpLang);

  //questionObj = prepareQuestion(vocabArray, randomYesNo, qChoiceInput, aChoiceInput);
  questionObj = prepareQuestion(vocabArray, randomYesNo);
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);
  displayContent(sectionAnswer, ansArray);

  //checkTotalAns(ansArray, noOfAnswers);
}