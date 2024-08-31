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

/*function buildDOM(parent, child, content, className) {
  if (Array.isArray(content)) { // [sn2]
    // Handle the case where content is an array
    content.forEach(contentItem => {
      let newChild = document.createElement(child)
      newChild.textContent = contentItem;
      
      if (Array.isArray(className)) {
        // Handle the case where className is an array
        className.forEach(classItem => {
          newChild.classList.add(classItem);
        });
      } else {
        newChild.classList.add(className);
      }
      parent.appendChild(newChild);
    });
  } else {
    // Handle the case where content is not an array
    let newChild = document.createElement(child);
    newChild.textContent = content;
    parent.appendChild(newChild);
  }
}*/

function buildDOM(parent, child, content, className) { // [sn2]
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ');

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach(contentItem => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array
    className.forEach(classItem => {
      newChild.classList.add(classItem);
    });

    parent.appendChild(newChild);
  });
}



function start() {
  assignLanguage(sectionQuestion, enLang);
  assignLanguage(sectionAnswer, jpLang);

  questionObj = prepareQuestion(vocabArray, randomYesNo);
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);
  //displayContent(sectionAnswer, ansArray);

  //checkTotalAns(ansArray, noOfAnswers);

  buildDOM(sectionAnswer, "div", ansArray, "dummy-class-1 dummy-class-2");
}