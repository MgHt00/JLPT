import { appState, selectors } from "../services/globals.js";

export function listenerManager(loaderMgr, controlMgr, questionMgr, answerMgr) {

  function setInstances(loaderInstance, controlInstance, questionInstance, answerInstance){
    loaderMgr = loaderInstance;
    controlMgr = controlInstance;
    questionMgr = questionInstance;
    answerMgr = answerInstance;
  }

  // Wrap the moveForm function with debounce
  const debouncedMoveForm = debounce(moveForm, 300); // 300ms delay

  // All event Listeners
  function generalListeners() {
    selectors.settingForm.addEventListener('submit', loaderMgr.start); // [sn17]
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
    controlMgr.resetQuestionMode();
    toggleClass('disabled', ...selectors.noOfAnsAll);
    
    // set noOfAns to 2 to bypass runtime error if flashcard mode is selected
    if (selectors.readFlashYesNo) {
      console.info("Flashcard mode is selected.");
      console.warn("noOfAnswers set to `2` to avoid runtime error");
      appState.noOfAnswers = 2;
    } else {
      // Validate number of answers and set default if invalid
      loaderMgr.validateAndSetAnswerCount();
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
    console.groupCollapsed("syllableChangesImprovedVer()");
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
    console.groupEnd();
  }

  // to handle when program question mode (fresh / stored) is changed
  function questionModeChanges(e) {
    loaderMgr.removeErrBlks();
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
    controlMgr.floatingBtnsHideAll().toggleFormDisplay().hideBackShowResume();
    event.stopPropagation(); // Prevent event from bubbling up
    debouncedMoveForm(event); // Pass the event to the debounced function
    loaderMgr.rePrintMemory();
  }

  // When resumePracticeBtn is clicked
  function handleResumePracticeBtn(event) {
    console.groupCollapsed("handleResumePracticeBtn()");

    controlMgr.floatingBtnsHideAll();

    if (statusInstance.goodToResume) { // if the program is still in progress,
      console.info("statusInstance.goodToResume: FALSE");
      controlMgr.toggleFormDisplay().hideResumeShowBack();
      listenerInstance.moveForm();
      statusInstance.goodToResume = false;
      loaderMgr.resumeProgram();
    }
    else {
      console.info("Normal resume procedures.");
      controlMgr.toggleFormDisplay().hideResumeShowBack();
      debouncedMoveForm(event);
    }

    console.groupEnd();
  }

  // When list mistake button is clicked
  function handleListMistakeBtn() {
    console.groupCollapsed("handleListMistakeBtn()");

    controlMgr.floatingBtnsHideAll()
                   .hideResumeShowBack()
                   .toggleFormDisplay('shift-sections-to-top-center');

    clearScreen([selectors.sectionStatus, selectors.sectionQuestion, selectors.sectionMessage, selectors.sectionAnswer], "fast");
    loaderMgr.listMistakes();

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

    //clearScreen([selectors.sectionQuestion, selectors.sectionMessage, selectors.sectionAnswer]);

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }
  
  return {
    setInstances,
    generalListeners,
    moveForm,
    //handlebringBackBtn,
    handleListMistakeBtn,
    debouncedMoveForm,
  }
}