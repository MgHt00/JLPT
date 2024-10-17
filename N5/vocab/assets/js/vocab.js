const questionMgr = questionManager();
const vocabMgr =  vocabManager();
const answerMgr = answerManager();

function questionManager() {
  let questionObj = {};

  // to start a new question
  function newQuestion() {
    console.groupCollapsed("---questionManager() - newQuestion()---");

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
  
        console.log("ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
        
        buildNode({ 
          parent: sectionQuestion, 
          child: 'div', 
          content: questionObj[appState.qChoiceInput],
        });
        answerMgr.renderAnswers();  
      } else { // if there is no more question left to show
        answerMgr.noMoreQuestion();
      }      
    }, 600); // Matches the transition duration

    console.groupEnd();
  }

  // to set program's question mode (fresh or stored)
  function setQuestionMode(m) {
    //console.groupCollapsed("questionManager() - setQuestionMode()");

    const validModes = ["fresh", "stored"];
    if(!validModes.includes(m)) {
      newQuestion.mode = "fresh"; // default to `fresh`
      console.warn("Invalid mode is passed. Defaulting to `fresh`.");
    } else {
      newQuestion.mode = m;
      //console.info("Question mode: ", newQuestion.mode);
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
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Check Answer', 
        className: ['answer-btn', 'check-flash-mode-answer'], 
        idName: 'answer-btn', 
        eventFunction: handleFlashcardAnswer 
      });
    } else { // if it is a multiple choice game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ansArray, 
        className: 'answer-btn', 
        eventFunction: handleMultipleChoiceAnswer 
      });
    }

    console.groupEnd();
  }

  // when there is no more question to shown.
  function noMoreQuestion() {
    //console.groupCollapsed("noMoreQuestion()");

    if (questionMgr.readQuestionMode === "fresh") { // if currently showing data from JSON
      if (vocabMgr.readStoredLength <= 2) { 
        // If there is no store vocab in local storage
        // (less than 2 vocab in local storage will lead to infinite loop; so that it needs to be <=2)
        questionMgr.readQuestionMode = "stored";
        completeAndRestart();
      } 
      else {
        questionMgr.readQuestionMode = "stored";
        toLocalStorageYesNo();
      }
    }
    
    else if (questionMgr.readQuestionMode === "stored") { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          //console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
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

  // to ask user whether they want to practice the vocabs from the local storage
  function toLocalStorageYesNo() {
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

  // event handler for flashcard  mode
  function handleFlashcardAnswer() {
    //console.groupCollapsed("answerManager() - handleFlashcardAnswer()");

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
      className: 'correct-answer', 
      idName: 'correct-answer' 
    });

    // Show buttons
    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ 
        parent: sectionAnswer, 
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
        eventFunction: handleFlashCardAnswer 
      });
    } else {
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'answer-message', 
        idName: 'next-btn' });
    }

    console.groupEnd();
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen([sectionStatus, sectionQuestion, sectionMessage, sectionAnswer]);

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Correct!', 
        className: 'correct-answer-message', 
        idName: 'answer-message' 
      });
      buildNode({ parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'mcq-next-q-btn', 
        idName: 'choice-btn', 
        //eventFunction: questionMgr.finalizeQuestionAndProceed
        eventFunction: () => questionMgr.finalizeQuestionAndProceed(true) // need to wrap the function in an arrow function (or another function) to control the argument passing.
      });

    } else {
        questionMgr.finalizeQuestionAndProceed(false);
        vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
        clearScreen(sectionMessage);
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
        }, 2000); // Add delay equal to the fade-out transition duration (0.5s)
    }
    console.groupEnd();
  }

  // event handler for flashcard mode
  function handleFlashCardAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - handleFlashCardAnswer()");

    const btnID = event.currentTarget.id;

    if (btnID === "choice-btn-0") {
      questionMgr.finalizeQuestionAndProceed(true);
    } else if (btnID === "choice-btn-1") {
      vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
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
      noMoreQuestion.ranOnce = true; // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      console.info("noMoreQuestion.ranOnce CHANGED :", noMoreQuestion.ranOnce);
      loaderInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      loaderInstance.restart();
    }
    console.groupEnd();
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

    let incorrectSets = loadLocalStorage();
    
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
      loadLocalStorage();
    }

    console.groupEnd();
  }
  
  // to load data from local storage
  function loadLocalStorage() {
    //console.groupCollapsed("vocabManager() - loadLocalStorage()");

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
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loaderInstance.loadMemoryData();

    console.groupEnd();
  }

  return {
    removeSpecifiedQuestion,
    storeToPractice,
    flushLocalStorage,
    loadLocalStorage,
    get readStoredLength() { 
      let storedLength = loadLocalStorage();
      return storedLength.length;
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
  let questionCount = 0;
  let totalNoOfQuestions = 0;
  let cumulativeAverage = 0;
  let totalCorrectAnswers = 0;
  let totalQuestionsAnswered = 0;
  let averageScore = 0;
  
  // return `questionCount`
  function readQuestionCount() {
    return questionCount;
  }

  // increase `questionCount`
  function increaseQuestionCount() {
    questionCount++;
    //console.info("statusManager() -> questionCount: ", questionCount);
  }

  // reset `questionCount`
  function resetQuestionCount () {
    questionCount = 0;
    return this;
  }

  // reset `totalNoOfQuestion` to zero
  function resetTotalNoOfQuestion() {
    totalNoOfQuestions = 0;
    return this;
  }

  // assign `vocabArrary` length to `totalNoOfQuestions`
  function getTotalNoOfQuestions(state) {
    console.groupCollapsed("getTotalNoOfQuestions()");

    switch (state) {
      case "fresh":
        console.info("state : ", state);
        totalNoOfQuestions = appData.vocabArray.length;
        break;

      case "stored":
        console.info("state : ", state);
        totalNoOfQuestions += appData.vocabArray.length;
        break;
    }

    //totalNoOfQuestions = appData.vocabArray.length;
    console.info("statusManager() -> totalNoOfQuestions: ", totalNoOfQuestions);

    console.groupEnd();
    return totalNoOfQuestions;
  }

  // to print score and status(`#/#`) on screen
  function printQuestionStatus() {
    clearScreen(sectionStatus);

    setTimeout(() => {
      if (totalQuestionsAnswered >= 1) { // show cumulative average only it is not the first question shown
        buildNode({
          parent: sectionStatus,
          child: "div",
          content: `Average Correct Rate: ${averageScore}%`,
        });
      }
  
      buildNode({
        parent: sectionStatus,
        child: "div",
        content: `${readQuestionCount()} / ${totalNoOfQuestions}`,
      });
    }, 600);
  }

  // to reset all variables concerning with calculating the cumulative average
  function resetCumulativeVariables() {
    cumulativeAverage = 0;
    totalCorrectAnswers = 0;
    totalQuestionsAnswered = 0; 
    return this;
  }

  // to increase totalCorrectAnswers
  function increaseTotalCorrectAnswers() {
    totalCorrectAnswers++;
    return this;
  }

  // to increase totalQuestionsAnswered
  function increaseTotalQuestionsAnswered() {
    totalQuestionsAnswered++;
    return this;
  }

  function updateCumulativeAverage(isCorrect) {
    console.groupCollapsed("updateCumulativeAverage()");

    totalQuestionsAnswered++;
    if (isCorrect) totalCorrectAnswers++;
    console.info("totalQuestionsAnswered :", totalQuestionsAnswered, "totalCorrectAnswers :", totalCorrectAnswers);

    // Calculate new cumulative average based on the latest answer
    cumulativeAverage = (cumulativeAverage * (totalQuestionsAnswered - 1) + (isCorrect ? 1 : 0)) / totalQuestionsAnswered; //le6
    console.info("cumulativeAverage :", cumulativeAverage);

    // Calculate the percentage and round to a whole number
    averageScore = Math.round(cumulativeAverage * 100); // This will give you a whole number
    console.info("averageScore :", averageScore);

    return averageScore; // Return the rounded percentage directly
}

  // to read totalCorrectAnswers
  function readTotalCorrectAnswers() {
      return totalCorrectAnswers;
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
  }
}