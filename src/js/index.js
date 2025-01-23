import { listenerManager } from "./components/listenerManager.js";
import { loaderManager } from "./components/loaderManager.js";
import { controlManger } from "./components/controlManager.js";
import { questionManager } from "./components/questionManager.js";
import { answerManager } from "./components/answerManager.js";
import { answerListnerManager } from "./components/answerListnerManager.js";
import { vocabManager } from "./components/vocabManager.js";
import { errorManager } from "./components/errorManager.js";
import { statusManager } from "./components/statusManager.js";

const listenerInstance = listenerManager(null, null, null, null);
const loaderInstance = loaderManager(listenerInstance, null, null, null);
const controlInstance = controlManger();

const questionMgr = questionManager(null);
const answerMgr = answerManager(questionMgr, loaderInstance, null);
const answerListenersMgr = answerListnerManager(questionMgr, loaderInstance);
const vocabMgr =  vocabManager(loaderInstance, questionMgr);
const vocabInstance = vocabManager(loaderInstance, questionMgr);
const errorInstance = errorManager(answerMgr);
const statusInstance = statusManager();

// resetting the null instaces passed while creating the Managers.
answerMgr.setInstances(answerListenersMgr);
questionMgr.setInstances(answerMgr);

loaderInstance.setInstances(controlInstance, questionMgr, vocabInstance);
listenerInstance.setInstances(loaderInstance, controlInstance, questionMgr, answerMgr);

(function defaultState() {
  console.groupCollapsed("defaultState()");

  loaderInstance.loadMemoryData();

  toggleClass('disabled', ...selectors.noOfAnsAll); // [sn14]
  toggleClass('overlay-message', sectionMessage);
  toggleClass('fade-hide', sectionMessage);
  controlInstance.floatingBtnsHideAll();
  toggleClass('disabled', selectors.settingRepractice);
  toggleClass('hide', selectors.settingNoOfAnsERRblk);
  listenerInstance.generalListeners();

  // if the program is still in progress, load data from local storage to global objects
  if (statusInstance.stillInProgress()) {
    statusInstance.goodToResume =  true;
    controlInstance.hideBackShowResume();
  }

  console.groupEnd();
})();