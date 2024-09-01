function loadDefaults() {
  randomYesNo = true;
  qChoiceInput = "hi";
  aChoiceInput = "en";
  flashYesNo = false;
  noOfAnswers = 4;

  qChoiceInput === "hi" ? assignLanguage(sectionQuestion, jpLang) : assignLanguage(sectionQuestion, enLang);
  aChoiceInput === "hi" ? assignLanguage(sectionAnswer, jpLang) : assignLanguage(sectionAnswer, enLang);
}

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


function storeOrContinue(event) { // sn4
  const btnID = event.currentTarget.id;
  if (btnID === "choice-btn-0") {
    newQuestion();
  } else if (btnID === "choice-btn-1") {
    storeToPractice(questionObj);
    newQuestion();
  }
}

function clearScreen() {
  sectionQuestion.innerHTML = "";
  sectionAnswer.innerHTML = "";
}

function newQuestion() {
  clearScreen();

  questionObj = prepareQuestion(vocabArray, randomYesNo);
  correctAns = questionObj[aChoiceInput]; // store correct answer
  
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  buildAnswers();
}

function start() {
  console.log("start() is called.");
  loadDefaults();
  newQuestion(); 
}