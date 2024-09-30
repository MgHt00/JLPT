const questionMgr = questionManager();
const vocabMgr =  vocabManager();
const answerMgr = answerManager();

function questionManager() {
  let questionObj = {};

  function newQuestion() {
    // to start a new question
    console.groupCollapsed("---questionManager() - newQuestion()---");

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

    if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
      //console.log("vocabArray ", appData.vocabArray);
      questionObj = fetchOneQuestion();
      
      appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer
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

    console.groupEnd();
  }

  function setQuestionMode(m) {
    // to set program's question mode
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

  function fetchOneQuestion() {
    // to fetch one question(obj) from the vocabArray
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

  function finalizeQuestionAndProceed() {
    // remove shown question and carry on
    //console.groupCollapsed("questionManager() - finalizeQuestionAndProceed()");

    vocabMgr.removeSpecifiedQuestion(fetchOneQuestion.index);
    newQuestion();
    
    console.groupEnd();
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

  function renderAnswers() {
    // to prepare all the answers
    //console.groupCollapsed("answerManager() - renderAnswers()");

    ansArray = createAnswerChoices();
    //console.log("Inside renderAnswers(); ansArray: ", ansArray, "Inside renderAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      assignLanguage(sectionAnswer, "en"); // if aChoice was set to Kanji or Hirigana, reset to "en"
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Check Answer', 
        className: 'answer-btn', 
        idName: 'answer-btn', 
        eventFunction: buildAnswerButtons 
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

  function noMoreQuestion() {
    // when there is no more question to shown.
    //console.groupCollapsed("noMoreQuestion()");
    
    if (questionMgr.readQuestionMode === "fresh") { // if currently showing data from JSON
      questionMgr.readQuestionMode = "stored";
      //console.log("Processed questionMgr.readQuestionMode: ", questionMgr.readQuestionMode);
      toLocalStorageYesNo();

    } else if (questionMgr.readQuestionMode === "stored") { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          //console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
          completeAndRestart();
        }
        else if (vocabMgr.readStoredLength <= 2) { 
          // even though local storage is zero when the program starts, check whether new words have been added during the run
          // less than 2 vocab in local storage will lead to infinite loop; so the if statement is adjusted to <=2
          //console.info("too few vocabs in local storage");
          completeAndRestart();
        } 
        else {
          noMoreQuestion.ranOnce = true;
          toLocalStorageYesNo();
        }
    }

    console.groupEnd();
    return this;
  }

  function toLocalStorageYesNo() {
    // to ask user whether they want to practice the vocabs from the local storage
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
        eventFunction: answerMgr.ContinueYesNo,
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'No', 
        className: 'answer-btn', 
        idName: 'continue-no', 
        eventFunction: answerMgr.ContinueYesNo,
      });
  }

  function completeAndRestart() {
    // when all of the user selected vocabs are shown
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
      eventFunction: listeners().restart,
    });
  }

  function createAnswerChoices() {
    // to create an array filled with answers including the correct one.
    //console.groupCollapsed("answerManager() - createAnswerChoices()");

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
      let randomWord;

      do { // [le3] Loop to ensure no duplicates are added 
        randomIndex = randomNo(0, selectedArray.length - 1);
        randomWord = selectedArray[randomIndex];
      } while (tempAnsArray.includes(randomWord));

      tempAnsArray[i] = randomWord;
    }

    tempAnsArray = shuffleArray(tempAnsArray);
    console.groupEnd();
    return tempAnsArray;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  function buildAnswerButtons() {
    //console.groupCollapsed("answerManager() - buildAnswerButtons()");

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

  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

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
        eventFunction: questionMgr.finalizeQuestionAndProceed 
      });

    } else {
      if (sectionMessage.textContent !== 'Keep Trying') { // if worng message is not shown already.
        vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
        buildNode({ 
          parent: sectionMessage, 
          child: 'div', 
          content: 'Keep Trying', 
          className: 'wrong-answer' 
        });
      }
    }
    console.groupEnd();
  }

  function handleFlashCardAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - handleFlashCardAnswer()");

    const btnID = event.currentTarget.id;

    if (btnID === "choice-btn-0") {
      questionMgr.finalizeQuestionAndProceed();
    } else if (btnID === "choice-btn-1") {
      vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
      questionMgr.finalizeQuestionAndProceed();
    }

    console.groupEnd();
  }

  function ContinueYesNo(event) {
    console.groupCollapsed("answerManager() - ContinueYesNo()");

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      noMoreQuestion.ranOnce = true; // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      console.info("noMoreQuestion.ranOnce CHANGED :", noMoreQuestion.ranOnce);
      listenerInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      listenerInstance.restart();
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
    ContinueYesNo,
  }
}

function vocabManager() {
  
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
  
  function loadLocalStorage() {
    //console.groupCollapsed("vocabManager() - loadLocalStorage()");

    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    //console.log("storedObjects ", storedObjects);
    console.groupEnd();

    return storedObjects;
  }
  
  function clearIncorrectAnswers() {
    console.groupCollapsed("vocabManager() - clearIncorrectAnswers()");

    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loader().loadMemoryData();

    console.groupEnd();
  }

  return {
    removeSpecifiedQuestion,
    storeToPractice,
    clearIncorrectAnswers,
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
    noSL: "syllable-error"
  };
  
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode: ", errcode);
    
    if (codeMapping[errcode] === "infiniteloop") {
      let selectedArray = answerMgr.vocabMapping[selectors.aChoice.value];
      let choiceInput = parseInt(appState.noOfAnswers, 10);
      let noOfChoice = Math.min(choiceInput, selectedArray.length);
      
      console.info("selectedArray :", selectedArray);
      console.info("choiceInput :", choiceInput);
      console.info("noOfChoice: ", noOfChoice);
      
      // Infinite Loop Prevention: If selectedArray contains very few elements, 
      // the loop inside do...while of `createAnswerChoices()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
      // but keeps failing due to duplicates. This is less likely, but worth checking.
  
      if (selectedArray.length <= noOfChoice) {
        console.error("Not enough unique answers to generate.");
        if (!document.querySelector("[id|='runtime-error']")) { // if error is not already shown
          showError({errcode: "iLoop", parentName: selectors.settingNoOfAns, idName: "runtime-error"});
        }  
        console.groupEnd();
        return false; // Return false when there is an error
      } else {
        console.info("No runtime error: good to go!");
        console.groupEnd();
        return true; // Return true when there is no error
      }
    }
    
    else if(codeMapping[errcode] === "syllable-error") {
      if (!document.querySelector("[id|='syllable-error']")) { // if error is not already shown
        errorInstance.showError({
          errcode: "noSL",
          parentName: selectors.fieldsetSyllable,
          idName: 'syllable-error',
        });
      }
      return false; // Return false for syllable error case
    }
}

  function showError({ errcode, parentName, idName }) {
    console.groupCollapsed("showError()");
    
    const classNameMapping = {
      iLoop: "setting-error",
      noSL: "setting-error",
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