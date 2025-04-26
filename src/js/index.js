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

// Vocab Manager
const vocabMgr =  vocabManager(globals, utilsManager);
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

// Question Manager
const questionMgr = questionManager(
  globals, utilsManager,
  { increaseQuestionCount, printQuestionStatus, updateCumulativeAverage }, // statusFns
  { removeSpecifiedQuestion, saveState }, // vocabFns
);
const {
  setQuestionManagerCallbacks,
  newQuestion, 
  finalizeQuestionAndProceed,
  setQuestionMode, 
  readQuestionObj,
  readQuestionMode } = questionMgr;

// Loader Manager
const loaderMgr = loaderManager(
  globals, 
  utilsManager, 
  { floatingBtnsHideAll, hideResumeShowBack, toggleFormDisplay }, // controlFns
  { newQuestion, setQuestionMode }, // questionFns
  { flushMistakeBank, loadMistakesFromMistakeBank, loadState, readStoredLength }, // vocabFns
  { runtimeError, clearError }, // errorFns
  { resetQuestionCount, resetTotalNoOfQuestion, getTotalNoOfQuestions, resetCumulativeVariables } // statusFns
); 
const {
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
} = loaderMgr;

// Listener Manager
const listenerMgr = listenerManager(
  globals, 
  utilsManager,
  setQuestionMode, 
  clearError, 
  { floatingBtnsHideAll, hideResumeShowBack, hideBackShowResume, toggleFormDisplay, resetQuestionMode, toggleShadesOnTop }, // controlManager
  { start, validateAndSetAnswerCount, rePrintMemory, listMistakes, resumeProgram }, // loaderFns
  { getGoodToResume, setGoodToResume }, // statusFns
);
const {
  setListenerManagerCallbacks,
  generalListeners,
  moveForm,
  handleListMistakeBtn,
  debouncedMoveForm } = listenerMgr;

// Answer Listeners Manager
const answerListenersMgr = answerListnerManager(
  globals, 
  utilsManager, 
  { storeToMistakeBank, removeFromMistakeBank }, // vocabFns
  { finalizeQuestionAndProceed, setQuestionMode, readQuestionMode }, // questionFns
  { continuetoStoredData, restart }, // loaderFns
);
const {
  setAnswerListnerManagerCallbacks,
  handleFlashcardFlip,
  handleMultipleChoiceAnswer,
  handleContinueToStoredData,
} = answerListenersMgr;

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

/* Initializes and sets up dependencies for various manager instances. */
setQuestionManagerCallbacks(renderAnswers, noMoreQuestion)
setVocabManagerCallbacks(loadMemoryData, resetAfterFlushingMistakes, readQuestionObj);
setErrorManagerCallbacks(vocabMapping);
setLoaderManagerCallbacks(moveForm, handleListMistakeBtn, debouncedMoveForm);
setListenerManagerCallbacks(setRanOnce);
setAnswerListnerManagerCallbacks(setRanOnce);

// Initialize
(async function initialize() {
  console.groupCollapsed("initialize()");

  await preloadVocabData();            // ensures that the function fully completes before moving on 
  await checkPreLoadState();
  _onPreloadComplete();

  console.groupEnd();
 
  // Utility functions private to the module
  function _onPreloadComplete() {
    console.groupCollapsed("_onPreloadComplete()");
    
    loadMemoryData();
    generalListeners();
    floatingBtnsHideAll();
    
    _defaultStateClassChanges();
    _checkInProgress();
    
    console.groupEnd();
  }

  function _defaultStateClassChanges() {
    displayUtils.toggleClass('disabled', ...selectors.noOfAnsAll); // [sn14]
    displayUtils.toggleClass('overlay-message', selectors.sectionMessage);
    displayUtils.toggleClass('fade-hide', selectors.sectionMessage);

    displayUtils.toggleClass('disabled', selectors.settingRepractice);
    displayUtils.toggleClass('hide', selectors.settingNoOfAnsERRblk);
  }

  // If the program is still in progress, load data from local storage to global objects
  function _checkInProgress() {
    //console.warn(stillInProgress());
    if (stillInProgress()) {
      setGoodToResume(true);
      hideBackShowResume();
    }
  }
})();