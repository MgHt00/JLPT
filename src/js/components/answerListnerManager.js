export function answerListnerManager(globals, utilsManager, questionMgr, loaderMgr, vocabMgr) {
  const { appState, selectors } = globals;
  const { domUtils, displayUtils } = utilsManager;

  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    //console.groupCollapsed("answerManager() - handleFlashcardFlip()");

    removeExistingButtons();
    
    displayUtils.toggleClass('fade-out-light', selectors.sectionMessage, selectors.sectionAnswer);

    setTimeout(() => {
      // Show correct answer
      domUtils.buildNode({
        parent: selectors.sectionAnswer,
        child: 'div',
        content: appState.correctAns,
        className: 'flash-correct-answer',
        id: 'correct-answer'
      });

      // Show Message
      domUtils.buildNode({
        parent: selectors.sectionAnswer,
        child: 'div',
        content: 'Did you get it right?',
        className: 'answer-message',
        id: 'answer-message'
      });

      // Show `Yes` `No` buttons
      domUtils.buildNode({
        parent: selectors.sectionAnswer,
        child: 'div',
        content: ['Yes', 'No'],
        className: 'answer-btn',
        id: 'choice-btn',
        eventFunction: handleFlashCardYesNoAnswer
      });

      displayUtils.toggleClass('fade-out-light', selectors.sectionMessage, selectors.sectionAnswer);

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

    function showContent() {
      const CONFIG = {
        correctAns: {
          parent: selectors.sectionAnswer,
          child: 'div',
          content: appState.correctAns,
          className: 'flash-correct-answer',
          id: 'correct-answer'
        },
        info: {
          parent: selectors.sectionAnswer,
          child: 'div',
          content: 'Did you get it right?',
          className: 'answer-message',
          id: 'answer-message'
        },
        yesNO: {
          parent: selectors.sectionAnswer,
          child: 'div',
          content: ['Yes', 'No'],
          className: 'answer-btn',
          id: 'choice-btn',
          eventFunction: handleFlashCardYesNoAnswer
        },
      }
    }
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      domUtils.clearScreen(selectors.sectionMessage);

      setTimeout(() => {
        displayUtils.toggleClass('fade-hide', selectors.sectionMessage);
        displayUtils.toggleClass('so-dim', selectors.sectionStatus, selectors.sectionAnswer);
        domUtils.buildNode({
          parent: selectors.sectionMessage,
          child: 'div',
          content: 'Correct',
          className: 'mcq-correct-answer'
        });
      }, 350);

      setTimeout(() => {
        displayUtils.toggleClass('fade-hide', selectors.sectionMessage); // Hide fully
        displayUtils.toggleClass('so-dim', selectors.sectionStatus, selectors.sectionAnswer);
        domUtils.clearScreen([selectors.sectionStatus, selectors.sectionQuestion, selectors.sectionMessage, selectors.sectionAnswer]);
        checkModeAndRemoveVocab();
        questionMgr.finalizeQuestionAndProceed(true);
      }, 1200); // Add delay equal to the fade-out transition duration (0.5s)
    } 
    
    else {
        questionMgr.finalizeQuestionAndProceed(false);
        vocabMgr.storeToMistakeBank(questionMgr); // add wrongly selected word to localstorage
        domUtils.clearScreen(selectors.sectionMessage);

        setTimeout(() => {
          domUtils.buildNode({ 
            parent: selectors.sectionMessage, 
            child: 'div', 
            content: 'Keep Trying', 
            className: 'wrong-answer' 
          });

          // Show overlay "wrong" message
          displayUtils.toggleClass('fade-hide', selectors.sectionMessage); 

          // Fully hide after fade-out completes (0.5s from .fade-out transition)
          setTimeout(() => {
              displayUtils.toggleClass('fade-hide', selectors.sectionMessage); // Hide fully
          }, 1000); // Add delay equal to the fade-out transition duration (0.5s)
        }, 350);
           
    }
    console.groupEnd();
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
        vocabMgr.storeToMistakeBank(); // add wrongly selected word to localstorage
      } 

      questionMgr.finalizeQuestionAndProceed(false);
    }

    console.groupEnd();
  }

  // event handler at the end of 1st round of question, asking user whether they want to continue to storeddata
  function handleContinueToStoredData(event) {
    console.groupCollapsed("answerManager() - handleContinueToStoredData()");

    displayUtils.toggleClass('fade-hide', selectors.sectionMessage);
    displayUtils.toggleClass('overlay-message', selectors.sectionMessage);

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      console.log("Clicked Yes");
      questionMgr.setQuestionMode("stored");
      answerMgr.setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      //console.info("noMoreQuestion.ranOnce CHANGED :", answerMgr.noMoreQuestion.ranOnce);
      loaderMgr.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      console.log("Clicked No");
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
      vocabMgr.removeFromMistakeBank();
    } else {
      console.info("currentQuestionMode: ", currentQuestionMode, ".  No need to remove mistakes");
    }

    console.groupEnd();
  }

  return {
    handleFlashcardFlip,
    handleMultipleChoiceAnswer,
    handleFlashCardYesNoAnswer,
    handleContinueToStoredData,
  }
}
