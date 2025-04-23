export function vocabManager(globals, utilsManager) {
  const { appState, appData, currentStatus, selectors } = globals;
  const { domUtils } = utilsManager;

  let _loadMemoryData, _resetAfterFlushingMistakes, _readQuestionObj;
  function setVocabManagerCallbacks(loadMemoryData, resetAfterFlushingMistakes, readQuestionObj) {
    _loadMemoryData = loadMemoryData;
    _resetAfterFlushingMistakes = resetAfterFlushingMistakes;
    _readQuestionObj = readQuestionObj;
  }
  
  // to remove passed question number from the array
  function removeSpecifiedQuestion(i) {
    //console.groupCollapsed("vocabManager() - removeSpecifiedQuestion()");

    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
    }

    console.groupEnd();
  }

  function storeToMistakeBank() { // [sn5]
    console.groupCollapsed("storeToMistakeBank()");

    let incorrectSets = loadMistakesFromMistakeBank();

    // [sn6] Check if the object already exists in the array
    let exists = incorrectSets.some(answer =>
      answer.ka === _readQuestionObj().ka &&
      answer.hi === _readQuestionObj().hi &&
      answer.en === _readQuestionObj().en
    );

    // If it doesn't exist, add it to the array
    if (!exists) {
      incorrectSets.push(_readQuestionObj());
      console.info("New word pushed to localstorage.");
      localStorage.setItem("toPractice", JSON.stringify(incorrectSets));
    } else {
      console.info("Word already exit in localstorage.")
    }

    console.groupEnd();
  }

  function removeFromMistakeBank() {
    console.groupCollapsed("removeFromMistakeBank()");

    let incorrectSets = loadMistakesFromMistakeBank();

    console.info("incorrectSets Before popping: ", incorrectSets);
    incorrectSets.pop(_readQuestionObj());
    console.info("incorrectSets AFTER popping: ", incorrectSets);

    localStorage.setItem("toPractice", JSON.stringify(incorrectSets));
    console.info("incorrectSets had been successfully pushed it back to toPractice.");

    console.groupEnd();
  }
  
  // to load data from local storage
  function loadMistakesFromMistakeBank() {
    console.groupCollapsed("vocabManager() - loadMistakesFromMistakeBank()");

    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    console.info("storedObjects ", storedObjects);
    
    let storedLength = storedObjects.length;
    console.info("storedLength:", storedLength);
    
    console.groupEnd();
    return storedObjects;
  }
  
  // to flush local storage
  function flushMistakeBank() {
    console.groupCollapsed("vocabManager() - flushMistakeBank()");

    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    domUtils.clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    domUtils.clearNode({
      parent: selectors.memoryBtns,
      children: selectors.readMemoryBtns,
    });

    _loadMemoryData();
    _resetAfterFlushingMistakes();
    console.groupEnd();
  }

  // to save the current state of the program to local storage
  function saveState() {
    console.groupCollapsed("saveState()");

    localStorage.setItem("appState", JSON.stringify(appState));
    localStorage.setItem("appData", JSON.stringify(appData));
    localStorage.setItem("currentStatus", JSON.stringify(currentStatus));
    console.info("State saved to localStorage");

    console.groupEnd();
  }

  // to load the current state of the program to resume
  function loadState() {
    console.groupCollapsed("loadState()");

    const savedAppState = localStorage.getItem("appState");
    const savedAppData = localStorage.getItem("appData");
    const savedCurrentStatus = localStorage.getItem("currentStatus");
  
    if (savedAppState && savedAppData && savedCurrentStatus) {
      Object.assign(appState, JSON.parse(savedAppState));
      Object.assign(appData, JSON.parse(savedAppData));
      Object.assign(currentStatus, JSON.parse(savedCurrentStatus));
      console.info("State loaded from localStorage");
    } else {
      console.warn("No saved state found in localStorage");
    }

    console.groupEnd();
  }
  
  // to clear the current state (if necessary)
  function clearState() {
    console.groupCollapsed("clearState()");

    localStorage.removeItem("appState");
    localStorage.removeItem("appData");
    localStorage.removeItem("currentStatus");
    console.info("State cleared from localStorage");

    console.groupEnd();
  }

  function readStoredLength() {
    let mistakeFromStorage = loadMistakesFromMistakeBank();
    return mistakeFromStorage.length;
  }

  return {
    setVocabManagerCallbacks,
    removeSpecifiedQuestion,
    storeToMistakeBank,
    removeFromMistakeBank,
    flushMistakeBank,
    loadMistakesFromMistakeBank,
    saveState,
    loadState,
    clearState,
    readStoredLength,
  }
}