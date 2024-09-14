function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function questionManager() {
  let questionObj = {};
  let ansArray = [];
  let qNo = 0;

  function newQuestion() {
    //newQuestion.counter = 3; // Initialize newQuestion() own property. Check the book p. 202 for more detail

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    //questionObj = prepareQuestion(appData.vocabArray, appState.randomYesNo);
    questionObj = prepareQuestion();
    appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer

    //console.log("inside newQuestion(); ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);

    buildNode({ parent: sectionQuestion, child: 'div', content: questionObj[appState.qChoiceInput] });
    //AnswerManager().buildAnswers(questionObj);
    AnswerManager().buildAnswers();
  }

  /*
  function prepareQuestion(arr, random) {
    console.log("Inside prepareQuestion()");
    let i = randomNo(0, (arr.length - 1));
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
  */
  function prepareQuestion() {
    let i = randomNo(0, (appData.vocabArray.length - 1));
    let selectedQuestionObj = {}; // to store the question obj temporarily

    if (appState.randomYesNo) {
      selectedQuestionObj = appData.vocabArray[i];
    }
    else {
      selectedQuestionObj = appData.vocabArray[qNo];
      qNo++;
    }
    return selectedQuestionObj;
  }

  get readQuestionObj() {
    return questionObj;
  }

  return {
    newQuestion,
  }
}


function AnswerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  //function buildAnswers(questionObj) {
  function buildAnswers() {
    //ansArray = prepareAnswers(questionObj);
    ansArray = prepareAnswers();
    //console.log("Inside buildAnswers(); ansArray: ", ansArray, "Inside buildAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ parent: sectionAnswer, child: 'div', content: 'Show Answer', className: 'answer-btn', idName: 'answer-btn', eventFunction: showAnswer });
    } else { // if it is a multiple choice game
      buildNode({ parent: sectionAnswer, child: 'div', content: ansArray, className: 'answer-btn', eventFunction: multipleChoice });
    }
  }

  function prepareAnswers() {
    //console.log("Inside prepareAnswers(); selectors.aChoice: ", selectors.aChoice, "| noOfChoice: ", noOfChoice, " | appState.correctAns: ", appState.correctAns);
    let selectedArray = vocabMapping[selectors.aChoice.value];

    let tempAnsArray = [];

    //tempAnsArray[0] = appState.correctAns[selectors.aChoice.value]; // add correct answer in index. 0
    tempAnsArray[0] = appState.correctAns; // add correct answer in index. 0
    console.log("tempAnsArray[0]: ",tempAnsArray[0]);

    if (!selectedArray) {
      console.error(`No vocab array found for choice: ${selectors.aChoice.value}`);
      return;
    }

    if (selectedArray.length === 0) {
      console.error(`The vocab array is empty for choice: ${selectors.aChoice.value}`);
      return;
    }
    let choiceInput = selectors.readNoOfAns;
    //console.log("choiceInput: ", choiceInput);
    //noOfChoice = Math.min(selectors.readNoOfAns.value, selectedArray.length);
    noOfChoice = Math.min(choiceInput, selectedArray.length);

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

  function showAnswer() {
    // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      button.remove();
    });

    // Show correct answer
    buildNode({ parent: sectionAnswer, child: 'div', content: appState.correctAns, className: 'answer-message', idName: 'answer-message' });

    // Show buttons
    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ parent: sectionMessage, child: 'div', content: 'Did you get it right?', className: 'answer-message', idName: 'answer-message' });
      buildNode({ parent: sectionAnswer, child: 'div', content: ['Yes', 'No'], className: 'answer-btn', idName: 'choice-btn', eventFunction: storeOrContinue });
    } else {
      buildNode({ parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-message', idName: 'next-btn' });
    }
  }

  function multipleChoice(event) {
    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

      buildNode({ parent: sectionAnswer, child: 'div', content: 'Correct!', className: 'answer-message', idName: 'answer-message' });
      buildNode({ parent: sectionAnswer, child: 'div', content: 'Next', className: 'answer-btn', idName: 'choice-btn', eventFunction: questionManager().newQuestion });

    } else {
      if (sectionMessage.textContent !== 'Keep Trying') { // if worng message is not shown already.
        buildNode({ parent: sectionMessage, child: 'div', content: 'Keep Trying', className: 'wrong-answer' });
      }
    }
  }

  function storeOrContinue(event) { // sn4
    const btnID = event.currentTarget.id;
    if (btnID === "choice-btn-0") {
      newQuestion();
    } else if (btnID === "choice-btn-1") {
      storeToPractice(questionObj);
      practiceAgain(questionObj);
      questionManager().newQuestion();
    }
  }

  let rePractice = [];

  function practiceAgain() {
    console.log("Inside showQuestionAgain(); questionObj: ", questionObj);
    rePractice.push(questionObj);
  }

  return {
    buildAnswers,
    showAnswer,
    multipleChoice,
    storeOrContinue,
  }
}