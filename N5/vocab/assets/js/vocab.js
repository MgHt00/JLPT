const questionMgr = questionManager();
const vocabMgr =  vocabManager();

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function questionManager() {
  let questionObj = {};
  let qNo = 0;

  function newQuestion() {
    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

    if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
      questionObj = prepareQuestion();
      appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer
      //console.log("inside newQuestion(); ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
      
      buildNode({ 
        parent: sectionQuestion, 
        child: 'div', 
        content: questionObj[appState.qChoiceInput],
      });
      AnswerManager().buildAnswers();  
    } else {
      buildNode({ 
        parent: sectionMessage, 
        child: 'div', 
        content: 'You have completed all the vocabs.  Well done!', 
        className: 'vocabs-complete', 
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Lets Restart!', 
        className: 'answer-btn', 
        idName: 'answer-btn', 
        eventFunction: listeners().debouncedMoveForm,
      });
    }
  }

  function prepareQuestion() {
    let i = randomNo(0, (appData.vocabArray.length - 1));
    let selectedQuestionObj = {}; // to store the question obj temporarily

    if (appState.randomYesNo) {
      selectedQuestionObj = appData.vocabArray[i];
      vocabMgr.removeQuestion(i); // remove shown quesion from vocabArray
    }
    else {
      selectedQuestionObj = appData.vocabArray[qNo];
      qNo++;
    }
    return selectedQuestionObj;
  }


  return {
    newQuestion,
    get readQuestionObj() {return questionObj;},
  }
}


function AnswerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  function buildAnswers() {
    ansArray = prepareAnswers();
    //console.log("Inside buildAnswers(); ansArray: ", ansArray, "Inside buildAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Show Answer', 
        className: 'answer-btn', 
        idName: 'answer-btn', 
        eventFunction: showAnswer 
      });
    } else { // if it is a multiple choice game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ansArray, 
        className: 'answer-btn', 
        eventFunction: multipleChoice 
      });
    }
  }

  function prepareAnswers() {
    //console.log("Inside prepareAnswers(); selectors.aChoice: ", selectors.aChoice, "| noOfChoice: ", noOfChoice, " | appState.correctAns: ", appState.correctAns);
    let selectedArray = vocabMapping[selectors.aChoice.value];
    let tempAnsArray = [];

    tempAnsArray[0] = appState.correctAns; // add correct answer in index. 0

    if (!selectedArray) {
      console.error(`No vocab array found for choice: ${selectors.aChoice.value}`);
      return;
    }

    if (selectedArray.length === 0) {
      console.error(`The vocab array is empty for choice: ${selectors.aChoice.value}`);
      return;
    }
    let choiceInput = selectors.readNoOfAns;
    noOfChoice = Math.min(choiceInput, selectedArray.length);

    for (let i = 1; i < noOfChoice; i++) {
      let randomIndex;
      let randomWord;

      do { // [le3] Loop to ensure no duplicates are added 
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
    buildNode({ 
      parent: sectionAnswer, 
      child: 'div', 
      content: appState.correctAns, 
      className: 'answer-message', 
      idName: 'answer-message' 
    });

    // Show buttons
    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ 
        parent: sectionMessage, 
        child: 'div', 
        content: 'Did you get it right?', 
        className: 'answer-message', 
        idName: 'answer-message' 
      });
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ['Yes', 'No'], 
        className: 'answer-btn', 
        idName: 'choice-btn', 
        eventFunction: storeOrContinue 
      });
    } else {
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'answer-message', 
        idName: 'next-btn' });
    }
  }

  function multipleChoice(event) {
    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Correct!', 
        className: 'answer-message', 
        idName: 'answer-message' 
      });
      buildNode({ parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'answer-btn', 
        idName: 'choice-btn', 
        eventFunction: questionMgr.newQuestion 
      });

    } else {
      if (sectionMessage.textContent !== 'Keep Trying') { // if worng message is not shown already.
        buildNode({ 
          parent: sectionMessage, 
          child: 'div', 
          content: 'Keep Trying', 
          className: 'wrong-answer' 
        });
      }
    }
  }

  function storeOrContinue(event) { // sn4
    const btnID = event.currentTarget.id;
    //const questionInstance = questionManager();

    if (btnID === "choice-btn-0") {
      questionMgr.newQuestion();
    } else if (btnID === "choice-btn-1") {
      
      vocabMgr.storeToPractice(questionMgr);
      //practiceAgain(questionInstance);
      questionMgr.newQuestion();
    }
  }

  //let rePractice = [];

  function practiceAgain() {
    //const questionInstance = questionMgr;
    console.log("Inside showQuestionAgain(); questionObj: ", questionMgr.readQuestionObj);
    rePractice.push(questionMgr.readQuestionObj);
  }

  return {
    buildAnswers,
  }
}

function vocabManager() {
  
  function removeQuestion(i) {
    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
      console.log(`currentQIndex ${i} is removed. vocabArray.length: ${appData.vocabArray.length}`);
    } else {
      console.log(`vocabArray.length: ${appData.vocabArray.length}; reach the end.`);
    }
  }

  function storeToPractice(questionInstance) { // [sn5]
    console.log("Entering storeToPractice()");
    let incorrectSets = loadLocalStorage();
    
    console.log(questionInstance.readQuestionObj);
    // [sn6] Check if the object already exists in the array
    let exists = incorrectSets.some(answer =>
      answer.ka === questionInstance.readQuestionObj.ka &&
      answer.hi === questionInstance.readQuestionObj.hi &&
      answer.en === questionInstance.readQuestionObj.en
    );
  
    // If it doesn't exist, add it to the array
    if (!exists) {
      incorrectSets.push(questionInstance.readQuestionObj);
      localStorage.setItem("toPractice", JSON.stringify(incorrectSets));
      //temp
      //loadLocalStorage();
    }
  }
  
  function loadLocalStorage() {
    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    console.log(storedObjects);
    return storedObjects;
  }
  
  function clearIncorrectAnswers() {
    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loader().loadMemoryData();
  }

  return {
    removeQuestion,
    storeToPractice,
    clearIncorrectAnswers,
    loadLocalStorage,
    get readStoredLength() { 
      let storedLength = loadLocalStorage();
      return storedLength.length;
    },
    //clearIncorrectAnswers,
    //get readQuestionIndex() { return currentQIndex; },
  }
}