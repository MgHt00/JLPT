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
const {floatingBtnsHideAll, hideResumeShowBack, hideBackShowResume, toggleFormDisplay, resetQuestionMode, toggleShadesOnTop } = controlMgr;

// Listener Manager
const listenerMgr = listenerManager(
  globals,
  { floatingBtnsHideAll, hideResumeShowBack, hideBackShowResume, toggleFormDisplay, resetQuestionMode, toggleShadesOnTop },
  utilsManager, null, null, null, null, null, null);

// Loader Manager
const loaderMgr = loaderManager(globals, floatingBtnsHideAll, hideResumeShowBack, toggleFormDisplay, utilsManager, listenerMgr, null, null, null, null, null);

const questionMgr = questionManager(globals, utilsManager, null, null, null);

// Answer Manager
const answerMgr = answerManager(globals, utilsManager, questionMgr, loaderMgr, null, null);
const { vocabMapping, setAnswerManagerCallbacks, renderAnswers, noMoreQuestion, setRanOnce } = answerMgr;


const vocabMgr =  vocabManager(globals, utilsManager, loaderMgr, questionMgr);

// Answer Listeners Manager
const answerListenersMgr = answerListnerManager(globals, utilsManager, questionMgr, loaderMgr, vocabMgr, setRanOnce);


const errMgr = errorManager(globals, utilsManager, vocabMapping);
const statusMgr = statusManager(globals, utilsManager);

/**
 * Initializes and sets up dependencies for various manager instances.
 * Each instance is provided with the required dependencies to enable
 * communication and functionality across different components of the application.
 * 
 * - `answerMgr.setInstances(answerListenersMgr)`: Links the Answer Manager with the Answer Listeners Manager to handle user input and answer validation.
 * - `questionMgr.setInstances(answerMgr, statusMgr, vocabMgr)`: Configures the Question Manager with dependencies for managing answers, status tracking, and vocabulary data.
 * - `loaderMgr.setInstances(controlMgr, questionMgr, vocabMgr, errMgr, statusMgr)`: Sets up the Loader Manager with control, question, vocabulary, error, and status managers for managing application flow and state.
 * - `listenerMgr.setInstances(loaderMgr, controlMgr, questionMgr, answerMgr)`: Establishes connections for the Listener Manager, enabling it to coordinate interactions between the loader, control, question, and answer managers.
 */
setAnswerManagerCallbacks(answerListenersMgr, vocabMgr);
questionMgr.setInstances(renderAnswers, noMoreQuestion, statusMgr, vocabMgr);

loaderMgr.setInstances(questionMgr, vocabMgr, errMgr, statusMgr);
listenerMgr.setInstances(loaderMgr, questionMgr, setRanOnce, errMgr, statusMgr);


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