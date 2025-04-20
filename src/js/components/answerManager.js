export function answerManager(globals, utilsManager, setQuestionMode, readQuestionObj, readQuestionMode, restart) {
  const { appState, appData, selectors } = globals;
  const { helpers, domUtils, displayUtils } = utilsManager;

  const vocabMapping = {
    ka: appData.kaVocab,
    hi: appData.hiVocab,
    en: appData.enVocab,
  };

  let _readStoredLength, _handleFlashcardFlip, _handleMultipleChoiceAnswer, _handleContinueToStoredData;
  function setAnswerManagerCallbacks(handleFlashcardFlip, handleMultipleChoiceAnswer, handleContinueToStoredData, readStoredLength) {
    _handleFlashcardFlip = handleFlashcardFlip;
    _handleMultipleChoiceAnswer = handleMultipleChoiceAnswer;
    _handleContinueToStoredData = handleContinueToStoredData;
    _readStoredLength = readStoredLength;
  }

  // to prepare all the answers
  function renderAnswers() {
    console.groupCollapsed("answerManager() - renderAnswers()");

    let ansArray = createAnswerArray();
    //console.log("Inside renderAnswers(); ansArray: ", ansArray, "Inside renderAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) {            // if it is a flash card game
      helpers.assignLanguage(selectors.sectionAnswer, "en"); // if aChoice was set to Kanji or Hirigana, reset to "en"
      displayUtils.toggleClass('fade-out-light', selectors.sectionAnswer);
      setTimeout(() => {
        createAnswerElement("flipBtn");   // Building "Flip" button container
        createAnswerElement("flipText");  // Building "Flip" text
        displayUtils.toggleClass('fade-out-light', selectors.sectionAnswer);
      }, 350);
      
    } else {                              // if it is a multiple choice game
      createAnswerElement("ansArray");
    }

    console.groupEnd();

    // functions private to the modules
    function getConfig() {
      return {
        flipBtn: {
          content: '',
          className: ['answer-btn', 'check-flash-mode-answer'], 
          id: 'answer-btn', 
          eventFunction: _handleFlashcardFlip,
        },
        flipText: {
          content: 'Flip', 
          className: '', 
          id: 'answer-btn-text', 
        },
        ansArray: {
          content: ansArray, 
          className: 'answer-btn', 
          eventFunction: _handleMultipleChoiceAnswer 
        },
      }
    }
    function createAnswerElement(key) {
      const config = { ...getConfig()[key] };   // create a new object instead of mutating the original. [sn27]
      config.parent = ["flipBtn", "ansArray"].includes(key) 
        ? selectors.sectionAnswer 
        : document.querySelector("#answer-btn-0");
        
      domUtils.buildNode({
        parent: config.parent,
        child: 'div',
        content: config.content,
        className: config.className,
        id: config.id,                
        eventFunction: config.eventFunction,
      });
    }
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

    if (readQuestionMode === "fresh") { // if currently showing data from JSON
      setQuestionMode("stored");
      if (_readStoredLength <= 2) { 
        // If there is no store vocab in local storage
        // (less than 2 vocab in local storage will lead to infinite loop; so that it needs to be <=2)
        //readQuestionMode = "stored";
        completeAndRestart();
      } 
      else {
        //readQuestionMode = "stored";
        toLocalStorageYesNo();
      }
    }
    
    else if (readQuestionMode === "stored") { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
          completeAndRestart();
        }
        else if (_readStoredLength <= 2) { 
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

    displayUtils.removeClass('fade-hide', selectors.sectionMessage)
                .removeClass('overlay-message', selectors.sectionMessage);

    constructElement('vocabsComplete');
    constructElement('continueYes');
    constructElement('continueNo');

    console.groupEnd();

    // private helper functions
    function getContent() {
      return {
        vocabsComplete: { content: `There are ${_readStoredLength} words in mistake bank.  Would you like to practice those?` },
        continueYes: { content: 'Yes' },
        continueNo: { content: 'No' },
      }
    }

    function constructElement(key) {
      const contentConfig = getContent()[key];
      const isVC = key === "vocabsComplete";

      domUtils.buildNode({
        parent: isVC ? selectors.sectionMessage : selectors.sectionAnswer,
        child: 'div',
        content: contentConfig.content,
        className: isVC ? "vocabs-complete" : "answer-btn",
        id: key,
        eventFunction: isVC ? null : _handleContinueToStoredData,
      });
    }
  }

  // when all of the user selected vocabs are shown
  function completeAndRestart() {
    displayUtils.removeClass('fade-hide', selectors.sectionMessage)
                .removeClass('overlay-message', selectors.sectionMessage);

    createElement("info");
    createElement("btn");

    // private helper functions 
    function getConfig() {
      return {
        info: {
          parent: selectors.sectionMessage,
          content: 'You have completed all the vocabs.  Well done!',
          className: 'vocabs-complete',
        },
        btn: {
          parent: selectors.sectionAnswer,
          content: 'Let\'s Restart!',
          className: 'answer-btn',
          eventFunction: restart,
        },
      }
    }

    function createElement(key) {
      const config = getConfig()[key];
      domUtils.buildNode({ 
        parent: config.parent, 
        child: 'div', 
        content: config.content, 
        className: config.className, 
        id: config.id ?? 'answer-btn', 
        eventFunction: config.eventFunction ?? restart,
      });
    }
  }

  // to create an array filled with answers including the correct one.
  function createAnswerArray() {
    console.groupCollapsed("answerManager() - createAnswerArray()");

    let selectedArray = vocabMapping[selectors.readaChoiceInput];
    console.info("selectedArray: ", selectedArray, "| selectedArray.legth: ", selectedArray.length);
    
    let tempAnsArray = [];
    tempAnsArray[0] = appState.correctAns;         // add correct answer at index no. 0

    if ((appState.qMode !== "fresh") && !selectedArray) {
      console.error(`No vocab array found for choice: ${selectors.aChoice.value}`);
      return;
    }

    if ((appState.qMode !== "fresh") && selectedArray.length === 0) {
      console.error(`The vocab array is empty for choice: ${selectors.aChoice.value}`);
      return;
    }

    let choiceInput = appState.noOfAnswers;
    //console.info("choiceInput = appState.noOfAnswers: ", choiceInput);

    let noOfChoice = Math.min(choiceInput, selectedArray.length); // [le5]
    //console.info("noOfChoice: ", noOfChoice);

    /* Infinite loop check is moved inside loader() with errorInstance.showError() */
    for (let i = 1; i < noOfChoice; i++) {
      let randomIndex;
      let randomAnswer;

      do {                                           // [le3] Loop to ensure no duplicates are added 
        randomIndex = helpers.randomNo(0, selectedArray.length - 1);
        randomAnswer = selectedArray[randomIndex];
      } while (tempAnsArray.includes(randomAnswer) || randomAnswer === ""); // Check for duplicates and empty

      tempAnsArray[i] = randomAnswer;
    }

    tempAnsArray = helpers.shuffleArray(tempAnsArray);// shuffle `tempAnsArray` and assign back to `tempAnsArray`

    console.groupEnd();
    return tempAnsArray;
  }

  //let rePractice = [];

  function practiceAgain() {
    //const questionInstance = questionMgr;
    console.log("Inside showQuestionAgain(); questionObj: ", readQuestionObj);
    rePractice.push(readQuestionObj);
  }

  return {
    vocabMapping,
    setAnswerManagerCallbacks,
    renderAnswers,
    noMoreQuestion,
    setRanOnce,
  }
}
