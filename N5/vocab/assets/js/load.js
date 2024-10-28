const loaderInstance = loaderManager();
const listenerInstance = listenerManager();
const vocabInstance = vocabManager();
const errorInstance = errorManager();
const statusInstance = statusManager();

(function defaultState() {
  loaderInstance.loadMemoryData();
  //flipNodeState(...selectors.noOfAnsAll); // [sn14]
  toggleClass('disabled', ...selectors.noOfAnsAll);
  //toggleClass('hide', sectionStatus);
  toggleClass('overlay-message', sectionMessage);
  toggleClass('fade-hide', sectionMessage);
  /*toggleClass('fade-in',
    sectionStatus,
    sectionQuestion,
    //sectionMessage,
    sectionAnswer,
  );*/
  loaderInstance.floatingBtnsDefaultState();
  toggleClass('disabled', selectors.settingRepractice);
  listenerInstance.generalListeners();
  console.groupEnd();
})();


function listenerManager() {
  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  // All event Listeners
  function generalListeners() {
    selectors.settingForm.addEventListener('submit', loaderInstance.start); // [sn17]
    selectors.switchRandomYesNo.addEventListener('change', randomToggleChanges);
    selectors.switchFlashYesNo.addEventListener('change', flashModeToggleChanges); // to handle toggle switch
    selectors.settingFlashYesNo.addEventListener('change', flashModeChanges); // to show answer options and check runtime error 
    //selectors.fieldsetSyllable.addEventListener('change', syllableChanges);
    selectors.fieldsetSyllable.addEventListener('change', syllableChangesImprovedVer);
    selectors.qChoice.addEventListener('change', buildAnswerOptions);
    selectors.settingSource.addEventListener('change', questionModeChanges);
    selectors.bringBackBtn.addEventListener('click', handlebringBackBtn);
    selectors.resumePracticeBtn.addEventListener('click', handleResumePracticeBtn);
  }

  // to handle settingRandomYesNo toggle switch
  function randomToggleChanges(e) {
    console.groupCollapsed("randomToggleChanges()");
    const randomLabel = document.querySelector("#random-label");
    const sequentialLabel = document.querySelector("#sequential-label");

    if (selectors.switchRandomYesNo.checked) { // random is selected on the front end
      appState.randomYesNo = true;
    } else {
      appState.randomYesNo = false;
    }
    toggleClass("dim", randomLabel, sequentialLabel);
    console.info("appState.randomYesNo: ", appState.randomYesNo);
    console.groupEnd();
  }

  // to handle settingFlashYesNo toggle switch
  function flashModeToggleChanges(e) {
    console.groupCollapsed("flashModeToggleChanges()");
    const flashLabel = document.querySelector("#flashcard-label");
    const multiLabel = document.querySelector("#multiple-choice-label");

    if (selectors.switchFlashYesNo.checked) { // multi-choice is selected on the front end
      appState.flashYesNo = false; 
    } else {
      appState.flashYesNo = true;
    }
    toggleClass("dim", flashLabel, multiLabel);
    console.info("appState.flashYesNo: ", appState.flashYesNo);
    console.groupEnd();
  }

  // to handle when flash mode toogle (previously radio buttons are) is changed
  function flashModeChanges(e) {
    console.groupCollapsed("flashModeChanges()");
    toggleClass('disabled', ...selectors.noOfAnsAll);
    
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

  // to handle when syllable checkboxs are changed
  function syllableChangesImprovedVer(event) { // [le4]
    const allCheckbox = document.getElementById('syllableAll');
    const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
      .filter(checkbox => checkbox !== allCheckbox);

    if (checkNode({ idName: 'syllable-error' })) {
      clearNode({
        parent: selectors.fieldsetSyllable,
        children: Array.from(document.querySelectorAll('div[id^="syllable-error"]'))
      });
    }

    if (event.target === allCheckbox) { // Check whether event is `allCheckbox`
      if (allCheckbox.checked) { // If "all" is checked
        otherCheckboxes.forEach(checkbox => {
          checkbox.checked = true; // Make every other checkbox checked.
        });
      } else { // If "all" is unchecked
        otherCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      }
    } 
    
    else { // If the event is NOT `allCheckbox`
      if (event.target.checked) { //[sn8] // if individual syllable is checked
        const allAreChecked = otherCheckboxes.every(checkbox => checkbox.checked); // Check if **all** other checkboxes are checked

        if (allAreChecked) { 
          allCheckbox.checked = true; // If all individual syllables are checked, check "All"
        } else {
          allCheckbox.checked = false; // If not all are checked, uncheck "All"
        }
      } 
      else { // If individual syllable is unchecked
        allCheckbox.checked = false; 
      }
    }
  }

  // to handle when program question mode (fresh / stored) is changed
  function questionModeChanges(e) {
    let selectedMode = selectors.readQuestionMode;
    if (selectedMode === "fresh") {
      toggleClass('disabled', selectors.settingRepractice, selectors.settingSyllable);

      if (document.querySelector("[id|='memory-empty-error']")) {
        // if there is an error under Memory Status Fieldset -> clean it
        const child = document.querySelector("[id|='memory-empty-error']");
        clearNode({
          parent: selectors.settingRepractice,
          children: [child],
        });
      }
      questionMgr.setQuestionMode("fresh");
      answerMgr.setRanOnce(false);
    } 
    
    else if (selectedMode === "stored") {
      toggleClass('disabled', selectors.settingRepractice, selectors.settingSyllable);
      
      if (document.querySelector("[id|='syllable-error']")) {
        // if there is an error under Syllable Fieldset -> clean it
        const child = document.querySelector("[id|='syllable-error']");
        clearNode({
          parent: selectors.settingSyllable,
          children: [child],
        });
      }
      questionMgr.setQuestionMode("stored");
      answerMgr.setRanOnce(true);
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
  
  // When bringBackBtn is clicked (to move the setting form upward and reprint stored data info)
  function handlebringBackBtn(event) {
      //clearScreen(sectionStatus);
      loaderInstance.toggleFormDisplay();
      event.stopPropagation(); // Prevent event from bubbling up
      debouncedMoveForm(event); // Pass the event to the debounced function
      loaderInstance.rePrintMemory();
  }

  // When resumePracticeBtn is clicked
  function handleResumePracticeBtn(event) {
    loaderInstance.toggleFormDisplay();
    debouncedMoveForm(event);
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

    //clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }
  
  return {
    generalListeners,
    moveForm,
    handlebringBackBtn,
    debouncedMoveForm,
  }
}

function loaderManager() {
  // Initialize loaderManager's property, lastLocation, if it’s not defined yet ...
  // ... by initializing here, it will be easier to debug
  if (loaderManager.lastLocation === undefined) {
    loaderManager.lastLocation = "initial";
  }

  // when user click submit(start) button of the setting form
  async function start(e) {  
    e.preventDefault(); // Prevent form from submitting the usual way
    
    validateAndSetInputData(e); // validate and set defaults to the input data.

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
      floatingBtnsDefaultState();
      toggleFormDisplay("start");
      listenerInstance.moveForm();
      statusInstance.resetQuestionCount().resetTotalNoOfQuestion().getTotalNoOfQuestions("fresh"); // for status bar, reset and set No. of Question
      statusInstance.resetCumulativeVariables(); // reset all variables concerning with cumulative average
      //toggleClass('shift-sections-to-center', dynamicDOM);
      questionMgr.newQuestion();
    }
  }

  // to validate input data and set defaults if necessary
  function validateAndSetInputData(e) {
    console.groupCollapsed("validateAndSetInputData()");

    //convertToBoolean(['randomYesNo', 'flashYesNo']); // (Formly randonYesNo and flashYesNo were radio, so that need to used this.) Convert the string values "true"/"false" to boolean values
    validateToggleSwitch(['randomYesNo', 'flashYesNo']);
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
      a: "N5/vocab/assets/data/n5-vocab-a.json",
      i: "N5/vocab/assets/data/n5-vocab-i.json",
      u: "N5/vocab/assets/data/n5-vocab-u.json",
      e: "N5/vocab/assets/data/n5-vocab-e.json",
      o: "N5/vocab/assets/data/n5-vocab-o.json",
      ka: "N5/vocab/assets/data/n5-vocab-ka.json",
      ki: "N5/vocab/assets/data/n5-vocab-ki.json",
      ku: "N5/vocab/assets/data/n5-vocab-ku.json",
      ke: "N5/vocab/assets/data/n5-vocab-ke.json",
      ko: "N5/vocab/assets/data/n5-vocab-ko.json",
      sa: "N5/vocab/assets/data/n5-vocab-sa.json",
      shi: "N5/vocab/assets/data/n5-vocab-shi.json",
      db: "N5/vocab/assets/data/n5-vocab-debug.json",
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
        //content: `There is ${storedLength} word to repractice.`,
        content: `${storedLength} word to repractice.`,
        className: 'memory-info',
        idName: 'memory-info',
      });
    } else {
      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        //content: `There are ${storedLength} words to repractice.`,
        content: `${storedLength} words to repractice.`,
        className: 'memory-info',
        idName: 'memory-info',
      });
    }
    // Build `flush` button
    buildNode({
      parent: selectors.memoryBtns,
      child: 'div',
      content: `<i class="fa-solid fa-trash-can"></i>`,
      className: 'flush-memory-setting-btn',
      idName: 'flush-memory-btn',
      eventFunction: vocabInstance.flushLocalStorage,
    });
    // Build `list` button
    buildNode({
      parent: selectors.memoryBtns,
      child: 'div',
      content: `<i class="fa-solid fa-rectangle-list"></i>`,
      className: 'list-memory-setting-btn',
      idName: 'list-memory-btn',
      eventFunction: listMistakes,
    });
    
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

  // Vvalidate syllable choices and show error if necessary
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

  // To validate toggle switch data
  function validateToggleSwitch(selectorNames) {
    console.groupCollapsed("validateToggleSwitch()");

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
        console.info(`${selectorName} is good to go: ${appState[selectorName]}`);
      }
    }
  }

  // To validate whether is memory is empty or not
  function validateStoredMemory() {
    let storedLength = vocabInstance.readStoredLength;
    if (storedLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  // to print local storage data on screen
  function rePrintMemory() {
    //console.groupCollapsed("rePrintMemory()");

    clearNode({ parent: selectors.memoryInfo });
    clearNode({ parent: selectors.memoryBtns });
    loaderInstance.loadMemoryData()

    console.groupEnd();
  }
  
  // If user wants to continue to local storage after their initial syllable selections
  async function continuetoStoredData() {
    console.groupCollapsed("continuetoStoredData()");

    if (vocabInstance.readStoredLength <= 3) {
      appState.noOfAnswers = 2; // if stored data pool is too small, it will lead to an infinite loop.
      console.warn("StoredJSON pool is too small. noOfAnswer set to `2`");
    }
    await loaderInstance.loadStoredJSON();// Wait for loadStoredJSON to complete

    //statusInstance.resetQuestionCount().resetTotalNoOfQuestion().getTotalNoOfQuestions(); // for status bar, reset and set No. of Question
    //statusInstance.resetCumulativeVariables(); // reset all variables concerning with cumulative average
    statusInstance.getTotalNoOfQuestions("stored");
    questionMgr.newQuestion();

    console.groupEnd();
  }

  // When user want to restart the program
  function restart() {
    clearScreen(sectionStatus);
    toggleClass('overlay-message', sectionMessage);
    
    toggleClass('fade-hide', sectionMessage);

    //toggleClass('shift-sections-to-center', dynamicDOM);
    toggleFormDisplay("start");
    listenerInstance.debouncedMoveForm();
    rePrintMemory();
  }


  // To reset default 'hide' state to bringback & resume btns
  function floatingBtnsDefaultState() {
    removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    toggleClass('hide', // add 'hide' class as default
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
  }

  // To toggle buttons and sections when move / resume btn is clicked
  function toggleFormDisplay(btnClicked) {
    //console.groupCollapsed("toggleFormDisplay()");

   /* setTimeout(() => {
      toggleClass('shift-sections-to-center', dynamicDOM);
    }, 400);*/
    toggleClass('moved', selectors.settingForm);
    toggleClass('disabled', selectors.settingForm);
    toggleClass('dim', ...selectors.allSetting);

    switch (btnClicked) {
      case "start":
        setTimeout(() => {
          toggleClass('shift-sections-to-center', dynamicDOM);
        }, 400);

        toggleClass('hide',
          sectionStatus,
          selectors.bringBackBtn,
        );
        //console.info("case: ", btnClicked);
        break;

        case "mistake-list":
          setTimeout(() => {
            toggleClass('shift-sections-to-top-center', dynamicDOM);
          }, 400);
  
          toggleClass('hide',
            sectionStatus,
            selectors.bringBackBtn,
          );
          //console.info("case: ", btnClicked);
          break;

      default:
        const DOMClassList = dynamicDOM.classList;

        // Check if `shift-sections-to-top-center` class is present, then remove it
        if (DOMClassList.contains("shift-sections-to-top-center")) {
          DOMClassList.remove("shift-sections-to-top-center");
        }
        else {
          toggleClass('shift-sections-to-center', dynamicDOM);
        }
        toggleClass('hide',
          sectionStatus,
          selectors.bringBackBtn,
          selectors.resumePracticeBtn,
        );
        //console.info("case: ", btnClicked);
        break;
    }
    
    console.groupEnd();
  }

  // To list mistakes from stored data
  function listMistakes() {
    console.groupCollapsed("listMistakes()");
    
    loaderInstance.resumeTo = "mistake-list";
    floatingBtnsDefaultState();
    toggleFormDisplay("mistake-list");
  
    const mistakeArray = vocabInstance.loadLocalStorage(); // Load mistakes from localStorage

    clearScreen([sectionQuestion, sectionMessage], "fast");
  
    // Create the container to display the mistakes
    buildNode({
      parent: sectionQuestion,
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
    buildNode({
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
      buildNode({
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
      buildNode({
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

        buildNode({
          parent: mistakeListRow,
          child: 'div',
          content: content, // Assign content to each column
          className: ['mistakes-column', classNameByIndex], // Class for each column
        });
      });
    });
 
    console.groupEnd();
  }

  return {
    start,
    loadMemoryData,
    loadStoredJSON,
    validateAndSetAnswerCount,
    rePrintMemory,
    continuetoStoredData,
    restart,
    floatingBtnsDefaultState,
    toggleFormDisplay,
    get resumeTo() 
    {
      return loaderManager.lastLocation;
    },
    
    set resumeTo(l) 
    {
      console.groupCollapsed("resumeTo()");

      const validLocations = ['initial','mistake-list', 'flash', 'mcq'];
      if (!validLocations.includes(l)) {
        loaderManager.lastLocation = 'initial';
        console.warn("Invalid location is passed.  Defaulting to `initial`.");
      }
      loaderManager.lastLocation = l;
      console.info("loaderManager.resumeTo is set to ", loaderManager.lastLocation);

      console.groupEnd();
    },
  }
}