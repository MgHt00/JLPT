import { globals } from "./services/globals.js";
import { componentManager } from "./components/componentsManager.js";
import { utilsManager } from "./utils/utilsManager.js";

const { appData, selectors } = globals;
const {
  listenerManager,
  loaderManager,
  controlManger,
  questionManager,
  answerManager,
  answerListnerManager,
  vocabManager,
  errorManager,
  statusManager,
} = componentManager;
const { displayUtils } = utilsManager;

const listenerMgr = listenerManager(globals, utilsManager, null, null, null, null, null, null);
const loaderMgr = loaderManager(globals, utilsManager, listenerMgr, null, null, null, null, null);
const controlMgr = controlManger(globals, utilsManager);

const questionMgr = questionManager(globals, utilsManager, null, null, null);
const answerMgr = answerManager(globals, utilsManager, questionMgr, loaderMgr, null, null);
const vocabMgr =  vocabManager(globals, utilsManager, loaderMgr, questionMgr);
const answerListenersMgr = answerListnerManager(globals, utilsManager, questionMgr, loaderMgr, vocabMgr, answerMgr);
const errMgr = errorManager(globals, utilsManager, answerMgr);
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
answerMgr.setInstances(answerListenersMgr, vocabMgr);
questionMgr.setInstances(answerMgr, statusMgr, vocabMgr);

loaderMgr.setInstances(controlMgr, questionMgr, vocabMgr, errMgr, statusMgr);
listenerMgr.setInstances(loaderMgr, controlMgr, questionMgr, answerMgr, errMgr, statusMgr);


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