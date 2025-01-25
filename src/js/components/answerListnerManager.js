import { appState } from "../services/globals.js";
export function answerListnerManager(questionMgr, loaderInstance) {
  // Event handler for flashcard mode
  function handleFlashcardFlip() {
    //console.groupCollapsed("answerManager() - handleFlashcardFlip()");

    // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      toggleClass('fade-out-light', button);
      setTimeout(() => {
        button.remove();
      }, 350);
    });
    
    toggleClass('fade-out-light', sectionMessage, sectionAnswer);

    setTimeout(() => {
      // Show correct answer
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: appState.correctAns,
        className: 'flash-correct-answer',
        idName: 'correct-answer'
      });

      // Show Message
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: 'Did you get it right?',
        className: 'answer-message',
        idName: 'answer-message'
      });

      // Show `Yes` `No` buttons
      buildNode({
        parent: sectionAnswer,
        child: 'div',
        content: ['Yes', 'No'],
        className: 'answer-btn',
        idName: 'choice-btn',
        eventFunction: handleFlashCardYesNoAnswer
      });

      toggleClass('fade-out-light', sectionMessage, sectionAnswer);

    }, 350);

    console.groupEnd();
  }

  // event handler for multiple choice mode
  function handleMultipleChoiceAnswer(event) {
    //console.groupCollapsed("answerManager() - handleMultipleChoiceAnswer()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen(sectionMessage);

      setTimeout(() => {
        toggleClass('fade-hide', sectionMessage);
        toggleClass('so-dim', sectionStatus, sectionAnswer);
        buildNode({
          parent: sectionMessage,
          child: 'div',
          content: 'Correct',
          className: 'mcq-correct-answer'
        });
      }, 350);

      setTimeout(() => {
        toggleClass('fade-hide', sectionMessage); // Hide fully
        toggleClass('so-dim', sectionStatus, sectionAnswer);
        clearScreen([sectionStatus, sectionQuestion, sectionMessage, sectionAnswer]);
        checkModeAndRemoveVocab();
        questionMgr.finalizeQuestionAndProceed(true);
      }, 1200); // Add delay equal to the fade-out transition duration (0.5s)
    } 
    
    else {
        questionMgr.finalizeQuestionAndProceed(false);
        vocabMgr.storeToMistakeBank(questionMgr); // add wrongly selected word to localstorage
        clearScreen(sectionMessage);

        setTimeout(() => {
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

    toggleClass('fade-hide', sectionMessage);
    toggleClass('overlay-message', sectionMessage);

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      console.log("Clicked Yes");
      questionMgr.setQuestionMode("stored");
      answerMgr.setRanOnce(true); // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      //console.info("noMoreQuestion.ranOnce CHANGED :", answerMgr.noMoreQuestion.ranOnce);
      loaderInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      console.log("Clicked No");
      answerMgr.setRanOnce(false);
      loaderInstance.restart();
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
