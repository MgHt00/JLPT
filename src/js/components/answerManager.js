export function answerManager(globals, utilsManager, questionMgr, loaderInstance, answerListenersMgr) {
  const { appState, appData, selectors } = globals;
  const { helpers, domUtils, displayUtils } = utilsManager;

  const vocabMapping = {
    ka: appData.kaVocab,
    hi: appData.hiVocab,
    en: appData.enVocab,
  };

  function setInstances(answerListenerInstance) {
    answerListenersMgr = answerListenerInstance;
  }

  // to prepare all the answers
  function renderAnswers() {
    //console.groupCollapsed("answerManager() - renderAnswers()");

    let ansArray = createAnswerArray();
    //console.log("Inside renderAnswers(); ansArray: ", ansArray, "Inside renderAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      helpers.assignLanguage(selectors.sectionAnswer, "en"); // if aChoice was set to Kanji or Hirigana, reset to "en"
      displayUtils.toggleClass('fade-out-light', selectors.sectionAnswer);
      setTimeout(() => {
        // Building "Flip" button container
        domUtils.buildNode({ 
          parent: selectors.sectionAnswer, 
          child: 'div', 
          content: '', 
          className: ['answer-btn', 'check-flash-mode-answer'], 
          idName: 'answer-btn', 
          eventFunction: answerListenersMgr.handleFlashcardFlip
        });
        // Building "Flip" text
        domUtils.buildNode({ 
          parent: document.querySelector("#answer-btn-0"), 
          child: 'div', 
          content: 'Flip', 
          className: '', 
          idName: 'answer-btn-text', 
          //eventFunction: handleFlashcardAnswer 
        });
        displayUtils.toggleClass('fade-out-light', selectors.sectionAnswer);
      }, 350);
      
    } else { // if it is a multiple choice game
      domUtils.buildNode({ 
        parent: selectors.sectionAnswer, 
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
    displayUtils.removeClass('fade-hide', selectors.sectionMessage);
    displayUtils.removeClass('overlay-message', selectors.sectionMessage);

    domUtils.buildNode({ 
        parent: selectors.sectionMessage, 
        child: 'div', 
        content: `There are ${vocabMgr.readStoredLength} words in mistake bank.  Would you like to practice those?`, 
        className: 'vocabs-complete', 
      });

      domUtils.buildNode({ 
        parent: selectors.sectionAnswer, 
        child: 'div', 
        content: 'Yes', 
        className: 'answer-btn', 
        idName: 'continue-yes', 
        eventFunction: answerListenersMgr.handleContinueToStoredData,
      });

      domUtils.buildNode({ 
        parent: selectors.sectionAnswer, 
        child: 'div', 
        content: 'No', 
        className: 'answer-btn', 
        idName: 'continue-no', 
        eventFunction: answerListenersMgr.handleContinueToStoredData,
      });
      console.groupEnd();
  }

  // when all of the user selected vocabs are shown
  function completeAndRestart() {
    displayUtils.removeClass('fade-hide', selectors.sectionMessage);
    displayUtils.removeClass('overlay-message', selectors.sectionMessage);

    domUtils.buildNode({ 
      parent: selectors.sectionMessage, 
      child: 'div', 
      content: 'You have completed all the vocabs.  Well done!', 
      className: 'vocabs-complete', 
    });

    domUtils.buildNode({ 
      parent: selectors.sectionAnswer, 
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

    //let selectedArray = vocabMapping[selectors.aChoice.value];
    let selectedArray = vocabMapping[selectors.readaChoiceInput];
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
        randomIndex = helpers.randomNo(0, selectedArray.length - 1);
        randomAnswer = selectedArray[randomIndex];
      } while (tempAnsArray.includes(randomAnswer) || randomAnswer === ""); // Check for duplicates and empty

      tempAnsArray[i] = randomAnswer;
    }

    tempAnsArray = helpers.shuffleArray(tempAnsArray);
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
    setInstances,
    renderAnswers,
    noMoreQuestion,
    setRanOnce,
  }
}
