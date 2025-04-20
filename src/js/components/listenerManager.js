export function listenerManager(globals, controlManager, utilsManager) {
  const { appState, selectors, currentStatus } = globals;
  const { floatingBtnsHideAll, hideResumeShowBack, hideBackShowResume, toggleFormDisplay, resetQuestionMode, toggleShadesOnTop } = controlManager;
  const { domUtils, displayUtils } = utilsManager;

  let _setRanOnce, _clearError, _goodToResume; 
  let _start, _validateAndSetAnswerCount, _rePrintMemory, _listMistakes, _resumeProgram;
  let _setQuestionMode;

  function setListenerManagerCallbacks(start, validateAndSetAnswerCount, rePrintMemory, listMistakes, resumeProgram, setQuestionMode, setRanOnce, clearError, goodToResume){
    _start = start;
    _validateAndSetAnswerCount = validateAndSetAnswerCount;
    _rePrintMemory = rePrintMemory;
    _listMistakes = listMistakes;
    _resumeProgram = resumeProgram;
    _setQuestionMode = setQuestionMode;
    _setRanOnce = setRanOnce;
    _clearError = clearError;
    _goodToResume = goodToResume;
  }

  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  // All event Listeners
  function generalListeners() {
    selectors.settingForm.addEventListener('submit', _start); // [sn17]
    selectors.switchRandomYesNo.addEventListener('change', randomToggleChanges);
    selectors.switchFlashYesNo.addEventListener('change', flashModeToggleChanges); // to handle toggle switch
    selectors.settingFlashYesNo.addEventListener('change', flashModeChanges); // to show answer options and check runtime error 
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
    displayUtils.toggleClass("dim", randomLabel, sequentialLabel);
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
    displayUtils.toggleClass("dim", flashLabel, multiLabel);
    console.info("appState.flashYesNo: ", appState.flashYesNo);
    console.groupEnd();
  }

  // to handle when flash mode toogle (previously radio buttons are) is changed
  function flashModeChanges(e) {
    console.groupCollapsed("flashModeChanges()");
    resetQuestionMode();
    displayUtils.toggleClass('disabled', ...selectors.noOfAnsAll);
    
    // set noOfAns to 2 to bypass runtime error if flashcard mode is selected
    if (selectors.readFlashYesNo) {
      console.info("Flashcard mode is selected.");
      console.warn("noOfAnswers set to `2` to avoid runtime error");
      appState.noOfAnswers = 2;
    } else {
      // Validate number of answers and set default if invalid
      _validateAndSetAnswerCount();
    }
    console.groupEnd();
  }
  
  // UNUSED FUNCTION to handle when syllable checkboxs are changed
  function syllableChanges(event) { // [le4]
    const allCheckbox = document.getElementById('syllableAll');
    const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
      .filter(checkbox => checkbox !== allCheckbox);

    if (domUtils.checkNode({ id: 'syllable-error' })) removeSyllableError();

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
    console.groupCollapsed("syllableChangesImprovedVer()");

    const { allCheckbox, otherCheckboxes } = getCheckboxes();
    if (domUtils.checkNode({ id: 'syllable-error' })) removeSyllableError();

    if (event.target === allCheckbox) {       // Check whether event is `allCheckbox`
      otherCheckboxes.forEach(checkbox => checkbox.checked = allCheckbox.checked);
      // [le9] If allCheckbox.checked === true, all individual checkboxes are checked.
      //       If allCheckbox.checked === false, all individual checkboxes are unchecked.
      console.groupEnd();
      return;
    } 

    allCheckbox.checked = otherCheckboxes.every(checkbox => checkbox.checked);
    console.groupEnd();

    // utility functions private to the module
    function getCheckboxes() {
      const allCheckbox = document.getElementById('syllableAll');
      const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
        .filter(checkbox => checkbox !== allCheckbox);

      return { allCheckbox, otherCheckboxes };
    }

    function removeSyllableError() {
      domUtils.clearNode({
        parent: selectors.fieldsetSyllable,
        children: Array.from(document.querySelectorAll('div[id^="syllable-error"]'))
      });
    }
  }

  // to handle when program question mode (fresh / stored) is changed
  function questionModeChanges(e) {
    toggleSettingSyllable();
    _clearError();

    let selectedMode = selectors.readQuestionMode;

    if (selectedMode === "fresh") {
      _setQuestionMode("fresh");
       _setRanOnce(false);
    } 
    
    else if (selectedMode === "stored") {
      _setQuestionMode("stored");
       _setRanOnce(true);
    }

    // private functions
    function toggleSettingSyllable() {
      displayUtils.toggleClass('disabled', selectors.settingRepractice, selectors.settingSyllable);
    }
  }
   
  // to build options for the setting's answer language
  function buildAnswerOptions() {
    const ansMapping = { // [sn11]
      ka: { parent: selectors.aChoice, child: 'option', content: 'Kanji', childValues: 'ka', id: 'a-ka'},
      hi: { parent: selectors.aChoice, child: 'option', content: 'Hiragana', childValues: 'hi', id: 'a-hi'},
      en: { parent: selectors.aChoice, child: 'option', content: 'English', childValues:'en', id: 'a-en'},
    };
  
    domUtils.clearNode({ parent: selectors.aChoice, children: Array.from(selectors.aChoiceOptionAll) }); 
    // Array.from(aChoiceSelectorAll): Converts the NodeList (which is similar to an array but doesn't have all array methods) into a true array
  
    // Loop through the ansMapping object and call buildNode
    Object.entries(ansMapping).forEach(([key, params]) => { // [sn13]
      // Exclude the option if it matches the user's question choice
      if (key !== selectors.qChoice.value) {
        domUtils.buildNode(params);
      }
    });
  }
  
  // When bringBackBtn is clicked (to move the setting form upward and reprint stored data info)
  function handlebringBackBtn(event) {
    floatingBtnsHideAll();
    toggleFormDisplay();
    hideBackShowResume();

    if(currentStatus.mistakeListActive) {
      toggleShadesOnTop();
      toggleMistakeListActive();
    }
    
    event.stopPropagation(); // Prevent event from bubbling up
    debouncedMoveForm(event); // Pass the event to the debounced function
    _rePrintMemory();
  }

  // When resumePracticeBtn is clicked
  function handleResumePracticeBtn(event) {
    console.groupCollapsed("handleResumePracticeBtn()");

    floatingBtnsHideAll();

    if (_goodToResume) { // if the program is still in progress,
      console.info("statusMgr.goodToResume: FALSE");
      toggleFormDisplay();
      hideResumeShowBack();
      moveForm();
      _goodToResume = false;
      _resumeProgram();
    }
    else {
      console.info("Normal resume procedures.");
      toggleFormDisplay();
      hideResumeShowBack();
      debouncedMoveForm(event);
    }

    console.groupEnd();
  }

  // When list mistake button is clicked
  function handleListMistakeBtn() {
    console.groupCollapsed("handleListMistakeBtn()");

    toggleMistakeListActive();  // flag = true to show shades on the top.

    floatingBtnsHideAll();
    hideResumeShowBack();
    toggleShadesOnTop();
    toggleFormDisplay('shift-sections-to-top-center');

    domUtils.clearScreen([
      selectors.sectionStatus, 
      selectors.sectionQuestion, 
      selectors.sectionMessage, 
      selectors.sectionAnswer
    ], "fast");

    _listMistakes();

    console.groupEnd();
  }

  function toggleMistakeListActive() {
    console.groupCollapsed("toggleMistakeListActive()");

    currentStatus.mistakeListActive = !currentStatus.mistakeListActive;
    console.info("mistakeListActive flag:",currentStatus.mistakeListActive);

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

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }
  
  return {
    setListenerManagerCallbacks,
    generalListeners,
    moveForm,
    //handlebringBackBtn,
    handleListMistakeBtn,
    debouncedMoveForm,
  }
}