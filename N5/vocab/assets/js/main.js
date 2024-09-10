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
  console.log(questionObj);
  correctAns = questionObj[aChoiceInput]; // store correct answer
  
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  buildAnswers();
}

function buildNode({parent, child, content, childValues = [], className = "", idName = "", eventFunction = "" }) {
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ').filter(c => c.trim() !== ''); // 1) split with ' '; 2) remove excess spaces; 3) store if only it is not empty.

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  // Ensure value is always treated as an array
  childValues = Array.isArray(childValues) ? childValues : [childValues]
  console.log(childValues);

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Assign value if childValues is provided and has enough entries
    if (childValues[contentIndex]) {
      newChild.value = childValues[contentIndex];
    }

    // Add all classes from className array (only non-empty)
   if (className.length > 0) {
    className.forEach(classItem => {
        newChild.classList.add(classItem);
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

function clearNode({ parent, children = [] }) {
  if (children.length > 0) {
    children.forEach(child => {
      if (parent.contains(child)) { // Ensure the child exists within the parent before removing
        parent.removeChild(child);
      }
    });
  } else {
    parent.innerHTML = ''; // Clears all children of the parent
  }
}

function checkNode({idName}) {
  return document.querySelectorAll(`[id^=${idName}]`).length > 0;
}

/*
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
*/

function flipNodeState(...nodes) { //[sn10]
  // Iterate over the nodes and toggle the disabled state
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.disabled = !node.disabled;
      toggleClass("disabled", node);
    }
  });
}


function toggleClass(className = "", ...nodes) { // [sn15]
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.toggle(className); // Toggle the class
    }
  });
}

function buildAnswers() {
  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);

  if (flashYesNo) { // if it is a flash card game
    //buildNode(sectionAnswer, "div", "Show Answer", "answer-btn", "answer-btn", showAnswer); // (arg1, arg2, arg3, class name, id)
    buildNode({parent: sectionAnswer, child: 'div', content: 'Show Answer', className: 'answer-btn', eventFunction: showAnswer});
  } else { // if it is a multiple choice game
    //buildNode(sectionAnswer, "div", ansArray , "answer-btn", "answer-btn", multipleChoice);
    buildNode({parent: sectionAnswer, child: 'div', content: ansArray, className: 'answer-btn', eventFunction: multipleChoice});
  }
}

function showAnswer(){
  console.log("inside showAnswer()");
  // Remove exiting buttons
  const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
  answerButtons.forEach(button => {
    button.remove(); 
  });

  // Show correct answer
  buildNode({parent: sectionAnswer, child: 'div', content: correctAns, className: 'answer-message', idName: 'answer-message'});

  // Show buttons
  if (flashYesNo) { // if it is a flash card game
    buildNode({parent: sectionAnswer, child: 'div', content: 'Did you get it right?', className: 'answer-message', idName: 'answer-message'});
    buildNode({parent: sectionAnswer, child: 'div', content: ['Yes', 'No'], className: 'answer-btn', idName: 'choice-btn', eventFunction: storeOrContinue});
  } else {
    buildNode({parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-message', idName: 'next-btn'});
  }
}