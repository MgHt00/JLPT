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

function multipleChoice(event) {
  const btnText = event.currentTarget.textContent;
  if (correctAns === btnText) {
    console.log("bingo!");
    //console.log(event.currentTarget.id); 
    clearScreen([sectionQuestion, sectionAnswer]);

    buildNode(sectionAnswer, "div", "Correct!", "answer-message", "answer-message");
    buildNode(sectionAnswer, "div", "Next", "answer-btn", "choice-btn", newQuestion);

  } else {
    console.log("keep going");
  }
}

function clearScreen(elements) {
  // Ensure `elements` is treated as an array
  elements = Array.isArray(elements) ? elements : [elements];

  elements.forEach(element => {
    if (element) {
      element.innerHTML = ""; // Clear the content of the element
    }
  });
}

function newQuestion() {
  clearScreen([sectionQuestion, sectionAnswer]);

  questionObj = prepareQuestion(vocabArray, randomYesNo);
  correctAns = questionObj[aChoiceInput]; // store correct answer
  
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  buildAnswers();
}

function buildNodeObj({parent, child, content, className = "", idName = "", eventFunction =""}) {
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ');

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array (only non-empty)
    className.forEach(classItem => {
      if (classItem.trim()) { // Ensure it's not empty
        newChild.classList.add(classItem);
      }
    });

    // Add an ID by combining `idName` and content's index
    newChild.id = `${idName}-${contentIndex}`;

    // And an event listern (if any)
    if (eventFunction && (eventFunction !== "")){
      newChild.addEventListener("click", eventFunction);
    }
    parent.appendChild(newChild);
  });
}

function start() {
  //newQuestion(); 
}