import { CSS_CLASS_NAMES } from "../constants/cssClassNames.js";
import { VOCAB_MAPPING, LANGUAGE_MAPPINGS, PLAIN_TEXT_STRINGS, QUESTION_MODE_FRESH, QUESTION_MODE_STORED } from "../constants/appConstants.js";
import { RENDER_ANSWERS } from "../constants/elementIDs.js";

export function answerManager(globals, utilsManager, restart, readStoredLength, questionFns, answerListenerFns) {
  const { appState, selectors } = globals;
  const { helpers, domUtils, displayUtils } = utilsManager;
  const { setQuestionMode, readQuestionObj, readQuestionMode } = questionFns;
  const { handleFlashcardFlip, handleMultipleChoiceAnswer, handleContinueToStoredData } = answerListenerFns;

  const { FADE_OUT_LIGHT, ANSWER_BUTTON, CHECK_FLASH_MODE_ANSWER, FADE_HIDE, OVERLAY_MESSAGE, VOCAB_COMPLETE } = CSS_CLASS_NAMES;

  // Returns configuration objects for different answer elements.
  function _getAnswerElementConfig() {
    return {
      flipBtn: {
        content: '',
        className: [ANSWER_BUTTON, CHECK_FLASH_MODE_ANSWER], 
        id: RENDER_ANSWERS.ANSWER_BUTTON, 
        eventFunction: handleFlashcardFlip,
      },
      flipText: {
        content: PLAIN_TEXT_STRINGS.FLIP_CARD, 
        className: '', 
        id: RENDER_ANSWERS.ANSWER_BUTTON_LABEL, 
      },
      ansArray: {
        content: _createAnswerArray(),
        className: ANSWER_BUTTON, 
        eventFunction: handleMultipleChoiceAnswer 
      },
    }
  }
  
  // Creates and appends an answer element to the DOM based on the provided key.
  function _createAnswerElement(key) {
    const config = { ..._getAnswerElementConfig()[key] };   // create a new object instead of mutating the original. [sn27]
    config.parent = ["flipBtn", "ansArray"].includes(key) 
      ? selectors.sectionAnswer 
      : document.querySelector(`#${RENDER_ANSWERS.ANSWER_BUTTON}-0`);
      
    domUtils.buildNode({
      parent: config.parent,
      child: 'div',
      content: config.content,
      className: config.className,
      id: config.id,                
      eventFunction: config.eventFunction,
    });
  }

  // Prepares and renders answer options on the screen based on the game mode.
  function renderAnswers() {
    console.groupCollapsed("answerManager() - renderAnswers()");

    if (appState.flashYesNo) {            // if it is a flash card game
      helpers.assignLanguage(selectors.sectionAnswer, LANGUAGE_MAPPINGS.ENGLISH); // if aChoice was set to Kanji or Hirigana, reset to "en"
      displayUtils.toggleClass(FADE_OUT_LIGHT, selectors.sectionAnswer);
      setTimeout(() => {
        _createAnswerElement("flipBtn");   // Building "Flip" button container
        _createAnswerElement("flipText");  // Building "Flip" text
        displayUtils.toggleClass(FADE_OUT_LIGHT, selectors.sectionAnswer);
      }, 350);
      
    } else {                              // if it is a multiple choice game
      _createAnswerElement("ansArray");
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

    if (readQuestionMode() === QUESTION_MODE_FRESH) { // if currently showing data from JSON
      setQuestionMode(QUESTION_MODE_STORED);
      if (readStoredLength() <= 2) { 
        // If there is no store vocab in local storage
        // (less than 2 vocab in local storage will lead to infinite loop; so that it needs to be <=2)
        _completeAndRestart();
      } 
      else {
        _toLocalStorageYesNo();
      }
    }
    
    else if (readQuestionMode() === QUESTION_MODE_STORED) { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
          _completeAndRestart();
        }
        else if (readStoredLength() <= 2) { 
          // Even though local storage is zero when the program starts, 
          // check whether new words have been added during the program runtime.
          
          // Less than 2 vocab in local storage will lead to infinite loop; so the if statement is adjusted to <=2
          // console.info("too few vocabs in local storage");
          _completeAndRestart();
        } 
        else {
          noMoreQuestion.ranOnce = true;
          _toLocalStorageYesNo();
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
  function _toLocalStorageYesNo() {
    console.groupCollapsed("_toLocalStorageYesNo()");

    displayUtils.removeClass(FADE_HIDE, selectors.sectionMessage)
                .removeClass(OVERLAY_MESSAGE, selectors.sectionMessage);

    _constructLocalStoragePromptElement('vocabsComplete');
    _constructLocalStoragePromptElement('continueYes');
    _constructLocalStoragePromptElement('continueNo');

    console.groupEnd();

    // private helper functions 
    function _getLocalStoragePromptContent() {
      return {
        vocabsComplete: { content: `There are ${readStoredLength()} words in mistake bank.  Would you like to practice those?` },
        continueYes: { content: 'Yes' },
        continueNo: { content: 'No' },
      }
    }

    function _constructLocalStoragePromptElement(key) {    
      const contentConfig = _getLocalStoragePromptContent()[key];
      const isVC = key === "vocabsComplete";
  
      domUtils.buildNode({
        parent: isVC ? selectors.sectionMessage : selectors.sectionAnswer,
        child: 'div',
        content: contentConfig.content,
        className: isVC ? VOCAB_COMPLETE : ANSWER_BUTTON,
        id: key,
        eventFunction: isVC ? null : handleContinueToStoredData,
      });
    }
  }

  // when all of the user selected vocabs are shown
  function _completeAndRestart() {
    displayUtils.removeClass(FADE_HIDE, selectors.sectionMessage)
                .removeClass(OVERLAY_MESSAGE, selectors.sectionMessage);

    _createFinalActionElement("info");
    _createFinalActionElement("btn");

    // private helper functions 
    function _getFinalActionConfig() {
      return {
        info: {
          parent: selectors.sectionMessage,
          content: PLAIN_TEXT_STRINGS.WELL_DONE,
          className: VOCAB_COMPLETE,
        },
        btn: {
          parent: selectors.sectionAnswer,
          content: PLAIN_TEXT_STRINGS.RESTART_PROMPT,
          className: ANSWER_BUTTON,
          eventFunction: restart,
        },
      }
    }

    function _createFinalActionElement(key) {
      const config = _getFinalActionConfig()[key];
      domUtils.buildNode({ 
        parent: config.parent, 
        child: 'div', 
        content: config.content, 
        className: config.className, 
        id: config.id ?? RENDER_ANSWERS.ANSWER_BUTTON, 
        eventFunction: config.eventFunction ?? restart,
      });
    }
  }

  // to create an array filled with answers including the correct one.
  function _createAnswerArray() {
    console.groupCollapsed("answerManager() - _createAnswerArray()");

    let selectedArray = VOCAB_MAPPING[selectors.readaChoiceInput];
    console.info("selectedArray: ", selectedArray, "| selectedArray.legth: ", selectedArray.length);
    
    let tempAnsArray = [];
    tempAnsArray[0] = appState.correctAns;         // add correct answer at index no. 0

    if ((appState.qMode !== QUESTION_MODE_FRESH) && !selectedArray) {
      console.error(`No vocab array found for choice: ${selectors.aChoice.value}`);
      return;
    }

    if ((appState.qMode !== QUESTION_MODE_FRESH) && selectedArray.length === 0) {
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

  return {
    renderAnswers,
    noMoreQuestion,
    setRanOnce,
  }
}
