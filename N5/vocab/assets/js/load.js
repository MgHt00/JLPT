const loaderInstance = loader();
const listenerInstance = listeners();
const vocabInstance = vocabManager();
const errorInstance = errorManager();

(function defaultState() {
  //console.groupCollapsed("defaultState()");
  loaderInstance.loadMemoryData();
  flipNodeState(...selectors.noOfAnsAll); // [sn14]
  //toggleClass('hide', selectors.bringBackBtn, sectionQuestion, sectionAnswer);
  toggleClass('hide', selectors.bringBackBtn);
  toggleClass('disabled', selectors.settingRepractice);
  listenerInstance.generalListeners();
  listenerInstance.formAnimationListeners();
  console.groupEnd();
})();


function listeners() {
  const loaderInstance = loader();
  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  function generalListeners() {
    // Event Listeners
    selectors.settingForm.addEventListener('submit', loaderInstance.start); // [sn17]
    selectors.fieldsetSyllable.addEventListener('change', syllableChanges);
    selectors.qChoice.addEventListener('change', dynamicAnswer);
    selectors.settingFlashYesNo.addEventListener('change', flashModeChanges);
    selectors.settingSource.addEventListener('change', questionModeChanges);
  }
  
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
   
  function flashModeChanges(e) {
    flipNodeState(...selectors.noOfAnsAll); 
  }
  
  function questionModeChanges(e) {
    let selectedMode = selectors.readQuestionMode;
    if (selectedMode === "fresh") {
      removeClass('disabled', selectors.settingSyllable, selectors.settingRepractice);
      toggleClass('disabled', selectors.settingRepractice);
    } else if (selectedMode === "stored") {
      removeClass('disabled', selectors.settingSyllable, selectors.settingRepractice);
      toggleClass('disabled', selectors.settingSyllable);
    }
  }
   
  function dynamicAnswer() {
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
  
  function formAnimationListeners() {
    selectors.bringBackBtn.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent event from bubbling up
      debouncedMoveForm(event); // Pass the event to the debounced function
      rePrintMemory();
    });
  }

  function restart() {
    debouncedMoveForm();
    rePrintMemory();
  }

  async function continuetoStoredData() {
    console.groupCollapsed("continuetoStoredData()");

    if (vocabInstance.readStoredLength <= 3) {
      appState.noOfAnswers = 2; // if stored data pool is too small, it will lead to an infinite loop.
      console.warn("StoredJSON pool is too small. noOfAnswer set to `2`");
    }
    await loaderInstance.loadStoredJSON();// Wait for loadStoredJSON to complete
    questionMgr.newQuestion();

    console.groupEnd();
  }
  
  function debounce(func, delay) {
    // The debounce function ensures that moveForm is only called after a specified delay (300 milliseconds in this example) has passed since the last click event. This prevents the function from being called too frequently.
    let timeoutId;
    return function (event, ...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, [event, ...args]);
      }, delay);
    };
  }

  let isMoving = false; // Flag to prevent multiple movements

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

  function rePrintMemory() {
    //console.groupCollapsed("rePrintMemory()");

    clearNode({parent: selectors.memoryInfo});
    loaderInstance.loadMemoryData()
    
    console.groupEnd();
  }
  
  return {
    generalListeners,
    moveForm,
    formAnimationListeners,
    debouncedMoveForm,
    restart,
    continuetoStoredData,
  }
}

function loader() {

  async function start(e) {  // Mark start() as async
    e.preventDefault(); // Prevent form from submitting the usual way
    
    if (!inputData(e)) { return; } // Stop further execution if inputData fails validation
       
    if (appState.qMode === "fresh") {
      await loadFreshJSON(); // Wait for loadFreshJSON to complete
    } else {
      await loadStoredJSON();// Wait for loadStoredJSON to complete
    }

    if(!errorInstance.runtimeError("iLoop")) { return; } // If vocab pool is too small that it is causing the infinite loop    
    
    listeners().moveForm();
    questionMgr.newQuestion(); // Call after data is loaded
  }

  function inputData(e) {
    // input validation and loading function
    console.groupCollapsed("inputData()");
    
    // Convert the string values "true"/"false" to boolean values [sn16]
    appState.randomYesNo = selectors.readRandomYesNo === 'true';
    console.info("appState.randomYesNo: ",appState.randomYesNo);

    appState.flashYesNo = selectors.readFlashYesNo === 'true';
    console.info("appState.flashYesNo: ", appState.flashYesNo);

    // Validate number of answers and set default if invalid
    const noOfAnswers = parseInt(selectors.readNoOfAns, 10);
    if (isNaN(noOfAnswers) || noOfAnswers < 2 || noOfAnswers > 4) {
      appState.noOfAnswers = 4; // Default to 4 answers
      console.warn("Invalid number of answers. Setting default to 4.");
    } else {
      appState.noOfAnswers = noOfAnswers;
    }
    console.info("appState.noOfAnswers: ", appState.noOfAnswers);


    appState.qMode = selectors.readQuestionMode;
    // Validate question mode and set default
    const validModes = ["fresh", "stored"];
    if (!validModes.includes(selectors.readQuestionMode)) {
      appState.qMode = "fresh"; // Default to 'fresh'
      console.warn("Invalid question mode. Defaulting to 'fresh'.");
    } else {
      appState.qMode = selectors.readQuestionMode;
    }
    console.info("appState.qMode: ", appState.qMode);

    // Validate and assign the correct language for the question and answer sections
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

    assignLanguage(sectionMessage, enLang); // Always set message section to English

    // Run the following block only if qMode is 'fresh'
    if (appState.qMode === "fresh") {
      // Validate syllable choices and show an error if none are selected
      appData.syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');
      if (appState.qMode === "fresh" && appData.syllableChoice.length === 0) {
        errorInstance.runtimeError("noSL");
        console.groupEnd();
        return false; // Signal that inputData validation failed
      }
    }
    console.info("appData.syllableChoice: ", appData.syllableChoice);
    
    appState.qChoiceInput = selectors.readqChoiceInput ?? "hi";
    appState.aChoiceInput = selectors.readaChoiceInput ?? "en";
    console.info("appState.qChoiceInput: ", appState.qChoiceInput, "appState.aChoiceInput: ", appState.aChoiceInput);
    
    console.groupEnd();
    return true; // Signal that inputData validation passed
  }

  function checkBoxToArray(nodeList) {
    let convertedArray;
    convertedArray = Array.from(document.querySelectorAll(nodeList))
                          .map(eachCheckBox => eachCheckBox.value); // [sn7]
    return convertedArray;
  }  
  
  async function loadFreshJSON() {
    console.groupCollapsed("loadFreshJSON()");

    questionMgr.setMode("fresh");

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
    console.log("vocabArray(before removeBlankQuestion(): ", appData.vocabArray);
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);

    fetchOneCategory(appData.vocabArray, kaVocab, ka);
    fetchOneCategory(appData.vocabArray, hiVocab, hi);
    fetchOneCategory(appData.vocabArray, enVocab, en);

    console.groupEnd();
  }

  async function loadStoredJSON() {
    console.groupCollapsed("loadStoredJSON()");

    questionMgr.setMode("stored");
    
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
    fetchOneCategory(appData.vocabArray, kaVocab, ka);
    fetchOneCategory(appData.vocabArray, hiVocab, hi);
    fetchOneCategory(appData.vocabArray, enVocab, en);

    console.groupEnd();
  }

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
        eventFunction: vocabInstance.clearIncorrectAnswers,
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
        eventFunction: vocabInstance.clearIncorrectAnswers,
      });
    }
  }

  return {
    start,
    //loadData,
    loadMemoryData,
    loadStoredJSON,
  }
}