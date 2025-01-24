import { listenerManager } from "./components/listenerManager.js";
import { loaderManager } from "./components/loaderManager.js";
import { controlManger } from "./components/controlManager.js";
import { questionManager } from "./components/questionManager.js";
import { answerManager } from "./components/answerManager.js";
import { answerListnerManager } from "./components/answerListnerManager.js";
import { vocabManager } from "./components/vocabManager.js";
import { errorManager } from "./components/errorManager.js";
import { statusManager } from "./components/statusManager.js";

const listenerMgr = listenerManager(null, null, null, null);
const loaderMgr = loaderManager(listenerMgr, null, null, null, null, null);
const controlMgr = controlManger();

const questionMgr = questionManager(null, null, null);
const answerMgr = answerManager(questionMgr, loaderMgr, null);
const answerListenersMgr = answerListnerManager(questionMgr, loaderMgr);
const vocabMgr =  vocabManager(loaderMgr, questionMgr);
const errorInstance = errorManager(answerMgr);
const statusInstance = statusManager();

/**
 * Initializes and sets up dependencies for various manager instances.
 * Each instance is provided with the required dependencies to enable
 * communication and functionality across different components of the application.
 * 
 * - `answerMgr.setInstances(answerListenersMgr)`: Links the Answer Manager with the Answer Listeners Manager to handle user input and answer validation.
 * - `questionMgr.setInstances(answerMgr, statusInstance, vocabMgr)`: Configures the Question Manager with dependencies for managing answers, status tracking, and vocabulary data.
 * - `loaderMgr.setInstances(controlMgr, questionMgr, vocabMgr, errorInstance, statusInstance)`: Sets up the Loader Manager with control, question, vocabulary, error, and status managers for managing application flow and state.
 * - `listenerMgr.setInstances(loaderMgr, controlMgr, questionMgr, answerMgr)`: Establishes connections for the Listener Manager, enabling it to coordinate interactions between the loader, control, question, and answer managers.
 */
answerMgr.setInstances(answerListenersMgr);
questionMgr.setInstances(answerMgr, statusInstance, vocabMgr);

loaderMgr.setInstances(controlMgr, questionMgr, vocabMgr, errorInstance, statusInstance);
listenerMgr.setInstances(loaderMgr, controlMgr, questionMgr, answerMgr);

(function defaultState() {
  console.groupCollapsed("defaultState()");

  loaderMgr.loadMemoryData();

  toggleClass('disabled', ...selectors.noOfAnsAll); // [sn14]
  toggleClass('overlay-message', sectionMessage);
  toggleClass('fade-hide', sectionMessage);
  controlMgr.floatingBtnsHideAll();
  toggleClass('disabled', selectors.settingRepractice);
  toggleClass('hide', selectors.settingNoOfAnsERRblk);
  listenerMgr.generalListeners();

  // if the program is still in progress, load data from local storage to global objects
  if (statusInstance.stillInProgress()) {
    statusInstance.goodToResume =  true;
    controlMgr.hideBackShowResume();
  }

  console.groupEnd();
})();