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

function buildNodeObj({ parent, child, content, className = "", idName = "", eventFunction = "" }) {
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ').filter(c => c.trim() !== ''); // 1) split with ' '; 2) remove excess spaces; 3) store if only it is not empty.
  console.log("className after processing: ", className);

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array (only non-empty)
   if (className.length > 0) {
    className.forEach(classItem => {
      if (classItem.trim()) { // Ensure it's not empty
        newChild.classList.add(classItem);
      }
    });
  }

    newChild.id = `${idName}-${contentIndex}`;

    // Add an event listener (if any)
    if (eventFunction) {
      newChild.addEventListener("click", eventFunction);
    }
    
    // Append the new element to the parent
    if (parent instanceof HTMLElement) {
      parent.appendChild(newChild);
    }
  });
  
}

function buildNode(parent, child, content, className, idName, eventFunction) { // [sn2]
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ');

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array
    className.forEach(classItem => {
      newChild.classList.add(classItem);
    });

    // Add an ID by combining `idName` and content's index
    newChild.id = `${idName}-${contentIndex}`;

    // And an event listern (if any)
    if (eventFunction){
      newChild.addEventListener("click", eventFunction);
    }
    parent.appendChild(newChild);
  });
}

function buildAnswers() {
  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);

  if (flashYesNo) { // if it is a flash card game
    buildNode(sectionAnswer, "div", "Show Answer", "answer-btn", "answer-btn", showAnswer); // (arg1, arg2, arg3, class name, id)
  } else { // if it is a multiple choice game
    buildNode(sectionAnswer, "div", ansArray , "answer-btn", "answer-btn", multipleChoice);
  }
}

function showAnswer(){
  // Remove exiting buttons
  const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
  answerButtons.forEach(button => {
    button.remove(); 
  });

  // Show correct answer
  buildNode(sectionAnswer, "div", correctAns, "answer-message", "answer-message");

  // Show buttons
  if (flashYesNo) { // if it is a flash card game
    buildNode(sectionAnswer, "div", "Did you get it right?", "answer-message", "answer-message");
    buildNode(sectionAnswer, "div", ["Yes", "No"], "answer-btn", "choice-btn", storeOrContinue);
  } else {
    buildNode(sectionAnswer, "div", "Next", "answer-message", "next-btn","");
  }
}

function start() {
  //newQuestion(); 
}