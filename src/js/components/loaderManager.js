  import { LOCAL_PATH, WEB_PATH, JSON_PATHS } from "../constants/filePath.js";
  
  export function loaderManager(globals, utilsManager, controlFns, questionFns, vocabFns, errorFns, statusFns) {
  const { defaultConfig, appState, appData, currentStatus, selectors } = globals;
  const { helpers, domUtils, displayUtils } = utilsManager;
  const { floatingBtnsHideAll, hideResumeShowBack, toggleFormDisplay } = controlFns
  const { newQuestion, setQuestionMode } = questionFns;
  const { flushMistakeBank, loadMistakesFromMistakeBank, loadState, readStoredLength } = vocabFns;
  const { runtimeError, clearError } = errorFns;
  const { resetQuestionCount, resetTotalNoOfQuestion, getTotalNoOfQuestions, resetCumulativeVariables } = statusFns;

  let _moveForm, _handleListMistakeBtn, _debouncedMoveForm
  function setLoaderManagerCallbacks(moveForm, handleListMistakeBtn, debouncedMoveForm) {
    _moveForm = moveForm;
    _handleListMistakeBtn = handleListMistakeBtn;
    _debouncedMoveForm = debouncedMoveForm;
  }
  
  const _isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  const _basePath = _isLocal ? LOCAL_PATH : WEB_PATH;

  const _vowels = {
    //db: "N5/vocab/assets/data/n5-vocab-debug.json",
    a: `${_basePath}${JSON_PATHS.A}`,
    i: `${_basePath}${JSON_PATHS.I}`,
    u: `${_basePath}${JSON_PATHS.U}`,
    e: `${_basePath}${JSON_PATHS.E}`,
    o: `${_basePath}${JSON_PATHS.O}`,
  }

  const _k = {
    ka: `${_basePath}${JSON_PATHS.KA}`,
    ki: `${_basePath}${JSON_PATHS.KI}`,
    ku: `${_basePath}${JSON_PATHS.KU}`,
    ke: `${_basePath}${JSON_PATHS.KE}`,
    ko: `${_basePath}${JSON_PATHS.KO}`,
  } 

  const _s = {
    sa: `${_basePath}${JSON_PATHS.SA}`,
    shi: `${_basePath}${JSON_PATHS.SHI}`,
    su: `${_basePath}${JSON_PATHS.SU}`,
    se: `${_basePath}${JSON_PATHS.SE}`,
    so: `${_basePath}${JSON_PATHS.SO}`,
  }

  const _t = {
    ta: `${_basePath}${JSON_PATHS.TA}`,
    chi: `${_basePath}${JSON_PATHS.CHI}`,
    tsu: `${_basePath}${JSON_PATHS.TSU}`,
    te: `${_basePath}${JSON_PATHS.TE}`,
    to: `${_basePath}${JSON_PATHS.TO}`,
  }

  const _n = {
    na: `${_basePath}${JSON_PATHS.NA}`,
    ni: `${_basePath}${JSON_PATHS.NI}`,
    nu: `${_basePath}${JSON_PATHS.NU}`,
    ne: `${_basePath}${JSON_PATHS.NE}`,
    no: `${_basePath}${JSON_PATHS.NO}`,
  }

  const _h = {
    ha: `${_basePath}${JSON_PATHS.HA}`,
    hi: `${_basePath}${JSON_PATHS.HI}`,
    fu: `${_basePath}${JSON_PATHS.FU}`,
    he: `${_basePath}${JSON_PATHS.HE}`,
    ho: `${_basePath}${JSON_PATHS.HO}`,
  }

  const _m = {
    ma: `${_basePath}${JSON_PATHS.MA}`,
    mi: `${_basePath}${JSON_PATHS.MI}`,
    mu: `${_basePath}${JSON_PATHS.MU}`,
    me: `${_basePath}${JSON_PATHS.ME}`,
    mo: `${_basePath}${JSON_PATHS.MO}`,
  }

  const _y = {
    ya: `${_basePath}${JSON_PATHS.YA}`,
    yu: `${_basePath}${JSON_PATHS.YU}`,
    yo: `${_basePath}${JSON_PATHS.YO}`,
  }

  const _r = {
    ra: `${_basePath}${JSON_PATHS.RA}`,
    ri: `${_basePath}${JSON_PATHS.RI}`,
    re: `${_basePath}${JSON_PATHS.RE}`,
    ro: `${_basePath}${JSON_PATHS.RO}`,
  }

  const _wa = {
    wa: `${_basePath}${JSON_PATHS.WA}`,
  }

  let _isPreLoadSuccessful = true;

  async function preloadVocabData() {           // [LE7] [LE8]
    console.group("preloadVocabData()");
    console.info("Preloading vocab JSON files...");

    _showLoadingMsg();
    
    const allKeys = _mergeVocabKeys();           // Combine all syllable keys into one array

    const promises = allKeys.map(key => {
      const jsonPath = _getJSONPath(key);        // Finds the file path

      return jsonPath ? fetch(jsonPath)
          .then(response => {
            if (!response.ok) throw new Error ("File not found!");

            const contentType = response.headers.get("content-type") || ""; // [sn24]  If the header doesn’t exist, it defaults to an empty string (""), preventing errors when checking.
            if (!contentType.includes("application/json")) {                // If the server responds with Content-Type: 'application/json; charset=UTF-8' instead of 'application/json', 
              throw new TypeError(`Expected JSON, got ${type}`);            // ...this allows variations like "application/json; charset=UTF-8" to pass the check.
            }

            return response.json();             // If everything's ok, convert response to JSON
          })    
          .then(vocabList => ({ key, vocabList }))        // Wraps data with key { key: "a", data: [...data from n5-vocab-a.json...]}                
          .catch(error => {
            console.warn(`Failed to load ${key}:`, error);
            _isPreLoadSuccessful = false;          // Set the flag 
            return { key, vocabList: [] };         // Store empty array on failure (Ensure structure remains consistent)
          })
        : Promise.resolve({ key, vocabList: [] }); // Handle missing keys gracefully
    });

    // Wait for all JSON files to load
    const results = await Promise.all(promises);// [ {key: "a", data: []}, {key: "i, data: []}, {}, {}]

    // Convert results 'array' into an 'object' and store in appData.preloadedVocab
    appData.preloadedVocab = Object.fromEntries(results.map( ({ key, data }) => [key, data] )); // [sn23] Object.fromEntries => {a: [], i: []}
    
    console.info("Preloading completed.", _isPreLoadSuccessful, appData.preloadedVocab);
    console.groupEnd();
  }

  // To combine all keys dynamically from _vowels, _k, s, etc.
  function _mergeVocabKeys() {
    return [
      ...Object.keys(_vowels),  
      ...Object.keys(_k),
      ...Object.keys(_s),
      ...Object.keys(_t),
      ...Object.keys(_n),
      ...Object.keys(_h),
      ...Object.keys(_m),
      ...Object.keys(_y),
      ...Object.keys(_r),
      ...Object.keys(_wa),
    ]
  }

  // To find JSON path depending on the key given
  function _getJSONPath(key) { 
    const groups = [_vowels, _k, _s, _t, _n, _h, _m, _y, _r, _wa];
    for (const group of groups) {
      if (group[key]) return group[key];
    }
    return null;
  }

  // when user click submit(start) button of the setting form
  async function start(e) {  
    e.preventDefault();                 // Prevent form from submitting the usual way
    _validateAndSetInputData(e);         // validate and set defaults to the input data.
    clearError();                    // Remove error messages
    if (appState.qMode === "stored") {
      if(!_validateStoredMemory()) {     // To validate whether memory is empty or not
        runtimeError("mem0");
        return;
      }
      await _loadStoredJSON();           // Continue if there is no runtime error. (Wait for _loadStoredJSON to complete)
      _initializeQuiz();
    }
       
    if (appState.qMode === "fresh") {
      if (_validateSyllable()) {
        await _loadFreshJSON();          // Wait for _loadFreshJSON to complete

        // Only check the runtime error if _validateSyllable() returns true ...
        // ... Otherwise program shows infinite loop error without necessary.
        const hasSufficientAnswers = runtimeError("iLoop"); // If vocab pool is too small that it is causing the infinite loop    
        if (!hasSufficientAnswers) {    // Now checks if there is NOT a runtime error
          console.error("Program failed at loaderManager()");
          return;                       // Exit if there is an infinite loop error
        }
        
        // Continue if there is no runtime error.
        _initializeQuiz();
      }
    } 
  }

  // To validate whether memory is empty or not
  function _validateStoredMemory() {
    let storedLength = readStoredLength();
    if (storedLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  // Function to initialize quiz settings and UI setup
  function _initializeQuiz() {
    _moveForm();
    
    floatingBtnsHideAll();
    toggleFormDisplay();
    hideResumeShowBack();

    resetQuestionCount();
    resetTotalNoOfQuestion();
    getTotalNoOfQuestions("fresh");  // for status bar, reset and set No. of Question
              
    resetCumulativeVariables();       // reset cumulative variables (cannot use method chaining with `getTotalNoOfQuestion()`)

    newQuestion();
    
    clearError();                              // To remove error messages
  }

  // to validate input data and set defaults if necessary
  function _validateAndSetInputData(e) {
    console.groupCollapsed("_validateAndSetInputData()");

    _validateToggleSwitch(['randomYesNo', 'flashYesNo']);
    validateAndSetAnswerCount();      // Validate number of answers and set default if invalid
    validateAndSetQuestionMode();     // Validate question mode and set default
    
    helpers.assignLanguage(           // Always set message section of the form to English
      selectors.sectionMessage, 
      defaultConfig.enLang
    ); 

    appState.qChoiceInput = selectors.readqChoiceInput ?? "hi"; // read user's question choice and assign it to global variable
    appState.aChoiceInput = selectors.readaChoiceInput ?? "en"; 

    assignLanguageBySelection();      // Validate and assign the correct language for the question and answer sections

    console.info("appState.qChoiceInput: ", appState.qChoiceInput, "appState.aChoiceInput: ", appState.aChoiceInput);
    
    console.groupEnd();
  }
  
  // to load user selected sylable-json when program mode is "fresh"
  async function _loadFreshJSON() {
    console.groupCollapsed("_loadFreshJSON()");
    console.info("appData.preloadedVocab:", appData.preloadedVocab);

    setQuestionMode("fresh");
  
    if (appData.syllableChoice.includes("all")) {     // If "all" is selected
      appData.syllableChoice = _mergeVocabKeys();      //[sn9] This replaces syllableChoice with all syllables
    }

    // Create an array of Promises dynamically resolving the key's group
    const promises = appData.syllableChoice.map(key => {
      console.info("key:", key, "Value:", appData.preloadedVocab[key]);

      if (appData.preloadedVocab[key]) { 
        return Promise.resolve(appData.preloadedVocab[key]); // Use preloaded data
      } else {
        let jsonPath = _getJSONPath(key);
        return jsonPath 
          ? fetch(jsonPath)                     // [sn21] Fetch the JSON file
            .then(response => response.json())  // Processes the response by converting it into a JavaScript object.
            : Promise.resolve([]);              // [sn22] Skip missing keys gracefully by returning a resolved Promise with an empty array ([]).
      }
    });

    const results = await Promise.all(promises);
    appData.vocabArray = results.flat();

    // Filter out blank questions (no kanji character etc.)
    appData.vocabArray = removeBlankQuestions(appData.vocabArray);
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);

    populateVocabProperties();

    console.groupEnd();
  }

  // To Fetch the relevant categories
  function populateVocabProperties() {
    helpers.copyOneProperty(appData.vocabArray, appData.kaVocab, defaultConfig.ka);
    helpers.copyOneProperty(appData.vocabArray, appData.hiVocab, defaultConfig.hi);
    helpers.copyOneProperty(appData.vocabArray, appData.enVocab, defaultConfig.en);
  }

  // To load local storage json when program mode is "stored"
  async function _loadStoredJSON() {
    console.groupCollapsed("_loadStoredJSON()");

    setQuestionMode("stored");                        // Set program's question mode to 'stored'
    
    const storedData = loadMistakesFromMistakeBank();
    if (!Array.isArray(storedData)) {                             // Ensure loadMistakesFromMistakeBank returns an array
        console.error("Error: Stored data is not an array! Check your loadMistakesFromMistakeBank function.");
        return;
    }
    
    appData.vocabArray = storedData;                               // Assign fetched storedData to appData.vocabArray    
    appData.vocabArray = removeBlankQuestions(appData.vocabArray); // Filter out blank questions (missing kanji etc.)
    console.log("vocabArray(after removeBlankQuestion(): ", appData.vocabArray);
    
    if (appData.vocabArray.length === 0) {  
        console.log("Inside _loadStoredJSON(), vocabArray.length: ", appData.vocabArray.length);
        console.error("Error: vocabArray is empty after loading stored data!");
        return;
    }

    populateVocabProperties();                                      // Fetch the relevant categories

    console.groupEnd();
  }

  // To resume the existing program
  function resumeProgram() {
    console.groupCollapsed("resumeProgram()");

    loadState();
    console.log("loadState: ", appState, appData, currentStatus);

    populateVocabProperties(); // Fetch the relevant categories
    assignLanguageBySelection();

    newQuestion();

    console.groupEnd();
  }

  // There are some questions without kanji; if user select 'kanji' in 'question', 
  // ... this function is to prevent showing blank question on screen
  function removeBlankQuestions(originalArr) {
    let updatedArr = [];
    for (let i of originalArr) {
      if (appState.qChoiceInput && i[appState.qChoiceInput] !== "") {
        updatedArr.push(i);
      }
    }

    return updatedArr; // Return the updated array
  }

  // To load stored data from local storage and show info at the settings
  function loadMemoryData() {
    console.groupCollapsed("loadMemoryData");

    let storedLength = readStoredLength();
    console.info("storedLength:", storedLength);

    switch (storedLength) {     // build 'mistake status' on home screen
      case 0:
        buildMemoryStatus('Memory is empty.');
        break;
      case 1:
        buildMemoryStatus(`${storedLength} word to repractice.`);
        break;
      default:
        buildMemoryStatus(`${storedLength} words to repractice.`);
        break;
    }
    
    buildMemoryBtns("flush");   // build 'flush' and 'list' buttons on screen
    buildMemoryBtns("list");
    
    console.groupEnd();
    return this;

    // Utility functions private to the module
    function buildMemoryStatus(content) {
      domUtils.buildNode({
        parent: selectors.memoryInfo,
        child: 'div',
        content: content,
        className: 'memory-info',
        id: 'memory-info',
      });
    }

    function buildMemoryBtns(key) {
      const MEMORY_BUTTON_CONFIG = {
        flush: {
          icon: '<i class="fa-solid fa-trash-can"></i>',
          className: 'flush-memory-setting-btn',
          id: 'flush-memory-btn',
          handler: flushMistakeBank,
        },
    
        list: {
          icon: '<i class="fa-solid fa-rectangle-list"></i>',
          className:'list-memory-setting-btn',
          id: 'list-memory-btn',
          handler: _handleListMistakeBtn,
        }
      }  
      
      if (!MEMORY_BUTTON_CONFIG[key]) {
        console.error(`Invalid key "${key}" passed to buildMemoryBtns`);
        return;
      }
      
      const { icon, className, id, handler } = MEMORY_BUTTON_CONFIG[key];

      domUtils.buildNode({
        parent: selectors.memoryBtns,
        child: 'div',
        content: icon,
        className: className,
        id: id,
        eventFunction: handler,
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

  // Validate syllable choices and show error if necessary
  function _validateSyllable() {
    console.groupCollapsed("_validateSyllable()");
    // Validate syllable choices and show an error if none are selected
    appData.syllableChoice = helpers.convertCheckedValuesToArray('input[name="syllableChoice"]:checked');
    if (appState.qMode === "fresh" && appData.syllableChoice.length === 0) {
      runtimeError("noSL");
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
  function _validateToggleSwitch(selectorNames) {
    console.groupCollapsed("_validateToggleSwitch()");

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

    if (readStoredLength() <= 3) {
      appState.noOfAnswers = 2; // if stored data pool is too small, it will lead to an infinite loop.
      console.warn("StoredJSON pool is too small. noOfAnswer set to `2`");
    }
    await _loadStoredJSON();   // Wait for _loadStoredJSON to complete

    getTotalNoOfQuestions("stored");
    newQuestion();

    console.groupEnd();
  }

  // When user want to restart the program
  function restart() {
    domUtils.clearScreen(selectors.sectionStatus);
    
    /*displayUtils
      .toggleClass('overlay-message', selectors.sectionMessage)
      .toggleClass('fade-hide', selectors.sectionMessage);*/

    toggleFormDisplay();
    _debouncedMoveForm();
    
    rePrintMemory();
  }

  // To list mistakes from stored data
  function listMistakes() {
    console.groupCollapsed("listMistakes()");

    const mistakeArray = loadMistakesFromMistakeBank(); // Load mistakes from localStorage
    
    // Container to display the mistakes
    domUtils.buildNode({                  
      parent: selectors.sectionQuestion,
      child: 'div',
      content: '',
      className: 'mistake-list-container', // New class for the container
      id: 'mistake-list-div',
    });
  
    // Select the mistake-list-container created
    const mistakeListContainer = document.querySelector("#mistake-list-div-0");
  
    // Header for the mistake list (4 columns: #, Kanji, Hiragana, English)
    const headerContent = ['#', 'Kanji', 'Hiragana', 'English'];
  
    // Build the row for headers
    domUtils.buildNode({
      parent: mistakeListContainer,
      child: 'div',
      content: '', // Empty content, as we'll append children later
      className: 'mistakes-row-header', 
      id: 'mistakes-heading',
    });
  
    // Select the newly created header div
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
        id: `mistakeList-row-${index}`, // Unique ID for each row
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

  // To show 'loading...' while preloading all jsons
  function _showLoadingMsg() {
    console.groupCollapsed("_showLoadingMsg()");
    
    addLoadingMsg('Loading...');
    
    console.groupEnd();
    
    // To add loading message on `body`
    function addLoadingMsg(msg) {
      domUtils.buildNode({                      // temporarily create a new node on 'body'
        parent: selectors.body,
        child: 'div',
        content: msg,
        className: 'poppins-regular',
        id: 'preload-info',
      });

      const loadingMsg = document.querySelector("#preload-info-0"); 
      displayUtils.addClass('show', loadingMsg);
    }
  }

  // Depending on the `_isPreLoadSuccessful` flag, cleans up 'loading...' message or adds 'fail' on screen
  async function checkPreLoadState() {
    console.groupCollapsed("checkPreLoadState()");
    
    console.info("_isPreLoadSuccessful:", _isPreLoadSuccessful);

    if (_isPreLoadSuccessful) _preloadSuccess();
    else _preloadFail();

    console.groupEnd();
  }

  function _preloadSuccess() {
    console.info("Preload successful");
    const loadingMsg = document.querySelector("#preload-info-0");
    _removeLoadingMsg(loadingMsg);                               // remove 'loading...' from screen
    displayUtils.toggleClass('disabled', selectors.settingForm);  // release the form from 'so-dim' state
    return true;
  }

  function _preloadFail() {
    console.info("Preload fail");
    const loadingMsg = document.querySelector("#preload-info-0");
    if (loadingMsg) {
    loadingMsg.textContent = 'Loading fail!';
    } else {
      console.error("Preload message element not found.");
    }
    return false;
  }

  // To remove the loading message from `body`
  function _removeLoadingMsg(msg) {
    domUtils.clearNode({
      parent: selectors.body,
      children: msg,
    });
    console.info("removed preload message from screen:", msg);
  }

  return {
    setLoaderManagerCallbacks,
    preloadVocabData,
    start,
    loadMemoryData,
    validateAndSetAnswerCount,
    rePrintMemory,
    continuetoStoredData,
    restart,
    listMistakes,
    resumeProgram,
    resetAfterFlushingMistakes,
    checkPreLoadState,
  }
}