import { CSS_CLASS_NAMES } from "../constants/cssClassNames.js";
import { BUILD_ANSWER_OPTIONS, GENERATED_DOM } from "../constants/elementIDs.js";
import { QUESTION_MODE_FRESH, QUESTION_MODE_STORED, LANGUAGE_OPTIONS, LANGUAGE_MAPPINGS } from "../constants/appConstants.js";

export function listenerManager(globals, utilsManager, setQuestionMode, clearError, controlManager, loaderFns, statusFns) {
  const { appState, selectors, currentStatus } = globals;
  const { domUtils, displayUtils } = utilsManager;
  const { floatingBtnsHideAll, hideResumeShowBack, hideBackShowResume, toggleFormDisplay, resetQuestionMode, toggleShadesOnTop } = controlManager;
  const { start, validateAndSetAnswerCount, rePrintMemory, listMistakes, resumeProgram } = loaderFns;
  const { getGoodToResume, setGoodToResume } = statusFns;
  const { DIM, DISABLED } = CSS_CLASS_NAMES;

  let _setRanOnce;

  function setListenerManagerCallbacks(setRanOnce){
    _setRanOnce = setRanOnce;
  }

  // Wrap the moveForm function with _debounce
  const debouncedMoveForm = _debounce(moveForm, 300); // 300ms delay

  // All event Listeners
  function generalListeners() {
    selectors.settingForm.addEventListener('submit', start); // [sn17]
    selectors.switchRandomYesNo.addEventListener('change', _randomToggleChanges);
    selectors.switchFlashYesNo.addEventListener('change', _flashModeToggleChanges); // to handle toggle switch
    selectors.settingFlashYesNo.addEventListener('change', _flashModeChanges); // to show answer options and check runtime error 
    selectors.fieldsetSyllable.addEventListener('change', _syllableChangesImprovedVer);
    selectors.qChoice.addEventListener('change', _buildAnswerOptions);
    selectors.settingSource.addEventListener('change', _questionModeChanges);
    selectors.bringBackBtn.addEventListener('click', _handlebringBackBtn);
    selectors.resumePracticeBtn.addEventListener('click', _handleResumePracticeBtn);
  }

  // to handle settingRandomYesNo toggle switch
  function _randomToggleChanges(e) {
    console.groupCollapsed("_randomToggleChanges()");
    const randomLabel = selectors.labelRandom;
    const sequentialLabel = selectors.labelSequential;

    if (selectors.switchRandomYesNo.checked) { // random is selected on the front end
      appState.randomYesNo = true;
    } else {
      appState.randomYesNo = false;
    }
    displayUtils.toggleClass(DIM, randomLabel, sequentialLabel);
    console.info("appState.randomYesNo: ", appState.randomYesNo);
    console.groupEnd();
  }

  // to handle settingFlashYesNo toggle switch
  function _flashModeToggleChanges(e) {
    console.groupCollapsed("_flashModeToggleChanges()");
    const flashLabel = selectors.labelFlashCard;
    const multiLabel = selectors.labelMCQ;

    if (selectors.switchFlashYesNo.checked) { // multi-choice is selected on the front end
      appState.flashYesNo = false; 
    } else {
      appState.flashYesNo = true;
    }
    displayUtils.toggleClass(DIM, flashLabel, multiLabel);
    console.info("appState.flashYesNo: ", appState.flashYesNo);
    console.groupEnd();
  }

  // to handle when flash mode toogle (previously radio buttons are) is changed
  function _flashModeChanges(e) {
    console.groupCollapsed("_flashModeChanges()");
    resetQuestionMode();
    displayUtils.toggleClass(DISABLED, ...selectors.noOfAnsAll);
    
    // set noOfAns to 2 to bypass runtime error if flashcard mode is selected
    if (selectors.readFlashYesNo) {
      console.info("Flashcard mode is selected.");
      console.warn("noOfAnswers set to `2` to avoid runtime error");
      appState.noOfAnswers = 2;
    } else {
      // Validate number of answers and set default if invalid
      validateAndSetAnswerCount();
    }
    console.groupEnd();
  }
  
  // UNUSED FUNCTION to handle when syllable checkboxs are changed
  /*function syllableChanges(event) { // [le4]
    const allCheckbox = document.getElementById('syllableAll');
    const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
      .filter(checkbox => checkbox !== allCheckbox);

    if (domUtils.checkNode({ id: GENERATED_DOM.SYLLABLE_ERROR })) _removeSyllableError();

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
  }*/

  // Gets the "all" checkbox and individual syllable checkboxes.
  function _getSyllableCheckboxes() {
    const allCheckbox = selectors.checkboxSyllableAll;
    const otherCheckboxes = Array.from(selectors.individualSyllableChoiceCheckboxes)
                                 .filter(checkbox => checkbox !== allCheckbox);
    return { allCheckbox, otherCheckboxes };
  }

  function _removeSyllableError() {
    domUtils.clearNode({
      parent: selectors.fieldsetSyllable,
      children: Array.from(selectors.syllableErrorContainer),
    });
  }

  // to handle when syllable checkboxs are changed
  function _syllableChangesImprovedVer(event) { // [le4]
    console.groupCollapsed("_syllableChangesImprovedVer()");

    const { allCheckbox, otherCheckboxes } = _getSyllableCheckboxes();
    if (domUtils.checkNode({ id: GENERATED_DOM.SYLLABLE_ERROR })) _removeSyllableError();

    if (event.target === allCheckbox) {       // Check whether event is `allCheckbox`
      otherCheckboxes.forEach(checkbox => checkbox.checked = allCheckbox.checked);
      // [le9] If allCheckbox.checked === true, all individual checkboxes are checked.
      //       If allCheckbox.checked === false, all individual checkboxes are unchecked.
      console.groupEnd();
      return;
    } 

    allCheckbox.checked = otherCheckboxes.every(checkbox => checkbox.checked);
    console.groupEnd();
  }

  function _toggleSettingSyllable() {
    displayUtils.toggleClass(DISABLED, selectors.settingRepractice, selectors.settingSyllable);
  }

  // to handle when program question mode (fresh / stored) is changed
  function _questionModeChanges(e) {
    _toggleSettingSyllable();
    clearError();

    let selectedMode = selectors.readQuestionMode;

    if (selectedMode === QUESTION_MODE_FRESH) {
      setQuestionMode(QUESTION_MODE_FRESH);
       _setRanOnce(false);
    } 
    
    else if (selectedMode === QUESTION_MODE_STORED) {
      setQuestionMode(QUESTION_MODE_STORED);
       _setRanOnce(true);
    }
  }
   
  // to build options for the setting's answer language
  function _buildAnswerOptions() {
    const ansMapping = { // [sn11]
      ka: { parent: selectors.aChoice, child: 'option', content: LANGUAGE_OPTIONS.KANJI, childValues: LANGUAGE_MAPPINGS.KANJI, id: BUILD_ANSWER_OPTIONS.KANJI},
      hi: { parent: selectors.aChoice, child: 'option', content: LANGUAGE_OPTIONS.HIRAGANA, childValues: LANGUAGE_MAPPINGS.HIRAGANA, id: BUILD_ANSWER_OPTIONS.HIRAGANA},
      en: { parent: selectors.aChoice, child: 'option', content: LANGUAGE_OPTIONS.ENGLISH, childValues: LANGUAGE_MAPPINGS.ENGLISH, id: BUILD_ANSWER_OPTIONS.ENGLISH},
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
  function _handlebringBackBtn(event) {
    floatingBtnsHideAll();
    toggleFormDisplay();
    hideBackShowResume();

    if(currentStatus.mistakeListActive) {
      toggleShadesOnTop();
      _toggleMistakeListActive();
    }
    
    event.stopPropagation(); // Prevent event from bubbling up
    debouncedMoveForm(event); // Pass the event to the debounced function
    rePrintMemory();
  }

  // When resumePracticeBtn is clicked
  function _handleResumePracticeBtn(event) {
    console.groupCollapsed("_handleResumePracticeBtn()");

    floatingBtnsHideAll();

    if (getGoodToResume()) { // if the program is still in progress,
      console.info("statusMgr.goodToResume: FALSE");
      toggleFormDisplay();
      hideResumeShowBack();
      moveForm();
      setGoodToResume(false);
      resumeProgram();
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

    _toggleMistakeListActive();  // flag = true to show shades on the top.

    floatingBtnsHideAll();
    hideResumeShowBack();
    toggleShadesOnTop();
    toggleFormDisplay(CSS_CLASS_NAMES.SHIFT_TO_TOP_CENTER);

    domUtils.clearScreen([
      selectors.sectionStatus, 
      selectors.sectionQuestion, 
      selectors.sectionMessage, 
      selectors.sectionAnswer
    ], "fast");

    listMistakes();

    console.groupEnd();
  }

  function _toggleMistakeListActive() {
    console.groupCollapsed("_toggleMistakeListActive()");

    currentStatus.mistakeListActive = !currentStatus.mistakeListActive;
    console.info("mistakeListActive flag:",currentStatus.mistakeListActive);

    console.groupEnd();
  }
  
  // The _debounce function ensures that moveForm is only called after a specified delay (300 milliseconds in this example) has passed since the last click event. This prevents the function from being called too frequently.
  function _debounce(func, delay) {
    let timeoutId;
    return function (event, ...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, [event, ...args]);
      }, delay);
    };
  }

  let _isMoving = false; // Flag to prevent multiple movements
  
  // to move settings form upward
  function moveForm() {
    if (_isMoving) return; // If the form is already moving, exit the function

    // Set the flag to prevent further calls
    _isMoving = true;

    // Add an event listener for the transition end to reset the flag
    selectors.settingForm.addEventListener('transitionend', () => {
      _isMoving = false; // Allow future movement after the transition completes
    }, { once: true }); // Ensure the event listener is called only once per transition
  }
  
  return {
    setListenerManagerCallbacks,
    generalListeners,
    moveForm,
    handleListMistakeBtn,
    debouncedMoveForm,
  }
}