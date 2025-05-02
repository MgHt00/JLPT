export function questionManager(globals, utilsManager, statusFns, vocabFns) {
  const { appState, appData, selectors } = globals;
  const { helpers, domUtils } = utilsManager;
  const { increaseQuestionCount, printQuestionStatus, updateCumulativeAverage } = statusFns;
  const { removeSpecifiedQuestion, saveState } = vocabFns

  let _questionObj = {};
  let _renderAnswers, _noMoreQuestion;

  function setQuestionManagerCallbacks(renderAnswers, noMoreQuestion) {
    _renderAnswers = renderAnswers;
    _noMoreQuestion = noMoreQuestion;
  }

  // to start a new question
  function newQuestion() {
    console.groupCollapsed("---questionManager() - newQuestion()---");

    // Initialize newQuestion's property, mode, if it’s not defined yet ...
    // ... by initializing here, it will be easier to debug
    if (newQuestion.mode === undefined) {
      newQuestion.mode = "fresh";
      console.info("newQuestion.mode initialized.");
    }

    domUtils.clearScreen([selectors.sectionQuestion, selectors.sectionMessage, selectors.sectionAnswer]);

    printQuestionStatus() // show current status

    setTimeout(() => {
      if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
        //console.log("vocabArray ", appData.vocabArray);
  
        do {
          _questionObj = fetchOneQuestion(); // Fetch a new question
        } while (!isThereAnAnswer(_questionObj)); // Keep fetching until a valid answer is found
  
        // Once a valid question is found, store the correct answer
        appState.correctAns = _questionObj[selectors.aChoice.value].toLowerCase().trim(); // Store correct answer
        
        increaseQuestionCount(); // increse question count for status bar  
        //console.log("ramdomYesNo: ", appState.randomYesNo, "| _questionObj: ", _questionObj, "| appState.correctAns: ", appState.correctAns);
        
        domUtils.buildNode({ 
          parent: selectors.sectionQuestion, 
          child: 'div', 
          content: _questionObj[appState.qChoiceInput],
        });
         _renderAnswers();  
      } else { // if there is no more question left to show
         _noMoreQuestion();
      }      
    }, 350); // Matches the transition duration

    saveState(); // Save the current state to localStorage
    console.groupEnd();
  }

  // to set program's question mode (fresh or stored)
  function setQuestionMode(m) {
    console.groupCollapsed("questionManager() - setQuestionMode()");

    const validModes = ["fresh", "stored"];
    if(!validModes.includes(m)) {
      newQuestion.mode = "fresh"; // default to `fresh`
      console.warn("Invalid mode is passed. Defaulting to `fresh`.");
    } else {
      newQuestion.mode = m;
      console.info("Question mode: ", newQuestion.mode);
    }

    console.groupEnd();
  }

  // to fetch one question(obj) from the vocabArray
  function fetchOneQuestion() {
    //console.groupCollapsed("questionManager() - fetchOneQuestion()");

    let selectedQuestionObj = {}; // to store the question obj temporarily
    if (typeof fetchOneQuestion.index === 'undefined') {
      fetchOneQuestion.index = 0;
    }

    if (appState.randomYesNo) {
      fetchOneQuestion.index = helpers.randomNo(0, (appData.vocabArray.length - 1));
    } else {
      fetchOneQuestion.index = 0;
    }
    selectedQuestionObj = appData.vocabArray[fetchOneQuestion.index];
    return selectedQuestionObj;
  }

  // to remove shown question and carry on
  function finalizeQuestionAndProceed(state) {
    //console.groupCollapsed("questionManager() - finalizeQuestionAndProceed()");
    
    updateCumulativeAverage(state);

    if (appState.flashYesNo) { // flashcard mode
      removeSpecifiedQuestion(fetchOneQuestion.index);
      newQuestion();
    }
    else { // multiple-choice mode
      if (state) { // if correct answer is clicked
        removeSpecifiedQuestion(fetchOneQuestion.index);
        newQuestion();
      }
    }
    console.groupEnd();
  }

  // to check whether the correct answer is empty;
  // necessary for the situation when the user's answer choice is Kanji and there is not Kanji equalivant answer
  function isThereAnAnswer(_questionObj) {
    let correctAnswer = _questionObj[selectors.aChoice.value];
    if(correctAnswer === "") {
      return false;
    } else return true;
  }

  function readQuestionObj() {return _questionObj;}
  function readQuestionMode() {return newQuestion.mode;}

  return {
    setQuestionManagerCallbacks,
    newQuestion,
    finalizeQuestionAndProceed,
    setQuestionMode,
    readQuestionObj,
    readQuestionMode,
  }
}
