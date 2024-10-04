const loaderInstance = loaderManager();
const listenerInstance = listenerManager();
const vocabInstance = vocabManager();
const errorInstance = errorManager();
const statusInstance = statusManager();

(function defaultState() {
  loaderInstance.loadMemoryData();
  flipNodeState(...selectors.noOfAnsAll); // [sn14]
  toggleClass('hide', selectors.bringBackBtn);
  toggleClass('disabled', selectors.settingRepractice);
  listenerInstance.generalListeners();
  listenerInstance.handlebringBackBtn();
  console.groupEnd();
})();


function listenerManager() {
  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  // All event Listeners
  function generalListeners() {
    selectors.settingForm.addEventListener('submit', loaderInstance.start); // [sn17]
    selectors.fieldsetSyllable.addEventListener('change', syllableChanges);
    selectors.qChoice.addEventListener('change', buildAnswerOptions);
    selectors.settingFlashYesNo.addEventListener('change', flashModeChanges);
    selectors.settingSource.addEventListener('change', questionModeChanges);
  }
  
  // to handle when syllable checkboxs are changed
  function syllableChanges(event) { // [le4]
    const allCheckbox = document.getElementById('syllableAll');
    const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
      .filter(checkbox => checkbox !== allCheckbox);

    if (checkNode({ idName: 'syllable-error' })) {
      clearNode({
        parent: selectors.fieldsetSyllable,
        children: Array.from(document.querySelectorAll('div[id^="syllable-error"]'))
      });
    }

    if (event.target === allCheckbox) {
      if (allCheckbox.checked) {
        otherCheckboxes.forEach(checkbox => {
          checkbox.disabled = true;
          checkbox.checked = false; // Uncheck the others if "All" is checked
        });
      } else {
        otherCheckboxes.forEach(checkbox => checkbox.disabled = false);
      }
    } else {
      if (event.target.checked) { //[sn8]
        allCheckbox.disabled = true;
        allCheckbox.checked = false; // Uncheck "All" if any other is checked
      } else {
        const anyChecked = otherCheckboxes.some(checkbox => checkbox.checked);
        if (!anyChecked) {
          allCheckbox.disabled = false;
          allCheckbox.checked = true; // check "All" if nothing is checked
        }
      }
    }
  }
   
  // to handle when flash mode radio buttons are changed
  function flashModeChanges(e) {
    console.groupCollapsed("flashModeChanges()");
    flipNodeState(...selectors.noOfAnsAll);
    
    // set noOfAns to 2 to bypass runtime error if flashcard mode is selected
    if (selectors.readFlashYesNo) {
      console.info("Flashcard mode is selected.");
      console.warn("noOfAnswers set to `2` to avoid runtime error");
      appState.noOfAnswers = 2;
    } else {
      // Validate number of answers and set default if invalid
      loaderInstance.validateAndSetAnswerCount();
    }
    console.groupEnd();
  }

  // to handle when program question mode (fresh / stored) is changed
  function questionModeChanges(e) {
    let selectedMode = selectors.readQuestionMode;
    if (selectedMode === "fresh") {
      removeClass('disabled', selectors.settingSyllable, selectors.settingRepractice);
      toggleClass('disabled', selectors.settingRepractice);

      if (document.querySelector("[id|='memory-empty-error']")) {
        // if there is an error under Memory Status Fieldset -> clean it
        const child = document.querySelector("[id|='memory-empty-error']");
        clearNode({
          parent: selectors.settingRepractice,
          children: [child],
        });
      }
    } 
    
    else if (selectedMode === "stored") {
      removeClass('disabled', selectors.settingSyllable, selectors.settingRepractice);
      toggleClass('disabled', selectors.settingSyllable);
      
      if (document.querySelector("[id|='syllable-error']")) {
        // if there is an error under Syllable Fieldset -> clean it
        const child = document.querySelector("[id|='syllable-error']");
        clearNode({
          parent: selectors.settingSyllable,
          children: [child],
        });
      }
    }
  }
   
  // to build options for the setting's answer language
  function buildAnswerOptions() {
    const ansMapping = { // [sn11]
      ka: { parent: selectors.aChoice, child: 'option', content: 'Kanji', childValues: 'ka', idName: 'a-ka'},
      hi: { parent: selectors.aChoice, child: 'option', content: 'Hiragana', childValues: 'hi', idName: 'a-hi'},
      en: { parent: selectors.aChoice, child: 'option', content: 'English', childValues:'en', idName: 'a-en'},
    };
  
    clearNode({ parent: selectors.aChoice, children: Array.from(selectors.aChoiceOptionAll) }); 
    // Array.from(aChoiceSelectorAll): Converts the NodeList (which is similar to an array but doesn't have all array methods) into a true array
  
    // Loop through the ansMapping object and call buildNode
    Object.entries(ansMapping).forEach(([key, params]) => { // [sn13]
      // Exclude the option if it matches the user's question choice
      if (key !== selectors.qChoice.value) {
        buildNode(params);
      }
    });
  }
  
  // animation concerns to move the setting form upward and reprint stored data info
  function handlebringBackBtn() {
    selectors.bringBackBtn.addEventListener('click', (event) => {
      toggleClass('shift-sections-to-center', dynamicDOM);
      clearScreen(sectionStatus);
      event.stopPropagation(); // Prevent event from bubbling up
      debouncedMoveForm(event); // Pass the event to the debounced function
      rePrintMemory();
    });
  }

  // when user want to restart the program
  function restart() {
    debouncedMoveForm();
    rePrintMemory();
  }

  // if user wants to continue to local storage after their initial syllable selections
  async function continuetoStoredData() {
    console.groupCollapsed("continuetoStoredData()");

    if (vocabInstance.readStoredLength <= 3) {
      appState.noOfAnswers = 2; // if stored data pool is too small, it will lead to an infinite loop.
      console.warn("StoredJSON pool is too small. noOfAnswer set to `2`");
    }
    await loaderInstance.loadStoredJSON();// Wait for loadStoredJSON to complete

    statusInstance.resetTotalNoOfQuestion().getTotalNoOfQuestions(); // for status bar, reset and set No. of Question
    questionMgr.newQuestion();

    console.groupEnd();
  }
  
  // The debounce function ensures that moveForm is only called after a specified delay (300 milliseconds in this example) has passed since the last click event. This prevents the function from being called too frequently.
  function debounce(func, delay) {
    let timeoutId;
    return function (event, ...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, [event, ...args]);
      }, delay);
    };
  }

  let isMoving = false; // Flag to prevent multiple movements

  // to move settings form upward
  function moveForm() {
    if (isMoving) return; // If the form is already moving, exit the function

    // Set the flag to prevent further calls
    isMoving = true;

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    toggleClass('moved', selectors.settingForm);
    toggleClass('dim', ...selectors.allSetting);
    toggleClass('hide', selectors.bringBackBtn);
    //toggleClass('hide', sectionQuestion, sectionAnswer, selectors.submitBtn, selectors.bringBackBtn);
    //toggleClass('section-move', sectionQuestion, sectionMessage, sectionAnswer);

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }

  // to print local storage data on screen
  function rePrintMemory() {
    //console.groupCollapsed("rePrintMemory()");

    clearNode({parent: selectors.memoryInfo});
    loaderInstance.loadMemoryData()
    
    console.groupEnd();
  }
  
  return {
    generalListeners,
    moveForm,
    handlebringBackBtn,
    debouncedMoveForm,
    restart,
    continuetoStoredData,
  }
}

function loaderManager() {

  // when user click submit(start) button of the setting form
  async function start(e) {  
    e.preventDefault(); // Prevent form from submitting the usual way
    
    if (!validateInputData(e)) { return; } // Stop further execution if inputData fails validation

    if (appState.qMode === "stored") {
      if(!validateStoredMemory()) {
        errorInstance.runtimeError("mem0");
        return;
      }
    }
       
    if (appState.qMode === "fresh") {
      await loadFreshJSON(); // Wait for loadFreshJSON to complete
    } else {
      await loadStoredJSON();// Wait for loadStoredJSON to complete
    }

    if (validateSyllable()) {
      // Only check the runtime error if validateSyllable() returns true
      // Otherwise program shows infinite loop error without necessary.
      const isRuntimeError = errorInstance.runtimeError("iLoop"); // If vocab pool is too small that it is causing the infinite loop    
  
      if (!isRuntimeError) {  // Now checks if there is NOT a runtime error
          console.error("Program failed at loaderManager()");
          return; // Exit if there is an infinite loop error
      }
  
      // Continue if there is no runtime error.
      listenerInstance.moveForm();
      toggleClass('shift-sections-to-center', dynamicDOM);
      statusInstance.resetTotalNoOfQuestion().getTotalNoOfQuestions(); // for status bar, reset and set No. of Question
      questionMgr.newQuestion();
    }
  }

  // input validation and loading function
  function validateInputData(e) {
    console.groupCollapsed("validateInputData()");

    convertToBoolean(['randomYesNo', 'flashYesNo']); // Convert the string values "true"/"false" to boolean values
    validateAndSetAnswerCount(); // Validate number of answers and set default if invalid
    validateAndSetQuestionMode(); // Validate question mode and set default
    assignLanguageBySelection(); // Validate and assign the correct language for the question and answer sections
    
    assignLanguage(sectionMessage, enLang); // Always set message section to English

    if (appState.qMode === "fresh") { // Run the following block only if qMode is 'fresh'
      validateSyllable(); // Validate syllable choices and show an error if none are selected
    }

    appState.qChoiceInput = selectors.readqChoiceInput ?? "hi";
    appState.aChoiceInput = selectors.readaChoiceInput ?? "en";
    console.info("appState.qChoiceInput: ", appState.qChoiceInput, "appState.aChoiceInput: ", appState.aChoiceInput);
    
    console.groupEnd();
    return true; // Signal that inputData validation passed
  }

  // to convert all checked syllables to an array
  function convertCheckedValuesToArray(nodeList) {
    let convertedArray;
    convertedArray = Array.from(document.querySelectorAll(nodeList))
                          .map(eachCheckBox => eachCheckBox.value); // [sn7]
    return convertedArray;
  }  
  
  // to load user selected sylable-json when program mode is "fresh"
  async function loadFreshJSON() {
    console.groupCollapsed("loadFreshJSON()");

    questionMgr.setQuestionMode("fresh");

    const syllableMapping = {
      a: "assets/data/n5-vocab-a.json",
      i: "assets/data/n5-vocab-i.json",
    };
  
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
    //console.log("vocabArray(before removeBlankQuestion(): ", appData.vocabArray);
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    //console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);

    copyOneProperty(appData.vocabArray, kaVocab, ka);
    copyOneProperty(appData.vocabArray, hiVocab, hi);
    copyOneProperty(appData.vocabArray, enVocab, en);

    console.groupEnd();
  }

  // to load local storage json when program mode is "stored"
  async function loadStoredJSON() {
    console.groupCollapsed("loadStoredJSON()");

    questionMgr.setQuestionMode("stored");
    
    // Ensure loadLocalStorage returns an array
    const storedData = vocabInstance.loadLocalStorage();
    if (!Array.isArray(storedData)) {
        console.error("Error: Stored data is not an array! Check your loadLocalStorage function.");
        return;
    }
    
    // Assign storedData to appData.vocabArray
    appData.vocabArray = storedData;
    console.log("vocabArray(before removeBlankQuestion(): ", appData.vocabArray);
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);
    console.log("Inside loadStoredJSON(), vocabArray.length: ", appData.vocabArray.length);
    
    // Check if the array is empty
    if (appData.vocabArray.length === 0) {
        console.error("Error: vocabArray is empty after loading stored data!");
        return;
    }

    // Fetch the relevant categories
    copyOneProperty(appData.vocabArray, kaVocab, ka);
    copyOneProperty(appData.vocabArray, hiVocab, hi);
    copyOneProperty(appData.vocabArray, enVocab, en);

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
  function loadMemoryData () {
    let storedLength = vocabInstance.readStoredLength;
    if (storedLength === 0) {
      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: 'Memory is empty.',
        className: 'memory-info',
        idName: 'memory-info',
      });
    } else if (storedLength === 1) {
      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: `There is ${storedLength} word to repractice.`,
        className: 'memory-info',
        idName: 'memory-info',
      });

      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: `Flush Memory`,
        className: 'flush-memory-setting-btn',
        idName: 'flush-memory-btn',
        eventFunction: vocabInstance.flushLocalStorage,
      });
    } else {
      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: `There are ${storedLength} words to repractice.`,
        className: 'memory-info',
        idName: 'memory-info',
      });

      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: `Flush Memory`,
        className: 'flush-memory-setting-btn',
        idName: 'flush-memory-btn',
        eventFunction: vocabInstance.flushLocalStorage,
      });
    }
    
    console.groupEnd();
    return this;
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
    console.groupCollapsed("assignLanguageBySelection()");

    const validLanguages = ["hi", "ka"];
    if (validLanguages.includes(selectors.qChoice.value)) {
      assignLanguage(sectionQuestion, jpLang);
    } else {
      assignLanguage(sectionQuestion, enLang);
    }

    if (validLanguages.includes(selectors.aChoice.value)) {
      assignLanguage(sectionAnswer, jpLang);
    } else {
      assignLanguage(sectionAnswer, enLang);
    }

    console.groupEnd();
    return this;
  }

  // validate syllable choices and show error if necessary
  function validateSyllable() {
    console.groupCollapsed("validateSyllable()");
    // Validate syllable choices and show an error if none are selected
    appData.syllableChoice = convertCheckedValuesToArray('input[name="syllableChoice"]:checked');
    if (appState.qMode === "fresh" && appData.syllableChoice.length === 0) {
      errorInstance.runtimeError("noSL");
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

  // to validate whether is memory is empty or not
  function validateStoredMemory() {
    let storedLength = vocabInstance.readStoredLength;
    if (storedLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  return {
    start,
    loadMemoryData,
    loadStoredJSON,
    validateAndSetAnswerCount,
  }
}