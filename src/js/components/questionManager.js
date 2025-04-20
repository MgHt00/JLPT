export function questionManager(globals, utilsManager, answerMgr, vocabMgr) {
  const { appState, appData, selectors } = globals;
  const { helpers, domUtils } = utilsManager;

  let questionObj = {};

  let _renderAnswers, _noMoreQuestion, _removeSpecifiedQuestion, _saveState;
  let _increaseQuestionCount, _printQuestionStatus, _updateCumulativeAverage;

  function setQuestionManagerCallbacks(renderAnswers, noMoreQuestion, increaseQuestionCount, printQuestionStatus, updateCumulativeAverage, removeSpecifiedQuestion, saveState) {
    _renderAnswers = renderAnswers;
    _noMoreQuestion = noMoreQuestion;
    _increaseQuestionCount = increaseQuestionCount;
    _printQuestionStatus = printQuestionStatus;
    _updateCumulativeAverage = updateCumulativeAverage;
    _removeSpecifiedQuestion = removeSpecifiedQuestion;
    _saveState = saveState;
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

    _printQuestionStatus() // show current status

    setTimeout(() => {
      if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
        //console.log("vocabArray ", appData.vocabArray);
  
        do {
          questionObj = fetchOneQuestion(); // Fetch a new question
        } while (!isThereAnAnswer(questionObj)); // Keep fetching until a valid answer is found
  
        // Once a valid question is found, store the correct answer
        appState.correctAns = questionObj[selectors.aChoice.value].toLowerCase().trim(); // Store correct answer
        
        _increaseQuestionCount(); // increse question count for status bar  
        //console.log("ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
        
        domUtils.buildNode({ 
          parent: selectors.sectionQuestion, 
          child: 'div', 
          content: questionObj[appState.qChoiceInput],
        });
         _renderAnswers();  
      } else { // if there is no more question left to show
         _noMoreQuestion();
      }      
    }, 350); // Matches the transition duration

    _saveState(); // Save the current state to localStorage
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
    
    _updateCumulativeAverage(state);

    if (appState.flashYesNo) { // flashcard mode
      _removeSpecifiedQuestion(fetchOneQuestion.index);
      newQuestion();
    }
    else { // multiple-choice mode
      if (state) { // if correct answer is clicked
        _removeSpecifiedQuestion(fetchOneQuestion.index);
        newQuestion();
      }
    }
    console.groupEnd();
  }

  // to check whether the correct answer is empty;
  // necessary for the situation when the user's answer choice is Kanji and there is not Kanji equalivant answer
  function isThereAnAnswer(questionObj) {
    let correctAnswer = questionObj[selectors.aChoice.value];
    if(correctAnswer === "") {
      return false;
    } else return true;
  }

  return {
    setQuestionManagerCallbacks,
    newQuestion,
    finalizeQuestionAndProceed,
    setQuestionMode,
    get readQuestionObj() {return questionObj;},
    get readQuestionMode() {return newQuestion.mode},
  }
}
