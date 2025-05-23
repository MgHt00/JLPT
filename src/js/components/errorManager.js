import { VOCAB_MAPPING } from "../constants/appConstants.js";
import { CSS_CLASS_NAMES } from "../constants/cssClassNames.js";
import { GENERATED_DOM } from "../constants/elementIDs.js";

export function errorManager(globals, utilsManager) {
  const { appState, selectors } = globals;
  const { domUtils } = utilsManager;

  const codeMapping = {
    iLoop: "infiniteloop",
    noSL: "syllable-error",
    mem0: "memory-empty-error",
    // Infinite Loop Prevention: If selectedArray contains very few elements, 
    // ... the loop inside do...while of `createAnswerArray()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
    // ... but keeps failing due to duplicates. This is less likely, but worth checking.
  };
  
  // To check various runtime errors and handle if necessary
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode:",errcode);

    const handlers = {
      "infiniteloop": () => {
        const {selectedArray, noOfChoice} = fetchInputData();

        if (!appState.flashYesNo && selectedArray.length < noOfChoice) {             // If flashYesNo is true → The entire condition is false, // ... and selectedArray.length <= noOfChoice is not evaluated.                                                                                        
          if (!domUtils.checkNode({ id: codeMapping[errcode] })) showError("iLoop"); // if error is not already shown  
          console.groupEnd();
          return false;                        // Return false when there is an error
        } else {
          console.info("No runtime error: good to go!"); console.groupEnd();
          return true;                         // Return true when there is no error
        }
      },
      
      "syllable-error": () => {
        if (!domUtils.checkNode({ id: codeMapping[errcode] })) showError("noSL");   // if error is not already shown
        return false;                          // Return false for syllable error case
      },

      "memory-empty-error": () => {
        if (!domUtils.checkNode({ id: codeMapping[errcode] })) showError("mem0");   // if error is not already shown
      },
    }

    return handlers[codeMapping[errcode]]?.() ?? console.warn("Unknown error code:", errcode); // ?? => first-defined operator (right operand returns if left returns nullish)


    // utility functions private to the module
    function fetchInputData() {
      const selectedArray = VOCAB_MAPPING[selectors.aChoice.value];
      const choiceInput = parseInt(appState.noOfAnswers, 10);
      const noOfChoice = Math.min(choiceInput, selectedArray.length);

      console.info("DATA:", { selectedArray, choiceInput, noOfChoice, flashYesNo: appState.flashYesNo });

      return { selectedArray, choiceInput, noOfChoice };
    }

    function errorAlreadyExists(key){
      return !!document.querySelector(`[id|='${codeMapping[key]}']`);  // true → Error block exists. !! ensures a strict boolean return[] [sn25]
    }
  }

  // To show runtime error messages
  function showError(key) {
    console.groupCollapsed("showError()");

    const ERROR_CONFIG = {
      iLoop: {
        parentName: selectors.settingNoOfAns,
        id: "infiniteloop",
        errorMessage : "Not enough unique answers available. Please reduce the number of answer choices.",
        consoleMessage: "Runtime error: Not enough unique answers to generate.",
      },
      noSL: {
        parentName: selectors.settingSyllable,
        id: 'syllable-error',
        errorMessage: 'Select at least one syllable',
        consoleMessage: "No syllables selected.",
      },
      mem0: {
        parentName: selectors.settingRepractice,
        id: "memory-empty-error",
        errorMessage: 'Memory is empty for the moment, try practicing from the fresh start first.',
        consoleMessage: "Runtime error: Stored memory is empty.",
      },
    }

    const config = ERROR_CONFIG[key];

    if (!config) {
      console.warn("Unknow error key:",key); console.groupEnd();
      return;
    }

    domUtils.buildNode({
      parent: config.parentName,
      child: 'div',
      content: config.errorMessage,
      className: CSS_CLASS_NAMES.SETTING_ERROR,
      id: config.id,
    });
    console.warn(config.consoleMessage);

    console.groupEnd();
    return this;
  }

  function clearError() {
    console.groupCollapsed("clearError()");

    const errBlocks = [
      document.querySelector(`[id|=${GENERATED_DOM.INFINITE_LOOP}]`), 
      document.querySelector(`[id|=${GENERATED_DOM.SYLLABLE_ERROR}]`), 
    ];

    errBlocks.forEach((blk) => {  // check whether there is an error message on screen
      if (blk){
        console.info("Error block found");
        blk.remove();
      }
    });
    console.groupEnd();
  }
  
  return {  
    runtimeError,
    showError,
    clearError,
  }
}
