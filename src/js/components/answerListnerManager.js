export function answerListnerManager(globals, utilsManager, questionMgr, loaderMgr, storeToMistakeBank, removeFromMistakeBank, answerMgr) {
  const { appState, selectors } = globals;
  const { domUtils, displayUtils } = utilsManager;

  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    //console.groupCollapsed("answerManager() - handleFlashcardFlip()");

    removeExistingButtons();
    fadeMessangeAndAnswer();

    setTimeout(() => {
      showContent("correctAns");    // Show correct answer
      showContent("message");       // Show Message
      showContent("yesNo");         // Show `Yes` `No` buttons
      fadeMessangeAndAnswer();
    }, 350);

    console.groupEnd();

    // utility functions private to the module
    function removeExistingButtons() { // Remove exiting buttons
      const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
      answerButtons.forEach(button => {
        displayUtils.toggleClass('fade-out-light', button);
        setTimeout(() => {
          button.remove();
        }, 350);
      });
    }

    function fadeMessangeAndAnswer() {
      displayUtils.toggleClass('fade-out-light', selectors.sectionMessage, selectors.sectionAnswer);
    }

    const CONTENT_CONFIG = {
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

    function showContent(key) {
      const config = CONTENT_CONFIG[key];
      if (!config) {
        console.warn(`handleFlashcardFlip() - showContent() - No config found for key: "${key}"`);
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
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {  // If the answer is CORRECT
      clearScreen("light");

      setTimeout(() => {
        toggleFadeAndDim("fadeAndDim");
        showContent("correct");
      }, 350);

      setTimeout(() => {
        toggleFadeAndDim("fadeAndDim");     // Hide fully
        clearScreen("deep");
        checkModeAndRemoveVocab();
        questionMgr.finalizeQuestionAndProceed(true);
      }, 1200);                             // Add delay equal to the fade-out transition duration
    } 
    
    else {                                  // If the answer is INCORRECT
        questionMgr.finalizeQuestionAndProceed(false);
        storeToMistakeBank(questionMgr); // add wrongly selected word to localstorage
        domUtils.clearScreen(selectors.sectionMessage);

        setTimeout(() => {
          showContent("incorrect");         // Show overlay "wrong" message
          toggleFadeAndDim("fadeOnly");

          setTimeout(() => {                 // Fully hide after fade-out completes (1s from .fade-out transition)
            toggleFadeAndDim("fadeOnly");    // Hide fully
          }, 1000);                          // Add delay equal to the fade-out transition duration
        }, 350);
           
    }
    console.groupEnd();

    // utility functions private to the module
    function getContentConfig() {
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

    function showContent(key) {
      const config = getContentConfig()[key];
      domUtils.buildNode({ 
        parent: selectors.sectionMessage, 
        child: 'div', 
        content: config.content, 
        className: config.className 
      });
    }

    function getClearConfig() {             // To avoide JS temporal dead zone (TDZ)
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

    function clearScreen(mode) {
      const config = getClearConfig()[mode]; // [sn26] 
      domUtils.clearScreen(config.target);
    }
  }

  // event handler for flashcard mode
  function handleFlashCardYesNoAnswer(event) { // sn4
    //console.groupCollapsed("answerManager() - handleFlashCardYesNoAnswer()");
    
    const btnID = event.currentTarget.id;

    if (btnID === "choice-btn-0") {
      checkModeAndRemoveVocab();
      questionMgr.finalizeQuestionAndProceed(true);
    } 
    
    else if (btnID === "choice-btn-1") {
      if (questionMgr.readQuestionMode !== "stored") {
        storeToMistakeBank(); // add wrongly selected word to localstorage
      } 

      questionMgr.finalizeQuestionAndProceed(false);
    }

    console.groupEnd();
  }

  // event handler at the end of 1st round of question, asking user whether they want to continue to storeddata
  function handleContinueToStoredData(event) {
    console.groupCollapsed("answerManager() - handleContinueToStoredData()");

    toggleFadeAndDim("overlay");

    const btnID = event.currentTarget.id;

    if (btnID === "continueYes-0") {
      console.info("Clicked Yes");
      questionMgr.setQuestionMode("stored");
      answerMgr.setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      loaderMgr.continuetoStoredData();
    } 
    
    else if (btnID === "continueNo-0") {
      console.info("Clicked No");
      answerMgr.setRanOnce(false);
      loaderMgr.restart();
    }
    console.groupEnd();
  }

  // Check q mode and decide whether to proceed to remove from the mistake bank
  function checkModeAndRemoveVocab() {
    console.groupCollapsed("checkModeAndRemoveVocab()");
    
    const currentQuestionMode = questionMgr.readQuestionMode;

    if (currentQuestionMode === "stored") { // if current q mode is stored and answer is right
      console.info("currentQuestionMode: ", currentQuestionMode, ".  removeFromMistakeBank() is called.");
      removeFromMistakeBank();
    } else {
      console.info("currentQuestionMode: ", currentQuestionMode, ".  No need to remove mistakes");
    }

    console.groupEnd();
  }

  function toggleFadeAndDim(key) {
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
      console.warn(`handleMultipleChoiceAnswer() - toggleFadeAndDim() - invalid key: "${key}"`);
    }
  }

  return {
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleFlashCardYesNoAnswer,
    handleContinueToStoredData,
  }
}
