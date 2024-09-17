//defaultState();
(function defaultState() {
  const loaderInstance = loader();
  const listenerInstance = listeners();

  loaderInstance.loadMemoryData();
  
  flipNodeState(...selectors.noOfAnsAll); // [sn14]
  toggleClass('hide', selectors.bringBackBtn, sectionQuestion, sectionAnswer);
  listenerInstance.generalListeners();
  listenerInstance.formAnimationListeners();
})();

function listeners() {
  const loaderInstance = loader();
  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  function generalListeners() {
    // Event Listeners
    selectors.settingForm.addEventListener('submit', loaderInstance.loadData); // [sn17]
    selectors.fieldsetSyllable.addEventListener('change', syllableChanges);
    selectors.qChoice.addEventListener('change', dynamicAnswer);
    selectors.settingFlashYesNo.addEventListener('change', flashmodeChanges);
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

  function flashmodeChanges(e) {
    flipNodeState(...selectors.noOfAnsAll); 
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
    });
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

  function moveForm() {
    if (isMoving) return; // If the form is already moving, exit the function

    // Set the flag to prevent further calls
    isMoving = true;

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    toggleClass('moved', selectors.settingForm);
    toggleClass('dim', ...selectors.allSetting);
    toggleClass('hide', sectionQuestion, sectionAnswer, selectors.submitBtn, selectors.bringBackBtn);

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }

  return {
    generalListeners,
    moveForm,
    formAnimationListeners,
    debouncedMoveForm,
  }
}

function loader() {
  function loadData(e) {  
    e.preventDefault(); // Prevent form from submitting the usual way
    
  
    // Convert the string values "true"/"false" to boolean values [sn16]
    appState.randomYesNo = selectors.readRandomYesNo === 'true';
    appState.flashYesNo = selectors.readFlashYesNo === 'true';
    appState.noOfAnswers = parseInt(selectors.readNoOfAns, 10); // [sn18]Ensure this is an integer
  
    appData.syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');
  
    if (appData.syllableChoice.length === 0) {
      // whether error msg is already been displayed.
      if (!(document.querySelector("[id|='syllable-error']"))) {
        buildNode({
          parent: selectors.fieldsetSyllable, 
          child: 'div', 
          content: 'Select at least one syllables', 
          className: 'setting-error', 
          idName: 'syllable-error',
        });
      }
      return;
    }

    listeners().moveForm();

    selectors.qChoice.value === "hi" || selectors.qChoice.value === "ka" 
    ? assignLanguage(sectionQuestion, jpLang) 
    : assignLanguage(sectionQuestion, enLang);

    selectors.aChoice.value === "hi" || selectors.qChoice.value === "ka" 
    ? assignLanguage(sectionAnswer, jpLang) 
    : assignLanguage(sectionAnswer, enLang);

    assignLanguage(sectionMessage, enLang);
  
    loadJSON();
  }

  function checkBoxToArray(nodeList) {
    let convertedArray;
    convertedArray = Array.from(document.querySelectorAll(nodeList))
                          .map(eachCheckBox => eachCheckBox.value); // [sn7]
    return convertedArray;
  }  

  function loadJSON() {
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
  
    // Wait for all Promises to resolve and then merge the results into vocabArray
    Promise.all(promises)
      .then(results => {
        appData.vocabArray = results.flat(); // Combine all arrays into one
        //console.log("Inside prepareJSON(), vocabArray: ", appData.vocabArray); // this should show the full combined array
        console.log("Inside prepareJSON(), vocabArray.length: ", appData.vocabArray.length); // Now this should show the full combined array
        fetchOneCategory(appData.vocabArray, kaVocab, ka); // le2
        fetchOneCategory(appData.vocabArray, hiVocab, hi);
        fetchOneCategory(appData.vocabArray, enVocab, en);
  
        questionManager().newQuestion(); // Call newQuestion();  after the data is loaded (sn1.MD)
      })
      .catch(error => console.error('Error loading vocab JSON files:', error));
  }

  function loadMemoryData () {
    let storedLength = vocabManager().readStoredLength;
    if (storedLength === 0) {
      buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: 'Memory is empty, wrongly chosen vocabs will be in the memory for later use.',
        className: 'memory-info',
        idName
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
        className: 'flush-memory-btn',
        idName: 'flush-memory-btn',
        eventFunction: vocabManager().clearIncorrectAnswers,
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
        className: 'flush-memory-btn',
        idName: 'flush-memory-btn',
        eventFunction: vocabManager().clearIncorrectAnswers,
      });
    }
    
  }

  return {
    loadData,
    loadMemoryData,
  }
}