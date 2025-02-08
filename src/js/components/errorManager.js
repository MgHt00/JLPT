export function errorManager(globals, utilsManager, answerMgr) {
  const { appState, selectors } = globals;
  const { domUtils } = utilsManager;

  const codeMapping = {
    iLoop: "infiniteloop",
    noSL: "syllable-error",
    mem0: "no-stored-data",
  };
  
  // to check various runtime errors and handle if necessary
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode:",errcode);

    switch (codeMapping[errcode]){
      // Infinite Loop Prevention: If selectedArray contains very few elements, 
      // the loop inside do...while of `createAnswerArray()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
      // ...but keeps failing due to duplicates. This is less likely, but worth checking.
      case "infiniteloop":
        const {selectedArray, noOfChoice} = fetchInputData();

        if (!appState.flashYesNo && selectedArray.length <= noOfChoice) {         // If flashYesNo is true → The entire condition is false, // ... and selectedArray.length <= noOfChoice is not evaluated.                                                                                        
          if (!document.querySelector("[id|='runtime-error']")) showError("iLoop"); // if error is not already shown
          console.groupEnd();
          return false;                        // Return false when there is an error
        } else {
          console.info("No runtime error: good to go!"); console.groupEnd();
          return true;                         // Return true when there is no error
        }

      case "syllable-error":
        if (!document.querySelector("[id|='syllable-error']")) showError("noSL");    // if error is not already shown
        return false;                          // Return false for syllable error case

      case "no-stored-data":
        if (!document.querySelector("[id|='memory-empty-error']")) showError("mem0");  // if error is not already shown
        break;
    }

    // utility functions private to the module
    function fetchInputData() {
      let selectedArray = answerMgr.vocabMapping[selectors.aChoice.value];
      let choiceInput = parseInt(appState.noOfAnswers, 10);
      let noOfChoice = Math.min(choiceInput, selectedArray.length);

      console.info("DATA: selectedArray:",selectedArray,"choiceInput:", choiceInput,"noOfChoice:", noOfChoice,"flashYesNo:", appState.flashYesNo);

      return { selectedArray, choiceInput, noOfChoice };
    }
  }

  // to show runtime error messages
  function showError(key) {
    console.groupCollapsed("showError()");

    const SHOW_ERROR_CONFIG = {
      iLoop: {
        errcode: "iLoop",
        parentName: selectors.settingNoOfAns,
        id: "runtime-error",
        cssClassName: "setting-error",
        errorMessage : "Not enough unique answers available. Please reduce the number of answer choices.",
        consoleMessage: "Runtime error: Not enough unique answers to generate.",
      },
      noSL: {
        errcode: "noSL",
        parentName: selectors.settingSyllable,
        id: 'syllable-error',
        cssClassName: "setting-error",
        errorMessage: 'Select at least one syllable',
        consoleMessage: "No syllables selected.",
      },
      mem0: {
        errcode: "mem0",
        parentName: selectors.settingRepractice,
        id: "memory-empty-error",
        cssClassName: "setting-error",
        errorMessage: 'Memory is empty for the moment, try practicing from the fresh start first.',
        consoleMessage: "Runtime error: Stored memory is empty.",
      },
    }

    const { parentName, id, cssClassName, errorMessage, consoleMessage } = SHOW_ERROR_CONFIG[key];    

    domUtils.buildNode({
      parent: parentName,
      child: 'div',
      content: errorMessage,
      className: cssClassName,
      idName: id,
    });
    console.warn(consoleMessage);

    console.groupEnd();
    return this;
  }
  
  return {  
    runtimeError,
    showError,
  }
}
