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
  utilsManager, null, null, null);

// Loader Manager
const loaderMgr = loaderManager(globals, floatingBtnsHideAll, hideResumeShowBack, toggleFormDisplay, utilsManager, listenerMgr, null);

const questionMgr = questionManager(globals, utilsManager, null, null);

// Answer Manager
const answerMgr = answerManager(
  globals, 
  utilsManager, 
  questionMgr, 
  loaderMgr, null, null);
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
  loaderMgr, 
  questionMgr);
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
  loaderMgr, 
  storeToMistakeBank, 
  removeFromMistakeBank, 
  setRanOnce);

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
setAnswerManagerCallbacks(answerListenersMgr, readStoredLength);

questionMgr.setQuestionManagerCallbacks(
  renderAnswers, 
  noMoreQuestion, 
  increaseQuestionCount, 
  printQuestionStatus, 
  updateCumulativeAverage, 
  removeSpecifiedQuestion, 
  saveState);

loaderMgr.setLoaderManagerCallbacks(
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

listenerMgr.setListenerManagerCallbacks(
  loaderMgr, 
  questionMgr, 
  setRanOnce, 
  clearError, 
  statusMgr);

(async function initialize() {
  console.groupCollapsed("initialize()");

  await loaderMgr.preloadVocabData();            // ensures that the function fully completes before moving on 
  await loaderMgr.checkPreLoadState();
  onPreloadComplete();

  console.groupEnd();
 
  // Utility functions private to the module
  function onPreloadComplete() {
    console.groupCollapsed("onPreloadComplete()");
    
    loaderMgr.loadMemoryData();
    listenerMgr.generalListeners();
    controlMgr.floatingBtnsHideAll();
    
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
    if (statusMgr.stillInProgress()) {
      statusMgr.goodToResume =  true;
      controlMgr.hideBackShowResume();
    }
  }
})();