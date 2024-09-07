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

function buildNodeObj({parent, child, content, className = "", idName = "", eventFunction =""}) {
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ');

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    newChild.textContent = contentItem;

    // Add all classes from className array
    if (className.length > 0) { // if the className array contains one or more items
      className.forEach(classItem => {
        newChild.classList.add(classItem);
      });
    }

    // Add an ID by combining `idName` and content's index
    newChild.id = `${idName}-${contentIndex}`;

    // And an event listern (if any)
    if (eventFunction && (eventFunction !== "")){
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