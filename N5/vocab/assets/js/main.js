randomInput = true;
qChoiceInput = "hi";
aChoiceInput = "en";
flashYesNo = "false";
noOfAnswers = 4;

let randomYesNo = randomInput;
let qChoice = qChoiceInput;

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