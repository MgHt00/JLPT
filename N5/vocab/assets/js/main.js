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

function buildDOM(parent, child, content, className, idName) { // [sn2]
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ');

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array
    className.forEach((classItem, arrIndex) => {
      newChild.classList.add(classItem);
    });

    // Add an ID by combining `idName` and content's index
    newChild.id = `${idName}-${contentIndex}`;

    parent.appendChild(newChild);
  });
}

function start() {
  assignLanguage(sectionQuestion, enLang);
  assignLanguage(sectionAnswer, jpLang);

  questionObj = prepareQuestion(vocabArray, randomYesNo);
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);
  //if (!flashYesNo) {
    buildDOM(sectionAnswer, "div", ansArray, "answer-btn", "answer-btn"); // (arg1, arg2, arg3, class name, id)
  //}
}