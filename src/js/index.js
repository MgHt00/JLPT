import { globals } from "./services/globals.js";

import { listenerManager } from "./components/listenerManager.js";
import { loaderManager } from "./components/loaderManager.js";
import { controlManger } from "./components/controlManager.js";
import { questionManager } from "./components/questionManager.js";
import { answerManager } from "./components/answerManager.js";
import { answerListnerManager } from "./components/answerListenerManager.js";
import { vocabManager } from "./components/vocabManager.js";
import { errorManager } from "./components/errorManager.js";
import { statusManager } from "./components/statusManager.js";

import { utilsManager } from "./utils/utilsManager.js";

const { selectors } = globals;
const { displayUtils } = utilsManager;

// Control Manager
const controlMgr = controlManger(globals, utilsManager);
const {
  floatingBtnsHideAll, 
  hideResumeShowBack, 
  hideBackShowResume, 
  toggleFormDisplay, 
  resetQuestionMode, 
  toggleShadesOnTop } = controlMgr;

// Listener Manager
const listenerMgr = listenerManager(
  globals,
  { floatingBtnsHideAll, 
    hideResumeShowBack, 
    hideBackShowResume, 
    toggleFormDisplay, 
    resetQuestionMode, 
    toggleShadesOnTop },
    utilsManager);
const {
  setListenerManagerCallbacks,
  generalListeners,
  moveForm,
  handleListMistakeBtn,
  debouncedMoveForm } = listenerMgr;

// Question Manager
const questionMgr = questionManager(globals, utilsManager, null, null);
const {
  setQuestionManagerCallbacks,
  newQuestion,
  finalizeQuestionAndProceed,
  setQuestionMode,
  readQuestionObj,
  readQuestionMode } = questionMgr;

// Vocab Manager
const vocabMgr =  vocabManager(
  globals, 
  utilsManager,
  readQuestionObj);
const { 
  setVocabManagerCallbacks,
  removeSpecifiedQuestion, 
  storeToMistakeBank, 
  removeFromMistakeBank, 
  flushMistakeBank, 
  loadMistakesFromMistakeBank, 
  saveState, 
  loadState, 
  readStoredLength } = vocabMgr;

// Answer Listeners Manager
const answerListenersMgr = answerListnerManager(
  globals, 
  utilsManager, 
  finalizeQuestionAndProceed, setQuestionMode, readQuestionMode, 
  storeToMistakeBank, 
  removeFromMistakeBank);
const {
  setAnswerListnerManagerCallbacks,
  handleFlashcardFlip,
  handleMultipleChoiceAnswer,
  handleContinueToStoredData,
} = answerListenersMgr;

// Error Manager
const errMgr = errorManager(globals, utilsManager);
const { setErrorManagerCallbacks, runtimeError, clearError } = errMgr;

// Status Manager
const statusMgr = statusManager(globals, utilsManager);
const {
  resetQuestionCount,
  resetTotalNoOfQuestion,
  getTotalNoOfQuestions,
  increaseQuestionCount,
  printQuestionStatus,
  resetCumulativeVariables,
  updateCumulativeAverage,
  stillInProgress,
  getGoodToResume,
  setGoodToResume } = statusMgr;

// Loader Manager
const loaderMgr = loaderManager(
  globals, 
  utilsManager, 
  { floatingBtnsHideAll, hideResumeShowBack, toggleFormDisplay }, // controlFns
  { moveForm, handleListMistakeBtn, debouncedMoveForm }, // listenerFns
  { newQuestion, setQuestionMode }, // questionFns
  { flushMistakeBank, loadMistakesFromMistakeBank, loadState, readStoredLength }, // vocabFns
  { runtimeError, clearError }, // errorFns
  { resetQuestionCount, resetTotalNoOfQuestion, getTotalNoOfQuestions, resetCumulativeVariables } // statusFns
); 
const {
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
} = loaderMgr;

// Answer Manager
const answerMgr = answerManager(
  globals, 
  utilsManager, 
  restart,
  readStoredLength,
  { setQuestionMode, readQuestionObj, readQuestionMode }, //questionFns
  { handleFlashcardFlip, handleMultipleChoiceAnswer, handleContinueToStoredData }, // answerListenerFns
  
);
const { 
  vocabMapping, 
  renderAnswers, 
  noMoreQuestion, 
  setRanOnce } = answerMgr;

/**
 * Initializes and sets up dependencies for various manager instances.
 * Each instance is provided with the required dependencies to enable
 * communication and functionality across different components of the application. 
 */

setVocabManagerCallbacks(
  loadMemoryData, resetAfterFlushingMistakes
);

setErrorManagerCallbacks(vocabMapping);

setQuestionManagerCallbacks(
  renderAnswers, 
  noMoreQuestion, 
  increaseQuestionCount, 
  printQuestionStatus, 
  updateCumulativeAverage, 
  removeSpecifiedQuestion, 
  saveState);

setListenerManagerCallbacks(
  start, validateAndSetAnswerCount, rePrintMemory, listMistakes, resumeProgram,
  setQuestionMode, 
  setRanOnce, 
  clearError, 
  getGoodToResume,
  setGoodToResume);

setAnswerListnerManagerCallbacks(
  continuetoStoredData, restart, setRanOnce);

(async function initialize() {
  console.groupCollapsed("initialize()");

  await preloadVocabData();            // ensures that the function fully completes before moving on 
  await checkPreLoadState();
  onPreloadComplete();

  console.groupEnd();
 
  // Utility functions private to the module
  function onPreloadComplete() {
    console.groupCollapsed("onPreloadComplete()");
    
    loadMemoryData();
    generalListeners();
    floatingBtnsHideAll();
    
    defaultStateClassChanges();
    checkInProgress();
    
    console.groupEnd();
  }

  function defaultStateClassChanges() {
    displayUtils.toggleClass('disabled', ...selectors.noOfAnsAll); // [sn14]
    displayUtils.toggleClass('overlay-message', selectors.sectionMessage);
    displayUtils.toggleClass('fade-hide', selectors.sectionMessage);

    displayUtils.toggleClass('disabled', selectors.settingRepractice);
    displayUtils.toggleClass('hide', selectors.settingNoOfAnsERRblk);
  }

  // If the program is still in progress, load data from local storage to global objects
  function checkInProgress() {
    //console.warn(stillInProgress());
    if (stillInProgress()) {
      setGoodToResume(true);
      hideBackShowResume();
    }
  }
})();