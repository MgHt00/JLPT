const questionMgr = questionManager();
const vocabMgr =  vocabManager();
const answerMgr = answerManager();
const answerListenersMgr = answerListnerManager();

function questionManager() {
  let questionObj = {};

  // to start a new question
  function newQuestion() {
    console.groupCollapsed("---questionManager() - newQuestion()---");

    // Initialize newQuestion's property, mode, if it’s not defined yet ...
    // ... by initializing here, it will be easier to debug
    if (newQuestion.mode === undefined) {
      newQuestion.mode = "fresh";
      console.info("newQuestion.mode initialized.");
    }

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    //clearScreen([sectionQuestion, sectionAnswer]);

    statusInstance.printQuestionStatus() // show current status

    setTimeout(() => {
      if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
        //console.log("vocabArray ", appData.vocabArray);
  
        do {
          questionObj = fetchOneQuestion(); // Fetch a new question
        } while (!isThereAnAnswer(questionObj)); // Keep fetching until a valid answer is found
                                                 // (need to check for the situation where answer choice is Kanji and it is empty.)
  
        // Once a valid question is found, store the correct answer
        appState.correctAns = questionObj[selectors.aChoice.value]; // Store correct answer
        
        statusInstance.increaseQuestionCount(); // increse question count for status bar
        //statusInstance.printQuestionStatus() // show current status
  
        //console.log("ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
        
        buildNode({ 
          parent: sectionQuestion, 
          child: 'div', 
          content: questionObj[appState.qChoiceInput],
        });
        answerMgr.renderAnswers();  
      } else { // if there is no more question left to show
        answerMgr.noMoreQuestion();
      }      
    }, 350); // Matches the transition duration

    vocabMgr.saveState(); // Save the current state to localStorage
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
      fetchOneQuestion.index = randomNo(0, (appData.vocabArray.length - 1));
    } else {
      fetchOneQuestion.index = 0;
    }
    selectedQuestionObj = appData.vocabArray[fetchOneQuestion.index];
    return selectedQuestionObj;
  }

  // to remove shown question and carry on
  function finalizeQuestionAndProceed(state) {
    //console.groupCollapsed("questionManager() - finalizeQuestionAndProceed()");
    
    statusInstance.updateCumulativeAverage(state);

    if (appState.flashYesNo) { // flashcard mode
      vocabMgr.removeSpecifiedQuestion(fetchOneQuestion.index);
      newQuestion();
    }
    else { // multiple-choice mode
      if (state) { // if correct answer is clicked
        vocabMgr.removeSpecifiedQuestion(fetchOneQuestion.index);
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
    newQuestion,
    finalizeQuestionAndProceed,
    setQuestionMode,
    get readQuestionObj() {return questionObj;},
    get readQuestionMode() {return newQuestion.mode},
  }
}

function answerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  // to prepare all the answers
  function renderAnswers() {
    //console.groupCollapsed("answerManager() - renderAnswers()");

    ansArray = createAnswerArray();
    //console.log("Inside renderAnswers(); ansArray: ", ansArray, "Inside renderAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      assignLanguage(sectionAnswer, "en"); // if aChoice was set to Kanji or Hirigana, reset to "en"
      toggleClass('fade-out-light', sectionAnswer);
      setTimeout(() => {
        // Building "Flip" button container
        buildNode({ 
          parent: sectionAnswer, 
          child: 'div', 
          content: '', 
          className: ['answer-btn', 'check-flash-mode-answer'], 
          idName: 'answer-btn', 
          eventFunction: answerListenersMgr.handleFlashcardFlip
        });
        // Building "Flip" text
        buildNode({ 
          parent: document.querySelector("#answer-btn-0"), 
          child: 'div', 
          content: 'Flip', 
          className: '', 
          idName: 'answer-btn-text', 
          //eventFunction: handleFlashcardAnswer 
        });
        toggleClass('fade-out-light', sectionAnswer);
      }, 350);
      
    } else { // if it is a multiple choice game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ansArray, 
        className: 'answer-btn', 
        eventFunction: answerListenersMgr.handleMultipleChoiceAnswer 
      });
    }

    console.groupEnd();
  }

  // when there is no more question to shown.
  function noMoreQuestion() {
    console.groupCollapsed("noMoreQuestion()");

    // Initialize noMoreQuestion's property, ranOnce, if it’s not defined yet ...
    // ... by initializing here, it will be easier to debug
      if (noMoreQuestion.ranOnce === undefined) {
        noMoreQuestion.ranOnce = true;
        console.info("noMoreQuestion.ranOnce initialized.");
    }

    if (questionMgr.readQuestionMode === "fresh") { // if currently showing data from JSON
      questionMgr.setQuestionMode("stored");
      if (vocabMgr.readStoredLength <= 2) { 
        // If there is no store vocab in local storage
        // (less than 2 vocab in local storage will lead to infinite loop; so that it needs to be <=2)
        //questionMgr.readQuestionMode = "stored";
        completeAndRestart();
      } 
      else {
        //questionMgr.readQuestionMode = "stored";
        toLocalStorageYesNo();
      }
    }
    
    else if (questionMgr.readQuestionMode === "stored") { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
          completeAndRestart();
        }
        else if (vocabMgr.readStoredLength <= 2) { 
          // Even though local storage is zero when the program starts, 
          // check whether new words have been added during the program runtime.
          
          // Less than 2 vocab in local storage will lead to infinite loop; so the if statement is adjusted to <=2
          // console.info("too few vocabs in local storage");
          completeAndRestart();
        } 
        else {
          noMoreQuestion.ranOnce = true;
          toLocalStorageYesNo();
        }
    }

    console.groupEnd();
  }

  // To set the "ranOnce" property
  function setRanOnce(m) {
    console.groupCollapsed("setRanOnce()");
    
    const validModes = [true, false];
    if(!validModes.includes(m)) {
      noMoreQuestion.ranOnce = true; // default to `fresh`
      console.warn("Invalid mode is passed. Defaulting to `true`.");
    } else {
      noMoreQuestion.ranOnce = m;
      console.info("noMoreQuestion.ranOnce: ", noMoreQuestion.ranOnce);
    }

    console.groupEnd();
  }

  // to ask user whether they want to practice the vocabs from the local storage
  function toLocalStorageYesNo() {
    console.groupCollapsed("toLocalStorageYesNo()");
    removeClass('fade-hide', sectionMessage);
    removeClass('overlay-message', sectionMessage);

    buildNode({ 
        parent: sectionMessage, 
        child: 'div', 
        content: `There are ${vocabMgr.readStoredLength} words in mistake bank.  Would you like to practice those?`, 
        className: 'vocabs-complete', 
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Yes', 
        className: 'answer-btn', 
        idName: 'continue-yes', 
        eventFunction: answerMgr.handleContineToStoredData,
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'No', 
        className: 'answer-btn', 
        idName: 'continue-no', 
        eventFunction: answerMgr.handleContineToStoredData,
      });
      console.groupEnd();
  }

  // when all of the user selected vocabs are shown
  function completeAndRestart() {
    removeClass('fade-hide', sectionMessage);
    removeClass('overlay-message', sectionMessage);

    buildNode({ 
      parent: sectionMessage, 
      child: 'div', 
      content: 'You have completed all the vocabs.  Well done!', 
      className: 'vocabs-complete', 
    });

    buildNode({ 
      parent: sectionAnswer, 
      child: 'div', 
      content: 'Let\'s Restart!', 
      className: 'answer-btn', 
      idName: 'answer-btn', 
      eventFunction: loaderInstance.restart,
    });
  }

  // to create an array filled with answers including the correct one.
  function createAnswerArray() {
    //console.groupCollapsed("answerManager() - createAnswerArray()");

    let selectedArray = vocabMapping[selectors.aChoice.value];
    //console.info("selectedArray: ", selectedArray, "| selectedArray.legth: ", selectedArray.length);
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
    //let choiceInput = selectors.readNoOfAns;
    let choiceInput = appState.noOfAnswers;
    //console.info("choiceInput = appState.noOfAnswers: ", choiceInput);
    let noOfChoice = Math.min(choiceInput, selectedArray.length); // [le5]
    //console.info("noOfChoice: ", noOfChoice);

    /* Infinite loop check is moved inside loader() with errorInstance.showError() */

    for (let i = 1; i < noOfChoice; i++) {
      let randomIndex;
      let randomAnswer;

      do { // [le3] Loop to ensure no duplicates are added 
        randomIndex = randomNo(0, selectedArray.length - 1);
        randomAnswer = selectedArray[randomIndex];
      } while (tempAnsArray.includes(randomAnswer) || randomAnswer === ""); // Check for duplicates and empty

      tempAnsArray[i] = randomAnswer;
    }

    tempAnsArray = shuffleArray(tempAnsArray);
    console.groupEnd();
    return tempAnsArray;
  }

  //let rePractice = [];

  function practiceAgain() {
    //const questionInstance = questionMgr;
    console.log("Inside showQuestionAgain(); questionObj: ", questionMgr.readQuestionObj);
    rePractice.push(questionMgr.readQuestionObj);
  }

  return {
    vocabMapping,
    renderAnswers,
    noMoreQuestion,
    setRanOnce,
  }
}

function answerListnerManager() {
  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    //console.groupCollapsed("answerManager() - handleFlashcardFlip()");

    // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      toggleClass('fade-out-light', button);
      setTimeout(() => {
        button.remove();
      }, 350);
    });
    
    toggleClass('fade-out-light', sectionMessage, sectionAnswer);

    setTimeout(() => {
      // Show correct answer
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: appState.correctAns,
        className: 'flash-correct-answer',
        idName: 'correct-answer'
      });

      // Show Message
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: 'Did you get it right?',
        className: 'answer-message',
        idName: 'answer-message'
      });

      // Show `Yes` `No` buttons
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: ['Yes', 'No'],
        className: 'answer-btn',
        idName: 'choice-btn',
        eventFunction: answerListenersMgr.handleFlashCardYesNoAnswer
      });

      toggleClass('fade-out-light', sectionMessage, sectionAnswer);

    }, 350);

    console.groupEnd();
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen(sectionMessage);

      setTimeout(() => {
        toggleClass('fade-hide', sectionMessage);
        toggleClass('so-dim', sectionStatus, sectionAnswer);
        buildNode({
          parent: sectionMessage,
          child: 'div',
          content: 'Correct',
          className: 'mcq-correct-answer'
        });
      }, 350);

      setTimeout(() => {
        toggleClass('fade-hide', sectionMessage); // Hide fully
        toggleClass('so-dim', sectionStatus, sectionAnswer);
        clearScreen([sectionStatus, sectionQuestion, sectionMessage, sectionAnswer]);
        questionMgr.finalizeQuestionAndProceed(true);
      }, 1200); // Add delay equal to the fade-out transition duration (0.5s)
    } 
    
    else {
        questionMgr.finalizeQuestionAndProceed(false);
        vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
        clearScreen(sectionMessage);

        setTimeout(() => {
          buildNode({ 
            parent: sectionMessage, 
            child: 'div', 
            content: 'Keep Trying', 
            className: 'wrong-answer' 
          });

          // Show overlay "wrong" message
          toggleClass('fade-hide', sectionMessage); 

          // Fully hide after fade-out completes (0.5s from .fade-out transition)
          setTimeout(() => {
              toggleClass('fade-hide', sectionMessage); // Hide fully
          }, 1000); // Add delay equal to the fade-out transition duration (0.5s)
        }, 350);
           
    }
    console.groupEnd();
  }

  // event handler for flashcard mode
  function handleFlashCardYesNoAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - handleFlashCardYesNoAnswer()");
    const currentQuestionMode = questionMgr.readQuestionMode;

    const btnID = event.currentTarget.id;

    if (btnID === "choice-btn-0") {
      questionMgr.finalizeQuestionAndProceed(true);
    } else if (btnID === "choice-btn-1") {
      if (currentQuestionMode !== "stored") {
        vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
      }
      questionMgr.finalizeQuestionAndProceed(false);
    }

    console.groupEnd();
  }

  // event handler at the end of 1st round of question, asking user whether they want to continue to storeddata
  function handleContineToStoredData(event) {
    console.groupCollapsed("answerManager() - handleContineToStoredData()");

    toggleClass('fade-hide', sectionMessage);
    toggleClass('overlay-message', sectionMessage);

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      console.log("Clicked Yes");
      //noMoreQuestion.ranOnce = true; // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      answerMgr.setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      console.info("noMoreQuestion.ranOnce CHANGED :", noMoreQuestion.ranOnce);
      loaderInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      console.log("Clicked No");
      answerMgr.setRanOnce(false);
      loaderInstance.restart();
    }
    console.groupEnd();
  }

  return {
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleFlashCardYesNoAnswer,
    handleContineToStoredData,
  }
}

function vocabManager() {
  
  // to remove passed question number from the array
  function removeSpecifiedQuestion(i) {
    //console.groupCollapsed("vocabManager() - removeSpecifiedQuestion()");

    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
      //console.log(`currentQIndex ${i} is removed. vocabArray.length: ${appData.vocabArray.length}`);
      //console.log("Inside removeSpecifiedQuestion(): After deletion; ", appData.vocabArray);
    } else {
      //console.log(`vocabArray.length: ${appData.vocabArray.length}; reach the end.`);
      // !!!​CHECK!!  Is it really ok without anything in this else block?????????
    }

    console.groupEnd();
  }

  // store passed obj to local storage
  function storeToPractice(questionInstance) { // [sn5]
    console.groupCollapsed("vocabManager() - storeToPractice()");

    let incorrectSets = loadMistakesFromStorage();
    
    //console.log(questionInstance.readQuestionObj);
    // [sn6] Check if the object already exists in the array
    let exists = incorrectSets.some(answer =>
      answer.ka === questionInstance.readQuestionObj.ka &&
      answer.hi === questionInstance.readQuestionObj.hi &&
      answer.en === questionInstance.readQuestionObj.en
    );
  
    // If it doesn't exist, add it to the array
    if (!exists) {
      incorrectSets.push(questionInstance.readQuestionObj);
      console.log("New word pushed to localstorage.");
      localStorage.setItem("toPractice", JSON.stringify(incorrectSets));
      loadMistakesFromStorage();
    }

    console.groupEnd();
  }
  
  // to load data from local storage
  function loadMistakesFromStorage() {
    //console.groupCollapsed("vocabManager() - loadMistakesFromStorage()");

    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    //console.log("storedObjects ", storedObjects);
    console.groupEnd();

    return storedObjects;
  }
  
  // to flush local storage
  function flushLocalStorage() {
    console.groupCollapsed("vocabManager() - flushLocalStorage()");

    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    /*
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loaderInstance.loadMemoryData();
    */
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    clearNode({
      parent: selectors.memoryBtns,
      children: selectors.readMemoryBtns,
    });

    loaderInstance.loadMemoryData().resetAfterFlushingMistakes();
    console.groupEnd();
  }

  // to save the current state of the program to local storage
  function saveState() {
    console.groupCollapsed("saveState()");

    localStorage.setItem("appState", JSON.stringify(appState));
    localStorage.setItem("appData", JSON.stringify(appData));
    localStorage.setItem("currentStatus", JSON.stringify(currentStatus));
    console.info("State saved to localStorage");

    console.groupEnd();
  }

  // to load the current state of the program to resume
  function loadState() {
    console.groupCollapsed("loadState()");

    const savedAppState = localStorage.getItem("appState");
    const savedAppData = localStorage.getItem("appData");
    const savedCurrentStatus = localStorage.getItem("currentStatus");
  
    if (savedAppState && savedAppData && savedCurrentStatus) {
      Object.assign(appState, JSON.parse(savedAppState));
      Object.assign(appData, JSON.parse(savedAppData));
      Object.assign(currentStatus, JSON.parse(savedCurrentStatus));
      console.info("State loaded from localStorage");
    } else {
      console.warn("No saved state found in localStorage");
    }

    console.groupEnd();
  }
  
  // to clear the current state (if necessary)
  function clearState() {
    console.groupCollapsed("clearState()");

    localStorage.removeItem("appState");
    localStorage.removeItem("appData");
    localStorage.removeItem("currentStatus");
    console.info("State cleared from localStorage");

    console.groupEnd();
  }

  return {
    removeSpecifiedQuestion,
    storeToPractice,
    flushLocalStorage,
    loadMistakesFromStorage,
    saveState,
    loadState,
    clearState,
    get readStoredLength() { 
      let mistakeFromStorage = loadMistakesFromStorage();
      return mistakeFromStorage.length;
    },
  }
}

function errorManager() {
  const codeMapping = {
    iLoop: "infiniteloop",
    noSL: "syllable-error",
    mem0: "no-stored-data",
  };
  
  // to check various runtime errors and handle if necessary
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode: ", errcode);

    switch (codeMapping[errcode]){
      case "infiniteloop":
        let selectedArray = answerMgr.vocabMapping[selectors.aChoice.value];
        let choiceInput = parseInt(appState.noOfAnswers, 10);
        let noOfChoice = Math.min(choiceInput, selectedArray.length);

        console.info("selectedArray :", selectedArray);
        console.info("choiceInput :", choiceInput);
        console.info("noOfChoice: ", noOfChoice);

        // Infinite Loop Prevention: If selectedArray contains very few elements, 
        // the loop inside do...while of `createAnswerArray()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
        // but keeps failing due to duplicates. This is less likely, but worth checking.

        if (selectedArray.length <= noOfChoice) {
          console.error("Not enough unique answers to generate.");

          if (!document.querySelector("[id|='runtime-error']")) { // if error is not already shown
            showError({
              errcode: "iLoop",
              parentName: selectors.settingNoOfAns,
              idName: "runtime-error"
            });
          }
          console.groupEnd();
          return false; // Return false when there is an error
        } else {
          console.info("No runtime error: good to go!");
          console.groupEnd();
          return true; // Return true when there is no error
        }
        break;

      case "syllable-error":
        if (!document.querySelector("[id|='syllable-error']")) { // if error is not already shown
          errorInstance.showError({
            errcode: "noSL",
            parentName: selectors.settingSyllable,
            idName: 'syllable-error',
          });
        }
        return false; // Return false for syllable error case
        break;

      case "no-stored-data":
        if (!document.querySelector("[id|='memory-empty-error']")) { // if error is not already shown
          showError({
            errcode: "mem0",
            parentName: selectors.settingRepractice,
            idName: "memory-empty-error"
          });
        }
        break;
    }
  }

  // to show runtime error messages
  function showError({ errcode, parentName, idName }) {
    console.groupCollapsed("showError()");
    
    const classNameMapping = {
      iLoop: "setting-error",
      noSL: "setting-error",
      mem0: "setting-error",
    };

    let errorMessage = "";
    
    if (codeMapping[errcode] === "infiniteloop") {
        console.warn("Runtime error: Not enough unique answers to generate.");
        errorMessage = `
            Not enough unique answers available. 
            Please reduce the number of answer choices.
        `;
    }

    else if (codeMapping[errcode] === "syllable-error") {
      console.error("No syllables selected.");
        errorMessage = `
            Select at least one syllable
        `;
    }

    else if (codeMapping[errcode] === "no-stored-data") {
      console.warn("Runtime error: Stored memory is empty.");
      errorMessage = `
          Memory is empty for the moment, try practicing from the fresh start first.
      `;
    }

    buildNode({ 
      parent: parentName, 
      child: 'div', 
      content: errorMessage, 
      className: classNameMapping[errcode],
      idName: idName,
  });
  console.groupEnd();
  return this;
}
  
  return {  
    runtimeError,
    showError,
  }
}

function statusManager() {
  // Initialize statusManager's properties, if it’s not defined yet ...
  if (statusManager.goodToResume === undefined) {
    statusManager.goodToResume = "false";
  }

  // return `questionCount`
  function readQuestionCount() {
    return currentStatus.questionCount;
  }

  // increase `questionCount`
  function increaseQuestionCount() {
    currentStatus.questionCount++;
    //console.info("currentStatus() -> questionCount: ", questionCount);
  }

  // reset `questionCount`
  function resetQuestionCount () {
    currentStatus.questionCount = 0;
    return this;
  }

  // reset `totalNoOfQuestion` to zero
  function resetTotalNoOfQuestion() {
    currentStatus.totalNoOfQuestions = 0;
    return this;
  }

  // assign `vocabArrary` length to `totalNoOfQuestions`
  function getTotalNoOfQuestions(state) {
    console.groupCollapsed("getTotalNoOfQuestions()");

    switch (state) {
      case "fresh":
        console.info("state : ", state);
        currentStatus.totalNoOfQuestions = appData.vocabArray.length;
        break;

      case "stored":
        console.info("state : ", state);
        currentStatus.totalNoOfQuestions += appData.vocabArray.length;
        break;
    }

    //totalNoOfQuestions = appData.vocabArray.length;
    console.info("currentStatus() -> totalNoOfQuestions: ", currentStatus.totalNoOfQuestions);

    console.groupEnd();
    return currentStatus.totalNoOfQuestions;
  }

  // to print score and status(`#/#`) on screen
  function printQuestionStatus() {
    clearScreen(sectionStatus);

    setTimeout(() => {
      if (currentStatus.totalQuestionsAnswered >= 1) { // show cumulative average only it is not the first question shown
        buildNode({
          parent: sectionStatus,
          child: "div",
          content: `Average Correct Rate: ${currentStatus.averageScore}%`,
        });
      }
  
      buildNode({
        parent: sectionStatus,
        child: "div",
        content: `${readQuestionCount()} / ${currentStatus.totalNoOfQuestions}`,
      });
    }, 350);
  }

  // to reset all variables concerning with calculating the cumulative average
  function resetCumulativeVariables() {
    currentStatus.cumulativeAverage = 0;
    currentStatus.totalCorrectAnswers = 0;
    currentStatus.totalQuestionsAnswered = 0; 
    return this;
  }

  // to increase totalCorrectAnswers
  function increaseTotalCorrectAnswers() {
    currentStatus.totalCorrectAnswers++;
    return this;
  }

  // to increase totalQuestionsAnswered
  function increaseTotalQuestionsAnswered() {
    currentStatus.totalQuestionsAnswered++;
    return this;
  }

  function updateCumulativeAverage(isCorrect) {
    //console.groupCollapsed("updateCumulativeAverage()");

    currentStatus.totalQuestionsAnswered++;
    if (isCorrect) currentStatus.totalCorrectAnswers++;
    //console.info("totalQuestionsAnswered :", totalQuestionsAnswered, "totalCorrectAnswers :", totalCorrectAnswers);

    // Calculate new cumulative average based on the latest answer
    currentStatus.cumulativeAverage = (currentStatus.cumulativeAverage * (currentStatus.totalQuestionsAnswered - 1) + (isCorrect ? 1 : 0)) / currentStatus.totalQuestionsAnswered; //le6
    //console.info("cumulativeAverage :", cumulativeAverage);

    // Calculate the percentage and round to a whole number
    currentStatus.averageScore = Math.round(currentStatus.cumulativeAverage * 100); // This will give you a whole number
    //console.info("averageScore :", averageScore);

    return currentStatus.averageScore; // Return the rounded percentage directly
  }

  // to read totalCorrectAnswers
  function readTotalCorrectAnswers() {
      return currentStatus.totalCorrectAnswers;
  }

  function stillInProgress() {
    console.groupCollapsed("stillInProgress()");

    const savedCurrentStatus = JSON.parse(localStorage.getItem("currentStatus")); // Parse JSON
    const savedTotalQuestionsAnswered = savedCurrentStatus.totalQuestionsAnswered;
    const savedTotalNoOfQuestions = savedCurrentStatus.totalNoOfQuestions;

    //if (savedCurrentStatus && (savedCurrentStatus.questionCount >= 1)) {
    if (savedCurrentStatus && (savedTotalQuestionsAnswered < savedTotalNoOfQuestions)) {
      console.info("TRUE - program still in progress.  ", savedTotalQuestionsAnswered, "/", savedTotalNoOfQuestions);
      console.groupEnd();
      return true;
    } else {
      console.info("FALSE - no remaining questions.", savedTotalQuestionsAnswered, "/", savedTotalNoOfQuestions);
      console.groupEnd();
      return false;
    }
  }  

  function getGoodToResume() {
    return statusManager.goodToResume;
  }

  function setGoodToResume(value) {
    console.groupCollapsed("setGoodToResume()");

    const validValues = [true, false];
    if(!validValues.includes(value)) {
      statusManager.goodToResume = false;
      console.warn("statusManager.goodToResume set to default - FALSE");
    } else {
      statusManager.goodToResume = value;
      console.info("statusManager.goodToResume set to - ", value);
    }

    console.groupEnd();
  }
  

  return {
    resetQuestionCount,
    resetTotalNoOfQuestion,
    getTotalNoOfQuestions,
    readQuestionCount,
    increaseQuestionCount,
    printQuestionStatus,
    resetCumulativeVariables,
    //calCumulativeAverage,
    //increaseTotalCorrectAnswers,
    //increaseTotalQuestionsAnswered,
    updateCumulativeAverage,
    stillInProgress,
    get goodToResume() { return getGoodToResume(); },
    set goodToResume(value) { setGoodToResume(value); },
  }
}