const sectionQuestion = document.querySelector("#section-question");
const sectionAnswer = document.querySelector("#section-answer");
let vocabArray = [];

let randomInput = true;
let qChoiceInput = "hi";
let aChoiceInput = "en";
let flashYesNo = "false";
let noOfAnswers = 4;

let ka = "ka";
let hi = "hi";
let en = "en"

let enLang = "en";
let jpLang = "jp";

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
  label ? console.log(`${label}: ${variable}`) : console.log(`${variable}: ${variable}`);
}

function start() {
  displayQuestion(vocabArray, randomYesNo, qChoice);
  displayAnswers(aChoiceInput, noOfAnswers);
  //fetchOneCategory(vocabArray, kaVocab, ka);
  //fetchOneCategory(vocabArray, hiVocab, hi);
  //fetchOneCategory(vocabArray, enVocab, en);
  //displayContent(sectionQuestion, "dynamic question");
  assignLanguage(sectionQuestion, enLang);
  assignLanguage(sectionAnswer, jpLang);
}