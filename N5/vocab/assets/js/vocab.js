function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function newQuestion() {
  clearScreen([sectionQuestion, sectionAnswer]);
  //console.log("Inside newQuestion(), ramdomYesNo: ", randomYesNo);
  questionObj = prepareQuestion(vocabArray, randomYesNo);
  console.log("inside newQuestion(), questionObj: ", questionObj);

  correctAns = questionObj[aChoiceInput]; // store correct answer
  
  displayContent(sectionQuestion, questionObj[qChoiceInput]);

  buildAnswers();
}

function prepareQuestion(arr, random) {
  let i = randomNo(0, (arr.length-1));
  let selectedQuestionObj = {}; // to store the question obj temporarily

  if (random) {
    selectedQuestionObj = arr[i];
  }
  else {
    selectedQuestionObj = arr[qNo];
    qNo++;
  }
  return selectedQuestionObj;
}

const vocabMapping = {
  ka: kaVocab,
  hi: hiVocab,
  en: enVocab
};

function prepareAnswers(aChoice, noOfChoice, correctAns) {
  console.log("Inside prepareAnswers(); aChoice: ", aChoice, "| noOfChoice: ", noOfChoice, " | correctAns: ", correctAns);

  let selectedArray = vocabMapping[aChoice];
  let tempAnsArray = [];

  tempAnsArray[0] = correctAns[aChoice]; // add correct answer in index. 0
  
  if (!selectedArray) {
    console.error(`No vocab array found for choice: ${aChoice}`);
    return;
  }

  if (selectedArray.length === 0) {
    console.error(`The vocab array is empty for choice: ${aChoice}`);
    return;
  }

  noOfChoice = Math.min(noOfChoice, selectedArray.length);

  for (let i = 1; i < noOfChoice; i++) {
    let randomIndex;
    let randomWord;

    // [le3] Loop to ensure no duplicates are added 
    do {
      randomIndex = randomNo(0, selectedArray.length - 1);
      randomWord = selectedArray[randomIndex];
    } while (tempAnsArray.includes(randomWord));

    tempAnsArray[i] = randomWord;
  }
  tempAnsArray = shuffleArray(tempAnsArray);
  return tempAnsArray;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function buildAnswers() {
  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);
  console.log("Inside buildAnswers(); ansArray: ", ansArray);
  console.log("Inside buildAnswers(); flashYesNo: ", flashYesNo);

  if (flashYesNo) { // if it is a flash card game
    buildNode({parent: sectionAnswer, child: 'div', content: 'Show Answer', className: 'answer-btn', eventFunction: showAnswer});
  } else { // if it is a multiple choice game
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

function multipleChoice(event) {
  const btnText = event.currentTarget.textContent;
  if (correctAns === btnText) {
    console.log("bingo!");
    //console.log(event.currentTarget.id); 
    clearScreen([sectionQuestion, sectionAnswer]);

    //buildNode(sectionAnswer, "div", "Correct!", "answer-message", "answer-message");
    buildNode({parent: sectionAnswer, child: 'div', content: 'Correct!', className: 'answer-message', idName: 'answer-message'});
    //buildNode(sectionAnswer, "div", "Next", "answer-btn", "choice-btn", newQuestion);
    buildNode({parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-btn', idName: 'choice-btn', eventFunction: newQuestion});

  } else {
    console.log("keep going");
  }
}
