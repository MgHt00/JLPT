import { globals } from "./services/globals.js";

import { listenerManager } from "./components/listenerManager.js";
import { loaderManager } from "./components/loaderManager.js";
import { controlManger } from "./components/controlManager.js";
import { questionManager } from "./components/questionManager.js";
import { answerManager } from "./components/answerManager.js";
import { answerListnerManager } from "./components/answerListnerManager.js";
import { vocabManager } from "./components/vocabManager.js";
import { errorManager } from "./components/errorManager.js";
import { statusManager } from "./components/statusManager.js";

import { utilsManager } from "./utils/utilsManager.js";

const { appData, selectors } = globals;
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
  utilsManager, null);
const {
  setListenerManagerCallbacks,
  generalListeners,
  moveForm,
  handleListMistakeBtn,
  debouncedMoveForm } = listenerMgr;

// Loader Manager
const loaderMgr = loaderManager(
  globals, 
  floatingBtnsHideAll, 
  hideResumeShowBack, 
  toggleFormDisplay, 
  utilsManager, 
  moveForm, handleListMistakeBtn, debouncedMoveForm, 
  null);
const {
  setLoaderManagerCallbacks,
  preloadVocabData,
  start,
  loadMemoryData,
  loadStoredJSON,
  validateAndSetAnswerCount,
  rePrintMemory,
  continuetoStoredData,
  restart,
  listMistakes,
  resumeProgram,
  resetAfterFlushingMistakes,
  showLoadingMsg,
  checkPreLoadState,
} = loaderMgr;

// Question Manager
const questionMgr = questionManager(globals, utilsManager, null, null);
const {
  setQuestionManagerCallbacks,
  newQuestion,
  finalizeQuestionAndProceed,
  setQuestionMode,
  readQuestionObj,
  readQuestionMode } = questionMgr;

// Answer Manager
const answerMgr = answerManager(
  globals, 
  utilsManager, 
  setQuestionMode, readQuestionObj, readQuestionMode, 
  restart);
const { 
  vocabMapping, 
  setAnswerManagerCallbacks, 
  renderAnswers, 
  noMoreQuestion, 
  setRanOnce } = answerMgr;

// Vocab Manager
const vocabMgr =  vocabManager(
  globals, 
  utilsManager, 
  loadMemoryData, resetAfterFlushingMistakes,
  readQuestionObj);
const { 
  removeSpecifiedQuestion, 
  storeToMistakeBank, 
  removeFromMistakeBank, 
  flushMistakeBank, 
  loadMistakesFromMistakeBank, 
  saveState, 
  loadState, 
  clearState, 
  readStoredLength } = vocabMgr;

// Answer Listeners Manager
const answerListenersMgr = answerListnerManager(
  globals, 
  utilsManager, 
  questionMgr, 
  continuetoStoredData, restart,
  storeToMistakeBank, 
  removeFromMistakeBank, 
  setRanOnce);
const {
  handleFlashcardFlip,
  handleMultipleChoiceAnswer,
  handleFlashCardYesNoAnswer,
  handleContinueToStoredData,
} = answerListenersMgr;

// Error Manager
const errMgr = errorManager(globals, utilsManager, vocabMapping);
const { runtimeError, showError, clearError } = errMgr;

// Status Manager
const statusMgr = statusManager(globals, utilsManager);
const {
  resetQuestionCount,
  resetTotalNoOfQuestion,
  getTotalNoOfQuestions,
  readQuestionCount,
  increaseQuestionCount,
  printQuestionStatus,
  resetCumulativeVariables,
  updateCumulativeAverage,
  stillInProgress,
  goodToResume } = statusMgr;

/**
 * Initializes and sets up dependencies for various manager instances.
 * Each instance is provided with the required dependencies to enable
 * communication and functionality across different components of the application. 
 */
setAnswerManagerCallbacks(
  handleFlashcardFlip,
  handleMultipleChoiceAnswer,
  handleContinueToStoredData, 
  readStoredLength);

setQuestionManagerCallbacks(
  renderAnswers, 
  noMoreQuestion, 
  increaseQuestionCount, 
  printQuestionStatus, 
  updateCumulativeAverage, 
  removeSpecifiedQuestion, 
  saveState);

setLoaderManagerCallbacks(
  questionMgr, 
  flushMistakeBank, 
  loadMistakesFromMistakeBank, 
  loadState, 
  readStoredLength, 
  runtimeError, 
  clearError, 
  resetQuestionCount,
  resetTotalNoOfQuestion,
  getTotalNoOfQuestions,
  resetCumulativeVariables);

setListenerManagerCallbacks(
  start, validateAndSetAnswerCount, rePrintMemory, listMistakes, resumeProgram,
  questionMgr, 
  setRanOnce, 
  clearError, 
  goodToResume);

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
    if (stillInProgress()) {
      goodToResume =  true;
      hideBackShowResume();
    }
  }
})();