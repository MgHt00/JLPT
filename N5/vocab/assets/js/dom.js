function buildDOM(parent, child, content, className, idName, eventFunction) { // [sn2]
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
    buildDOM(sectionAnswer, "div", "Show Answer", "answer-btn", "answer-btn", showAnswer); // (arg1, arg2, arg3, class name, id)
  } else { // if it is a multiple choice game
    buildDOM(sectionAnswer, "div", ansArray , "answer-btn", "answer-btn", "");
  }
}

function showAnswer(){
  // Remove exiting buttons
  const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
  answerButtons.forEach(button => {
    button.remove(); 
  });

  // Show correct answer
  buildDOM(sectionAnswer, "div", correctAns, "answer-message", "answer-message");

  // Show buttons
  if (flashYesNo) { // if it is a flash card game
    buildDOM(sectionAnswer, "div", "Did you get it right?", "answer-message", "answer-message");
    buildDOM(sectionAnswer, "div", ["Yes", "No"], "answer-btn", "choice-btn", storeOrContinue);
  } else {
    buildDOM(sectionAnswer, "div", "Next", "answer-message", "next-btn","");
  }
}
