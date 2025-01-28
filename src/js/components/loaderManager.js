export function loaderManager(globals, utilsManager, listenerMgr, controlMgr, questionMgr, vocabMgr, errorMgr, statusMgr) {
  const { defaultConfig, appState, appData, currentStatus, selectors } = globals;
  const { helpers, domUtils, displayUtils } = utilsManager;
  
  /**
   * Sets the instances of the control, question, vocabulary, error, and status managers.
   * 
   * @param {object} controlMgr - The control manager instance responsible for UI control actions.
   * @param {object} questionInstance - The question manager instance handling question logic.
   * @param {object} vocabInstance - The vocabulary manager instance managing vocabulary data.
   * @param {object} errMgr - The error manager instance handling runtime errors.
   * @param {object} statusMgr - The status manager instance tracking quiz progress and stats.
  */
  function setInstances(controlInstance, questionInstance, vocabInstance, errorInstance, statusInstance) {
    controlMgr = controlInstance;
    questionMgr = questionInstance;
    vocabMgr = vocabInstance;
    errorMgr = errorInstance;
    statusMgr = statusInstance;
  }

  const syllableMapping = {
    a: "../../../assets/data/n5-vocab-a.json",
    i: "../../../assets/data/n5-vocab-i.json",
    u: "../../../assets/data/n5-vocab-u.json",
    e: "../../../assets/data/n5-vocab-e.json",
    o: "../../../assets/data/n5-vocab-o.json",
    ka: "../../../assets/data/n5-vocab-ka.json",
    ki: "../../../assets/data/n5-vocab-ki.json",
    ku: "../../../assets/data/n5-vocab-ku.json",
    ke: "../../../assets/data/n5-vocab-ke.json",
    ko: "../../../assets/data/n5-vocab-ko.json",
    sa: "../../../assets/data/n5-vocab-sa.json",
    shi: "../../../assets/data/n5-vocab-shi.json",
    //db: "N5/vocab/assets/data/n5-vocab-debug.json",
  };

  // when user click submit(start) button of the setting form
  async function start(e) {  
    e.preventDefault(); // Prevent form from submitting the usual way
    validateAndSetInputData(e); // validate and set defaults to the input data.

    if (appState.qMode === "stored") {
      if(!validateStoredMemory()) {
        errorMgr.runtimeError("mem0");
        return;
      }
      // Continue if there is no runtime error.
      await loadStoredJSON();// Wait for loadStoredJSON to complete
      initializeQuiz();
    }
       
    if (appState.qMode === "fresh") {
      if (validateSyllable()) {
        await loadFreshJSON(); // Wait for loadFreshJSON to complete

        // Only check the runtime error if validateSyllable() returns true ...
        // ... Otherwise program shows infinite loop error without necessary.
        const hasSufficientAnswers = errorMgr.runtimeError("iLoop"); // If vocab pool is too small that it is causing the infinite loop    
        if (!hasSufficientAnswers) {  // Now checks if there is NOT a runtime error
          console.error("Program failed at loaderManager()");
          return; // Exit if there is an infinite loop error
        }
        
        // Continue if there is no runtime error.
        initializeQuiz();
      }
    } 
  }

  // Function to initialize quiz settings and UI setup
  function initializeQuiz() {
    listenerMgr.moveForm();
    
    controlMgr.floatingBtnsHideAll()
              .toggleFormDisplay()
              .hideResumeShowBack();

    statusMgr .resetQuestionCount()
              .resetTotalNoOfQuestion()
              .getTotalNoOfQuestions("fresh"); // for status bar, reset and set No. of Question
              
    statusMgr.resetCumulativeVariables(); // reset cumulative variables (cannot use method chaining with `getTotalNoOfQuestion()`)

    questionMgr.newQuestion();
    
    removeErrBlks();
  }

  // to validate input data and set defaults if necessary
  function validateAndSetInputData(e) {
    console.groupCollapsed("validateAndSetInputData()");

    validateToggleSwitch(['randomYesNo', 'flashYesNo']);
    validateAndSetAnswerCount(); // Validate number of answers and set default if invalid
    validateAndSetQuestionMode(); // Validate question mode and set default
    
    helpers.assignLanguage(selectors.sectionMessage, defaultConfig.enLang); // Always set message section to English

    appState.qChoiceInput = selectors.readqChoiceInput ?? "hi";
    appState.aChoiceInput = selectors.readaChoiceInput ?? "en";

    assignLanguageBySelection(); // Validate and assign the correct language for the question and answer sections

    console.info("appState.qChoiceInput: ", appState.qChoiceInput, "appState.aChoiceInput: ", appState.aChoiceInput);
    
    console.groupEnd();
  }
  
  // to load user selected sylable-json when program mode is "fresh"
  async function loadFreshJSON() {
    console.groupCollapsed("loadFreshJSON()");

    questionMgr.setQuestionMode("fresh");
  
    // if user selects "all", load all property names from `syllableMapping`
    if (appData.syllableChoice.includes("all")) {
      // Dynamically get all syllable keys from syllableMapping
      appData.syllableChoice = Object.keys(syllableMapping); // [sn9] This replaces syllableChoice with all syllables
    }
    
    // Create an array of Promises
    const promises = appData.syllableChoice.map(element => {
      let selectedJSON = syllableMapping[element];
      return fetch(selectedJSON).then(response => response.json());
    });

    const results = await Promise.all(promises);
    appData.vocabArray = results.flat();

    // if the question is blank (no kanji character etc.), remove it
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);

    helpers.copyOneProperty(appData.vocabArray, appData.kaVocab, defaultConfig.ka);
    helpers.copyOneProperty(appData.vocabArray, appData.hiVocab, defaultConfig.hi);
    helpers.copyOneProperty(appData.vocabArray, appData.enVocab, defaultConfig.en);

    console.groupEnd();
  }

  // to load local storage json when program mode is "stored"
  async function loadStoredJSON() {
    console.groupCollapsed("loadStoredJSON()");

    questionMgr.setQuestionMode("stored");
    
    // Ensure loadMistakesFromMistakeBank returns an array
    const storedData = vocabMgr.loadMistakesFromMistakeBank();
    if (!Array.isArray(storedData)) {
        console.error("Error: Stored data is not an array! Check your loadMistakesFromMistakeBank function.");
        return;
    }
    
    // Assign storedData to appData.vocabArray
    appData.vocabArray = storedData;
    console.log("vocabArray(before removeBlankQuestion(): ", appData.vocabArray);
    
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);
    
    // Check if the array is empty
    console.log("Inside loadStoredJSON(), vocabArray.length: ", appData.vocabArray.length);
    if (appData.vocabArray.length === 0) {
        console.error("Error: vocabArray is empty after loading stored data!");
        return;
    }

    // Fetch the relevant categories
    helpers.copyOneProperty(appData.vocabArray, appData.kaVocab, defaultConfig.ka);
    helpers.copyOneProperty(appData.vocabArray, appData.hiVocab, defaultConfig.hi);
    helpers.copyOneProperty(appData.vocabArray, appData.enVocab, defaultConfig.en);

    console.groupEnd();
  }

  // to resume the existing program
  function resumeProgram() {
    console.groupCollapsed("resumeProgram()");

    vocabMgr.loadState();
    console.log("loadState: ", appState, appData, currentStatus);

    // Fetch the relevant categories
    helpers.copyOneProperty(appData.vocabArray, appData.kaVocab, defaultConfig.ka);
    helpers.copyOneProperty(appData.vocabArray, appData.hiVocab, defaultConfig.hi);
    helpers.copyOneProperty(appData.vocabArray, appData.enVocab, defaultConfig.en);

    assignLanguageBySelection();

    questionMgr.newQuestion();

    console.groupEnd();
  }

  // there are some questions without kanji, this function is to remove if user select the
  // question option to kanji and to prevent showing blank question on screen
  function removeBlankQuestions(originalArr) {
    //console.groupCollapsed("removeBlankQuestions()");
    let updatedArr = [];
    for (let i of originalArr) {
      if (appState.qChoiceInput && i[appState.qChoiceInput] !== "") {
        updatedArr.push(i);
      }
    }

    console.groupEnd();
    return updatedArr; // Return the updated array
  }

  // to load stored data from local storage and show info at the settings
  function loadMemoryData() {
    console.groupCollapsed("loadMemoryData");

    let storedLength = vocabMgr.readStoredLength;
    console.info("storedLength:", storedLength);

    // building `mistake status` on home screen
    switch (storedLength) {
      case 0:
        buildMemoryStatus('Memory is empty.');
        break;
      case 1:
        buildMemoryStatus(`${storedLength} word to repractice.`);
        break;
      default:
        buildMemoryStatus(`There are ${storedLength} words to repractice.`);
        break;
    }
    
    // build `flush` and `list` buttons
    buildMemoryBtns("flush");
    buildMemoryBtns("list");
    
    console.groupEnd();
    return this;

    // utility functions private to the module
    function buildMemoryStatus(content) {
      domUtils.buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: content,
        className: 'memory-info',
        idName: 'memory-info',
      });
    }

    function buildMemoryBtns(key) {
      const faClassMapping = {
        flush: '<i class="fa-solid fa-trash-can"></i>',
        list: '<i class="fa-solid fa-rectangle-list"></i>',
      }
      const handlerMapping = {
        flush: vocabMgr.flushMistakeBank,
        list: listenerMgr.handleListMistakeBtn,
      }

      domUtils.buildNode({
        parent: selectors.memoryBtns,
        child: 'div',
        content: faClassMapping[key],
        className: `${key}-memory-setting-btn`,
        idName: `${key}-memory-btn`,
        eventFunction: handlerMapping[key],
      });
    }
  }

  // Validate (setting's) number of answers and set default if invalid
  function validateAndSetAnswerCount() {
    console.groupCollapsed("validateAndSetAnswerCount()");
  
    const noOfAnswers = parseInt(selectors.readNoOfAns, 10);
    if (isNaN(noOfAnswers) || noOfAnswers < 2 || noOfAnswers > 4) {
      appState.noOfAnswers = 2; // Default to 2 answers
      console.warn("Invalid number of answers. Setting default to 2.");
    } else {
      appState.noOfAnswers = noOfAnswers;
    }
    console.info("appState.noOfAnswers: ", appState.noOfAnswers);
    console.groupEnd();
    return this;
  }

  // Validate (setting's) question mode and set default
  function validateAndSetQuestionMode() {
    console.groupCollapsed("validateAndSetQuestionMode()");

    appState.qMode = selectors.readQuestionMode;

    const validModes = ["fresh", "stored"];
    if (!validModes.includes(selectors.readQuestionMode)) {
      appState.qMode = "fresh"; // Default to 'fresh'
      console.warn("Invalid question mode. Defaulting to 'fresh'.");
    } else {
      appState.qMode = selectors.readQuestionMode;
    }
    console.info("appState.qMode: ", appState.qMode);
    console.groupEnd();
    return this;
  }

  // Validate and assign the correct language for the (HTML's) question and answer sections
  function assignLanguageBySelection() {
    const jpLanguages = ["hi", "ka"];

    if(jpLanguages.includes(appState.qChoiceInput)) {
      helpers.assignLanguage(selectors.sectionQuestion, defaultConfig.jpLang);
    } else {
      helpers.assignLanguage(selectors.sectionQuestion, defaultConfig.enLang);
    }

    if(jpLanguages.includes(appState.aChoiceInput)) {
      helpers.assignLanguage(selectors.sectionAnswer, defaultConfig.jpLang);
    } else {
      helpers.assignLanguage(selectors.sectionAnswer, defaultConfig.enLang);
    }

    helpers.assignLanguage(selectors.sectionMessage, defaultConfig.enLang);

    return this;
  }

  // Vvalidate syllable choices and show error if necessary
  function validateSyllable() {
    console.groupCollapsed("validateSyllable()");
    // Validate syllable choices and show an error if none are selected
    appData.syllableChoice = helpers.convertCheckedValuesToArray('input[name="syllableChoice"]:checked');
    if (appState.qMode === "fresh" && appData.syllableChoice.length === 0) {
      errorMgr.runtimeError("noSL");
      console.groupEnd();
      return false; // Signal that inputData validation failed
    }
    console.info("appData.syllableChoice: ", appData.syllableChoice);
    console.groupEnd();
    return true;
  }

  // Convert the string values "true"/"false" to boolean values
  function convertToBoolean(selectorNames) {
    console.groupCollapsed("convertToBoolean()");
    
    if (selectorNames.length === 0) {
      console.error("No values to convert to boolean");
      return;
    }
  
    for (let selectorName of selectorNames) {
      // Convert and assign the boolean value
      appState[selectorName] = selectors[`read${selectorName}`] === 'true';
      console.info(`appState.${selectorName}: `, appState[selectorName]);

      /* THE LOGIC BEHIND (Please do not delete)
      appState.randomYesNo = selectors.readrandomYesNo === 'true';
      console.info("appState.randomYesNo: ",appState.randomYesNo);

      Convert the string values "true"/"false" to boolean values [sn16]

      appState.flashYesNo = selectors.readflashYesNo === 'true';
      console.info("appState.flashYesNo: ", appState.flashYesNo);
      */
    }
    
    console.groupEnd();
    return this;
  }

  // To validate toggle switch data
  function validateToggleSwitch(selectorNames) {
    console.groupCollapsed("validateToggleSwitch()");

    console.info("Parameters: ", selectorNames);

    for (let selectorName of selectorNames) {
      if (appState[selectorName] === null) {
        appState[selectorName] = false;
        console.warn(`${appState[selectorName]} is null. Resetting to false.`);
      }
      else if (appState[selectorName] !== true && appState[selectorName] !== false) {
        appState[selectorName] = false;
        console.warn(`${appState[selectorName]} is neither true nor false. Resetting to false.`);
      }
      else {
        console.info(`${selectorName} is good to go.  Current value: ${appState[selectorName]}`);
      }
    }
    console.groupEnd();
  }

  // To validate whether is memory is empty or not
  function validateStoredMemory() {
    let storedLength = vocabMgr.readStoredLength;
    if (storedLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  // to print local storage data on screen
  function rePrintMemory() {
    //console.groupCollapsed("rePrintMemory()");

    domUtils.clearNode({ parent: selectors.memoryInfo });
    domUtils.clearNode({ parent: selectors.memoryBtns });
    loadMemoryData()

    console.groupEnd();
  }
  
  // If user wants to continue to local storage after their initial syllable selections
  async function continuetoStoredData() {
    console.groupCollapsed("continuetoStoredData()");

    if (vocabMgr.readStoredLength <= 3) {
      appState.noOfAnswers = 2; // if stored data pool is too small, it will lead to an infinite loop.
      console.warn("StoredJSON pool is too small. noOfAnswer set to `2`");
    }
    await loadStoredJSON();// Wait for loadStoredJSON to complete

    statusMgr.getTotalNoOfQuestions("stored");
    questionMgr.newQuestion();

    console.groupEnd();
  }

  // When user want to restart the program
  function restart() {
    domUtils.clearScreen(selectors.sectionStatus);
    
    displayUtils.toggleClass('overlay-message', selectors.sectionMessage)
                .toggleClass('fade-hide', selectors.sectionMessage);

    controlMgr.toggleFormDisplay();
    listenerMgr.debouncedMoveForm();
    
    rePrintMemory();
  }

  // To list mistakes from stored data
  function listMistakes() {
    console.groupCollapsed("listMistakes()");

    const mistakeArray = vocabMgr.loadMistakesFromMistakeBank(); // Load mistakes from localStorage
    
    // Create the container to display the mistakes
    domUtils.buildNode({
      parent: selectors.sectionQuestion,
      child: 'div',
      content: '',
      className: 'mistake-list-container', // New class for the container
      idName: 'mistake-list-div',
    });
  
    // Now that the mistake-list-container is created, select it
    const mistakeListContainer = document.querySelector("#mistake-list-div-0");
  
    // Header for the mistake list (4 columns: #, Kanji, Hiragana, English)
    const headerContent = ['#', 'Kanji', 'Hiragana', 'English'];
  
    // Build the row for headers
    domUtils.buildNode({
      parent: mistakeListContainer,
      child: 'div',
      content: '', // Empty content, as we'll append children later
      className: 'mistakes-row-header', 
      idName: 'mistakes-heading',
    });
  
    // Now, select the newly created header div
    const mistakeHeading = document.querySelector("#mistakes-heading-0");
    
    // Append header columns inside the header div
    headerContent.forEach((content) => {
      domUtils.buildNode({
        parent: mistakeHeading, // Append to the header div
        child: 'div',
        content: content, // Assign each header title
        className: ['mistakes-column-header', 'en'], // Class for header columns
        id: 'mistake-column-header',
      });
    });

    // Iterate over the mistakeArray and create rows for each mistake
    mistakeArray.forEach((mistake, index) => {  
      // Create a container div for each row
      domUtils.buildNode({
        parent: mistakeListContainer,
        child: 'div',
        content: '',
        className: 'mistakes-row', // Styling class for row
        idName: `mistakeList-row-${index}`, // Unique ID for each row
      });

      // Now, select the newly created mistake-row
      //const mistakeListRow = document.querySelector("[id^='mistakeList-row']");
      const mistakeListRow = document.querySelector(`#mistakeList-row-${index}-0`);
      
      // Prepare contents for each row
      const rowContent = [index + 1, mistake.ka, mistake.hi, mistake.en];

      // Append each column (with content) to the newly created mistake-row
      rowContent.forEach((content, index) => {
        // Set en/jp className depending on the index
        let classNameByIndex;
        switch (index) {
          case 3:
            classNameByIndex = 'en';
            break;
          default:
            classNameByIndex = 'jp';
            break;
        }

        domUtils.buildNode({
          parent: mistakeListRow,
          child: 'div',
          content: content, // Assign content to each column
          className: ['mistakes-column', classNameByIndex], // Class for each column
        });
      });
    });
 
    console.groupEnd();
  }

  // Reset after flushing mistake bank
  function resetAfterFlushingMistakes() {
    displayUtils.toggleClass('disabled', 
      selectors.settingRepractice, 
      selectors.settingSyllable
    );
    document.querySelector("#source-fresh").checked = true; // Set the 'source-fresh' radio input to checked
    return this;
  }

  // To remove error messages after "Start New" is clicked
  function removeErrBlks() {
    console.groupCollapsed("cleanUpErrMsgs()");
    const errBlocks = [document.querySelector("[id|='syllable-error']"), document.querySelector("[id|='runtime-error']")];
    errBlocks.forEach((blk) => {
      if (blk){
        console.info("Error block found");
        blk.remove();
      }
    });
    console.groupEnd();
  }

  return {
    setInstances,
    start,
    loadMemoryData,
    loadStoredJSON,
    validateAndSetAnswerCount,
    rePrintMemory,
    continuetoStoredData,
    restart,
    listMistakes,
    resumeProgram,
    resetAfterFlushingMistakes,
    removeErrBlks,
  }
}
