export function errorManager(globals, answerMgr) {
  const { appState, selectors } = globals;
  const codeMapping = {
    iLoop: "infiniteloop",
    noSL: "syllable-error",
    mem0: "no-stored-data",
  };
  
  // to check various runtime errors and handle if necessary
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode: ", errcode);

    switch (codeMapping[errcode]){
      case "infiniteloop":
        let selectedArray = answerMgr.vocabMapping[selectors.aChoice.value];
        let choiceInput = parseInt(appState.noOfAnswers, 10);
        let noOfChoice = Math.min(choiceInput, selectedArray.length);

        console.info("selectedArray :", selectedArray);
        console.info("choiceInput :", choiceInput);
        console.info("noOfChoice: ", noOfChoice);

        // Infinite Loop Prevention: If selectedArray contains very few elements, 
        // the loop inside do...while of `createAnswerArray()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
        // but keeps failing due to duplicates. This is less likely, but worth checking.

        if (selectedArray.length <= noOfChoice) {
          console.error("Not enough unique answers to generate.");

          if (!document.querySelector("[id|='runtime-error']")) { // if error is not already shown
            showError({
              errcode: "iLoop",
              parentName: selectors.settingNoOfAns,
              idName: "runtime-error"
            });
          }
          console.groupEnd();
          return false; // Return false when there is an error
        } else {
          console.info("No runtime error: good to go!");
          console.groupEnd();
          return true; // Return true when there is no error
        }
        break;

      case "syllable-error":
        if (!document.querySelector("[id|='syllable-error']")) { // if error is not already shown
          console.info("we are inside syllable-error => if blk");
          showError({
            errcode: "noSL",
            parentName: selectors.settingSyllable,
            idName: 'syllable-error',
          });
        }
        return false; // Return false for syllable error case
        break;

      case "no-stored-data":
        if (!document.querySelector("[id|='memory-empty-error']")) { // if error is not already shown
          showError({
            errcode: "mem0",
            parentName: selectors.settingRepractice,
            idName: "memory-empty-error"
          });
        }
        break;
    }
  }

  // to show runtime error messages
  function showError({ errcode, parentName, idName }) {
    console.groupCollapsed("showError()");
    
    const classNameMapping = {
      iLoop: "setting-error",
      noSL: "setting-error",
      mem0: "setting-error",
    };

    let errorMessage = "";
    
    if (codeMapping[errcode] === "infiniteloop") {
        console.warn("Runtime error: Not enough unique answers to generate.");
        errorMessage = `
            Not enough unique answers available. 
            Please reduce the number of answer choices.
        `;
    }

    else if (codeMapping[errcode] === "syllable-error") {
      console.error("No syllables selected.");
        errorMessage = `
            Select at least one syllable
        `;
    }

    else if (codeMapping[errcode] === "no-stored-data") {
      console.warn("Runtime error: Stored memory is empty.");
      errorMessage = `
          Memory is empty for the moment, try practicing from the fresh start first.
      `;
    }

    buildNode({ 
      parent: parentName, 
      child: 'div', 
      content: errorMessage, 
      className: classNameMapping[errcode],
      idName: idName,
  });
  console.groupEnd();
  return this;
}
  
  return {  
    runtimeError,
    showError,
  }
}
