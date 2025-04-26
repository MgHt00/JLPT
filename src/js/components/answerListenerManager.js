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
    //console.groupCollapsed("answerManager() - handleFlashcardFlip()");

    _removeExistingButtons();
    _fadeMessangeAndAnswer();

    setTimeout(() => {
      _showContent("correctAns");    // Show correct answer
      _showContent("message");       // Show Message
      _showContent("yesNo");         // Show `Yes` `No` buttons
      _fadeMessangeAndAnswer();
    }, 350);

    console.groupEnd();

    // utility functions private to the module
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

    const _CONTENT_CONFIG = {
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
        eventFunction: handleFlashCardYesNoAnswer
      },
    }

    function _showContent(key) {
      const _config = _CONTENT_CONFIG[key];
      if (!_config) {
        console.warn(`handleFlashcardFlip() - _showContent() - No _config found for key: "${key}"`);
        return;
      }

      domUtils.buildNode({
        parent: selectors.sectionAnswer,
        child: 'div',
        content: _config.content,
        className: _config.className,
        id: _config.id,
        eventFunction: _config.eventFunction
      });
    }
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
        _showContent("correct");
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
          _showContent("incorrect");         // Show overlay "wrong" message
          _toggleFadeAndDim("fadeOnly");

          setTimeout(() => {                 // Fully hide after fade-out completes (1s from .fade-out transition)
            _toggleFadeAndDim("fadeOnly");    // Hide fully
          }, 1000);                          // Add delay equal to the fade-out transition duration
        }, 350);
           
    }
    console.groupEnd();

    // utility functions private to the module
    function _getContentConfig() {
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

    function _showContent(key) {
      const _config = _getContentConfig()[key];
      domUtils.buildNode({ 
        parent: selectors.sectionMessage, 
        child: 'div', 
        content: _config.content, 
        className: _config.className 
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
      const _config = _getClearConfig()[mode]; // [sn26] 
      domUtils.clearScreen(_config.target);
    }
  }

  // event handler for flashcard mode
  function handleFlashCardYesNoAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - handleFlashCardYesNoAnswer()");
    
    const _btnID = event.currentTarget.id;

    if (_btnID === "choice-btn-0") {
      _checkModeAndRemoveVocab();
      finalizeQuestionAndProceed(true);
    } 
    
    else if (_btnID === "choice-btn-1") {
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

    const _btnID = event.currentTarget.id;

    if (_btnID === "continueYes-0") {
      console.info("Clicked Yes");
      setQuestionMode("stored");
      _setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      continuetoStoredData();
    } 
    
    else if (_btnID === "continueNo-0") {
      console.info("Clicked No");
      _setRanOnce(false);
      restart();
    }
    console.groupEnd();
  }

  // Check q mode and decide whether to proceed to remove from the mistake bank
  function _checkModeAndRemoveVocab() {
    console.groupCollapsed("_checkModeAndRemoveVocab()");
    
    const _currentQuestionMode = readQuestionMode();

    if (_currentQuestionMode === "stored") { // if current q mode is stored and answer is right
      console.info("_currentQuestionMode: ", _currentQuestionMode, ".  removeFromMistakeBank() is called.");
      removeFromMistakeBank();
    } else {
      console.info("_currentQuestionMode: ", _currentQuestionMode, ".  No need to remove mistakes");
    }

    console.groupEnd();
  }

  function _toggleFadeAndDim(key) {
    const _shouldFade = [ "fadeOnly", "fadeAndDim", "overlay"].includes(key); 
    const _shouldDim = key === "fadeAndDim";
    const _shouldOverlay = key === "overlay";
    // If key: "fadeOnly", "fadeAndDim", or "overlay" => toggle 'fade-hide'
    // key: "fadeAndDim" => toggle 'so-dim'
    // key: "overlay" => toggle 'overlay-message'
    
    if (_shouldFade) {
      displayUtils.toggleClass('fade-hide', selectors.sectionMessage);
    }

    if (_shouldDim) {
      displayUtils.toggleClass('so-dim', selectors.sectionStatus, selectors.sectionAnswer);
    }

    if (_shouldOverlay) {
      displayUtils.toggleClass('overlay-message', selectors.sectionMessage);
    }

    if (!_shouldFade && !_shouldDim && !_shouldOverlay) {
      console.warn(`handleMultipleChoiceAnswer() - _toggleFadeAndDim() - invalid key: "${key}"`);
    }
  }

  return {
    setAnswerListnerManagerCallbacks,
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleFlashCardYesNoAnswer,
    handleContinueToStoredData,
  }
}
