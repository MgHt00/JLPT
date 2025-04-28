export function answerListnerManager(globals, utilsManager, vocabFns, questionFns, loaderFns) {
  const { appState, selectors } = globals;
  const { domUtils, displayUtils } = utilsManager;
  const { storeToMistakeBank, removeFromMistakeBank } = vocabFns;
  const { finalizeQuestionAndProceed, setQuestionMode, readQuestionMode } = questionFns;
  const { continuetoStoredData, restart } = loaderFns;

  let _setRanOnce;

  function setAnswerListnerManagerCallbacks(setRanOnce) {
    _setRanOnce = setRanOnce;
  }

  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    _removeExistingButtons();
    _fadeMessangeAndAnswer();

    const _FLASH_CARD_CONTENT_CONFIG = { 
      // _FLASH_CARD_CONTENT_CONFIG is defined here to ensure it uses the correct appState.correctAns.
      // This value is set dynamically for each question, and defining the config outside would
      // capture an outdated or empty value.
      correctAns: {
        content: appState.correctAns,
        className: 'flash-correct-answer',
        id: 'correct-answer'
      },
      message: {
        content: 'Did you get it right?',
        className: 'answer-message',
        id: 'answer-message'
      },
      yesNo: {
        content: ['Yes', 'No'],
        className: 'answer-btn',
        id: 'choice-btn',
        eventFunction: _handleFlashCardYesNoAnswer
      },
    }

    setTimeout(() => {
      _showFlashCardContent(_FLASH_CARD_CONTENT_CONFIG.correctAns); // Show correct answer
      _showFlashCardContent(_FLASH_CARD_CONTENT_CONFIG.message);    // Show Message
      _showFlashCardContent(_FLASH_CARD_CONTENT_CONFIG.yesNo);      // Show `Yes` `No` buttons
      _fadeMessangeAndAnswer();
    }, 350);

    console.groupEnd();
  }

  function _removeExistingButtons() { // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      displayUtils.toggleClass('fade-out-light', button);
      setTimeout(() => {
        button.remove();
      }, 350);
    });
  }

  function _fadeMessangeAndAnswer() {
    displayUtils.toggleClass('fade-out-light', selectors.sectionMessage, selectors.sectionAnswer);
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

    displayUtils.addClass('fade-hide', selectors.sectionMessage)
                .addClass('overlay-message', selectors.sectionMessage);

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
        content: 'Correct',
        className: 'mcq-correct-answer'
      },
      incorrect: {
        content: 'Keep Trying',
        className: 'wrong-answer'
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

    if (btnID === "choice-btn-0") {
      _checkModeAndRemoveVocab();
      finalizeQuestionAndProceed(true);
    } 
    
    else if (btnID === "choice-btn-1") {
      if (readQuestionMode() !== "stored") {
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

    if (btnID === "continueYes-0") {
      console.info("Clicked Yes");
      setQuestionMode("stored");
      _setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      continuetoStoredData();
    } 
    
    else if (btnID === "continueNo-0") {
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

    if (currentQuestionMode === "stored") { // if current q mode is stored and answer is right
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
    // If key: "fadeOnly", "fadeAndDim", or "overlay" => toggle 'fade-hide'
    // key: "fadeAndDim" => toggle 'so-dim'
    // key: "overlay" => toggle 'overlay-message'
    
    if (shouldFade) {
      displayUtils.toggleClass('fade-hide', selectors.sectionMessage);
    }

    if (shouldDim) {
      displayUtils.toggleClass('so-dim', selectors.sectionStatus, selectors.sectionAnswer);
    }

    if (shouldOverlay) {
      displayUtils.toggleClass('overlay-message', selectors.sectionMessage);
    }

    if (!shouldFade && !shouldDim && !shouldOverlay) {
      console.warn(`handleMultipleChoiceAnswer() - _toggleFadeAndDim() - invalid key: "${key}"`);
    }
  }

  return {
    setAnswerListnerManagerCallbacks,
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleContinueToStoredData,
  }
}
