function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function newQuestion() {
  let questionObj = {};
  let ansArray = [];
  let qNo = 0;

  newQuestion.counter = 3; // Initialize newQuestion() own property. Check the book p. 202 for more detail

  clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
  questionObj = prepareQuestion(vocabArray, randomYesNo);
  correctAns = questionObj[aChoiceInput]; // store correct answer

  //console.log("inside newQuestion(); ramdomYesNo: ", randomYesNo, "| questionObj: ", questionObj, "| correctAns: ", correctAns);
  
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

  buildNode({parent: sectionQuestion, child: 'div', content: questionObj[qChoiceInput]});
  buildAnswers(questionObj);
}

function buildAnswers(questionObj) {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };
  
  ansArray = prepareAnswers(aChoiceInput, noOfAnswers, questionObj);
  //console.log("Inside buildAnswers(); ansArray: ", ansArray, "Inside buildAnswers(); flashYesNo: ", flashYesNo);

  if (flashYesNo) { // if it is a flash card game
    buildNode({parent: sectionAnswer, child: 'div', content: 'Show Answer', className: 'answer-btn', idName: 'answer-btn', eventFunction: showAnswer});
  } else { // if it is a multiple choice game
    buildNode({parent: sectionAnswer, child: 'div', content: ansArray, className: 'answer-btn', eventFunction: multipleChoice});
  }

  function prepareAnswers(aChoice, noOfChoice, correctAns) {
    //console.log("Inside prepareAnswers(); aChoice: ", aChoice, "| noOfChoice: ", noOfChoice, " | correctAns: ", correctAns);
  
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

  function showAnswer(){
    // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      button.remove(); 
    });
  
    // Show correct answer
    buildNode({parent: sectionAnswer, child: 'div', content: correctAns, className: 'answer-message', idName: 'answer-message'});
  
    // Show buttons
    if (flashYesNo) { // if it is a flash card game
      buildNode({parent: sectionMessage, child: 'div', content: 'Did you get it right?', className: 'answer-message', idName: 'answer-message'});
      buildNode({parent: sectionAnswer, child: 'div', content: ['Yes', 'No'], className: 'answer-btn', idName: 'choice-btn', eventFunction: storeOrContinue});
    } else {
      buildNode({parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-message', idName: 'next-btn'});
    }
  }
  
  function multipleChoice(event) {
    const btnText = event.currentTarget.textContent;
    if (correctAns === btnText) {
      clearScreen([sectionQuestion, sectionAnswer]);
  
      buildNode({parent: sectionAnswer, child: 'div', content: 'Correct!', className: 'answer-message', idName: 'answer-message'});
      buildNode({parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-btn', idName: 'choice-btn', eventFunction: newQuestion});
  
    } else {
      buildNode({parent: sectionMessage, child: 'div', content: 'Keep Trying', className: 'wrong-answer'});
    }
  }
  
  function storeOrContinue(event) { // sn4
    const btnID = event.currentTarget.id;
    if (btnID === "choice-btn-0") {
      newQuestion();
    } else if (btnID === "choice-btn-1") {
      storeToPractice(questionObj);
      practiceAgain(questionObj);
      newQuestion();
    }
  } 
  
  let rePractice = [];
  
  function practiceAgain(questionObj) {
    console.log("Inside showQuestionAgain(); questionObj: ", questionObj);
    rePractice.push(questionObj);
  }
}