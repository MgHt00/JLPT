randomYesNo = true;
qChoiceInput = "hi";
aChoiceInput = "en";
flashYesNo = "false";
noOfAnswers = 4;

let correctAnswer;

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

function start() {
  correctAnswer = displayQuestion(vocabArray, randomYesNo, qChoiceInput, aChoiceInput);
  displayAnswers(aChoiceInput, noOfAnswers, correctAnswer);
  assignLanguage(sectionQuestion, enLang);
  assignLanguage(sectionAnswer, jpLang);
}