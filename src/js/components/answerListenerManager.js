import { RENDER_ANSWERS } from "../constants/elementIDs.js";
import { QUESTION_MODE_FRESH, QUESTION_MODE_STORED, FLASH_CARD_MODE, MCQ_MODE } from "../constants/appConstants.js";
import { CSS_CLASS_NAMES } from "../constants/cssClassNames.js";

export function answerListenerManager(globals, utilsManager, vocabFns, questionFns, loaderFns) {
  const { appState, selectors } = globals;
  const { domUtils, displayUtils } = utilsManager;
  const { storeToMistakeBank, removeFromMistakeBank } = vocabFns;
  const { finalizeQuestionAndProceed, setQuestionMode, readQuestionMode } = questionFns;
  const { continuetoStoredData, restart } = loaderFns;

  let _setRanOnce;

  function setAnswerListenerManagerCallbacks(setRanOnce) {
    _setRanOnce = setRanOnce;
  }

  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    _removeExistingButtons();
    _fadeMessangeAndAnswer();

    const _flashCardContentConfig = { 
      // _flashCardContentConfig is defined here to ensure it uses the correct appState.correctAns.
      // This value is set dynamically for each question, and defining the config outside would
      // capture an outdated or empty value.
      correctAns: {
        content: appState.correctAns,
        className: CSS_CLASS_NAMES.FLASH_CARD_CORRECT,
        id: RENDER_ANSWERS.CORRECT_ANSWER,
      },
      message: {
        content: FLASH_CARD_MODE.QUESTION, // something like "did you get it right?"
        className: CSS_CLASS_NAMES.ANSWER_MESSAGE,
        id: RENDER_ANSWERS.ANSWER_MESSAGE,
      },
      yesNo: {
        content: [FLASH_CARD_MODE.YES, FLASH_CARD_MODE.NO],
        className: CSS_CLASS_NAMES.ANSWER_BUTTON,
        id: RENDER_ANSWERS.CHOICE_BUTTON,
        eventFunction: _handleFlashCardYesNoAnswer
      },
    }

    setTimeout(() => {
      _showFlashCardContent(_flashCardContentConfig.correctAns); // Show correct answer
      _showFlashCardContent(_flashCardContentConfig.message);    // Show Message
      _showFlashCardContent(_flashCardContentConfig.yesNo);      // Show `Yes` `No` buttons
      _fadeMessangeAndAnswer();
    }, 350);

    console.groupEnd();
  }

  function _removeExistingButtons() { // Remove exiting buttons
    const answerButtons = document.querySelectorAll(`[id^=${RENDER_ANSWERS.ANSWER_BUTTON}]`); // sn3
    answerButtons.forEach(button => {
      displayUtils.toggleClass(CSS_CLASS_NAMES.FADE_OUT_LIGHT, button);
      setTimeout(() => {
        button.remove();
      }, 350);
    });
  }

  function _fadeMessangeAndAnswer() {
    displayUtils.toggleClass(CSS_CLASS_NAMES.FADE_OUT_LIGHT, selectors.sectionMessage, selectors.sectionAnswer);
  }

  function _showFlashCardContent(config) {
    if (!config) {
      console.warn(`handleFlashcardFlip() - _showFlashCardContent() - No config found.`);
      return;
    }

    domUtils.buildNode({
      parent: selectors.sectionAnswer,
      child: 'div',
      content: config.content,
      className: config.className,
      id: config.id,
      eventFunction: config.eventFunction
    });
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    displayUtils.addClass(CSS_CLASS_NAMES.FADE_HIDE, selectors.sectionMessage)
                .addClass(CSS_CLASS_NAMES.OVERLAY_MESSAGE, selectors.sectionMessage);

    const _btnText = event.currentTarget.textContent;
    if (appState.correctAns === _btnText) {  // If the answer is CORRECT
      _clearScreen("light");

      setTimeout(() => {
        _toggleFadeAndDim("fadeAndDim");
        _showMCQContent("correct");
      }, 350);

      setTimeout(() => {
        _toggleFadeAndDim("fadeAndDim");     // Hide fully
        _clearScreen("deep");
        _checkModeAndRemoveVocab();
        finalizeQuestionAndProceed(true);
      }, 1200);                             // Add delay equal to the fade-out transition duration
    } 
    
    else {                                  // If the answer is INCORRECT
        finalizeQuestionAndProceed(false);
        storeToMistakeBank(); // add wrongly selected word to localstorage

        domUtils.clearScreen(selectors.sectionMessage);

        setTimeout(() => {
          _showMCQContent("incorrect");         // Show overlay "wrong" message
          _toggleFadeAndDim("fadeOnly");

          setTimeout(() => {                 // Fully hide after fade-out completes (1s from .fade-out transition)
            _toggleFadeAndDim("fadeOnly");    // Hide fully
          }, 1000);                          // Add delay equal to the fade-out transition duration
        }, 350);
           
    }
    console.groupEnd();
  }

  function _getMCQContentConfig() {
    return {
      correct: {
        content: MCQ_MODE.CORRECT_ANSWER,
        className: CSS_CLASS_NAMES.MCQ_CORRECT_ANSWER,
      },
      incorrect: {
        content: MCQ_MODE.WRONG_ANSWER,
        className: CSS_CLASS_NAMES.MCQ_WRONG_ANSWER,
      },
    }
  }

  function _showMCQContent(key) {
    const config = _getMCQContentConfig()[key];
    domUtils.buildNode({
      parent: selectors.sectionMessage,
      child: 'div',
      content: config.content,
      className: config.className
    });
  }

  function _getClearConfig() {             // To avoide JS temporal dead zone (TDZ)
    return {
      light: {
        target: selectors.sectionMessage,
      },
      deep: {
        target: [selectors.sectionStatus,
        selectors.sectionQuestion,
        selectors.sectionMessage,
        selectors.sectionAnswer]
      },
    };
  }

  function _clearScreen(mode) {
    const config = _getClearConfig()[mode]; // [sn26] 
    domUtils.clearScreen(config.target);
  }

  // event handler for flashcard mode
  function _handleFlashCardYesNoAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - _handleFlashCardYesNoAnswer()");
    
    const btnID = event.currentTarget.id;

    if (btnID === `${RENDER_ANSWERS.CHOICE_BUTTON}-0`) {
      _checkModeAndRemoveVocab();
      finalizeQuestionAndProceed(true);
    } 
    
    else if (btnID === `${RENDER_ANSWERS.CHOICE_BUTTON}-1`) {
      if (readQuestionMode() !== QUESTION_MODE_STORED) {
        storeToMistakeBank(); // add wrongly selected word to localstorage
      } 

      finalizeQuestionAndProceed(false);
    }

    console.groupEnd();
  }

  // event handler at the end of 1st round of question, asking user whether they want to continue to storeddata
  function handleContinueToStoredData(event) {
    console.groupCollapsed("answerManager() - handleContinueToStoredData()");

    _toggleFadeAndDim("overlay");

    const btnID = event.currentTarget.id;

    if (btnID === `${RENDER_ANSWERS.YES_TO_CONTINUE}-0`) {
      console.info("Clicked Yes");
      setQuestionMode(QUESTION_MODE_STORED);
      _setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      continuetoStoredData();
    } 
    
    else if (btnID === `${RENDER_ANSWERS.NO_TO_CONTINUE}-0`) {
      console.info("Clicked No");
      _setRanOnce(false);
      restart();
    }
    console.groupEnd();
  }

  // Check q mode and decide whether to proceed to remove from the mistake bank
  function _checkModeAndRemoveVocab() {
    console.groupCollapsed("_checkModeAndRemoveVocab()");
    
    const currentQuestionMode = readQuestionMode();

    if (currentQuestionMode === QUESTION_MODE_STORED) { // if current q mode is stored and answer is right
      console.info("currentQuestionMode: ", currentQuestionMode, ".  removeFromMistakeBank() is called.");
      removeFromMistakeBank();
    } else {
      console.info("currentQuestionMode: ", currentQuestionMode, ".  No need to remove mistakes");
    }

    console.groupEnd();
  }

  function _toggleFadeAndDim(key) {
    const shouldFade = [ "fadeOnly", "fadeAndDim", "overlay"].includes(key); 
    const shouldDim = key === "fadeAndDim";
    const shouldOverlay = key === "overlay";
    // If key: "fadeOnly", "fadeAndDim", or "overlay" => toggle FADE_HIDE
    // key: "fadeAndDim" => toggle 'so-dim'
    // key: "overlay" => toggle OVERLAY_MESSAGE
    
    if (shouldFade) {
      displayUtils.toggleClass(CSS_CLASS_NAMES.FADE_HIDE, selectors.sectionMessage);
    }

    if (shouldDim) {
      displayUtils.toggleClass(CSS_CLASS_NAMES.VERY_DIM, selectors.sectionStatus, selectors.sectionAnswer);
    }

    if (shouldOverlay) {
      displayUtils.toggleClass(CSS_CLASS_NAMES.OVERLAY_MESSAGE, selectors.sectionMessage);
    }

    if (!shouldFade && !shouldDim && !shouldOverlay) {
      console.warn(`handleMultipleChoiceAnswer() - _toggleFadeAndDim() - invalid key: "${key}"`);
    }
  }

  return {
    setAnswerListenerManagerCallbacks,
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleContinueToStoredData,
  }
}
