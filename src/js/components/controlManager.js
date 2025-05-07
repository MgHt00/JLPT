import { CSS_CLASS_NAMES } from "../constants/cssClassNames.js";

export function controlManger(globals, utilsManager) {
  const { selectors } = globals;
  const { displayUtils } = utilsManager;

  const { HIDE, MOVED, DISABLED, DIM, SHADES_ON_TOP, SHIFT_TO_TOP_CENTER, SHIFT_TO_CENTER } = CSS_CLASS_NAMES;

  // To hide both bringBack and resumePracticeBtn
  function floatingBtnsHideAll() {
    console.groupCollapsed("floatingBtnsHideAll()");

    displayUtils.removeClass(HIDE, 
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass(HIDE, 
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    console.groupEnd();
    return this;
  }

  // To hide resumePracticeBtn; show bringBackBtn
  function hideResumeShowBack() {
    console.groupCollapsed("hideResumeShowBack()");
    displayUtils.removeClass(HIDE, 
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass(HIDE, 
      selectors.resumePracticeBtn,
    );
    console.groupEnd();
    return this;
  }

  // To hide bringBackBtn; show resumePracticeBtn
  function hideBackShowResume() {
    displayUtils.removeClass(HIDE, 
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass(HIDE, 
      selectors.bringBackBtn,
    );
    return this;
  }

  // To toggle buttons and sections when move / resume btn is clicked
  function toggleFormDisplay(specialCSSClass) {
    console.groupCollapsed("toggleFormDisplay()");

    toggleClasses();

    const dynamicDOMClassList = selectors.dynamicDOM.classList;

    let dynamicDOMClassToToggle;

    if ((specialCSSClass === SHIFT_TO_TOP_CENTER) || dynamicDOMClassList.contains(SHIFT_TO_TOP_CENTER)) {
      dynamicDOMClassToToggle = SHIFT_TO_TOP_CENTER;
    } else {
      dynamicDOMClassToToggle = SHIFT_TO_CENTER;
    }

    setTimeout(() => {
      displayUtils.toggleClass(dynamicDOMClassToToggle, selectors.dynamicDOM);
    }, 400);

    displayUtils.toggleClass(HIDE, selectors.sectionStatus);

    console.groupEnd();
    return this;

    // functions private to the module
    function toggleClasses() {
      displayUtils
        .toggleClass(MOVED, selectors.settingForm)
        .toggleClass(DISABLED, selectors.settingForm)
        .toggleClass(DIM, ...selectors.allSetting);
    }
  }

  // To reset Question mode when something changes on the setting form
  function resetQuestionMode() {
    displayUtils.removeClass(DISABLED,
      selectors.settingSyllable,
      selectors.settingRepractice, 
    );
    displayUtils.addClass(DISABLED,
      selectors.settingRepractice, 
    );

    selectors.sourceFresh.checked = true; // Set the 'source-fresh' radio input to checked
  }

  function toggleShadesOnTop() {
    console.groupCollapsed("toggleShadesOnTop()");
    
    const className = SHADES_ON_TOP;
    const selector = selectors.bringBackBtnContainer;

    displayUtils.checkClass(className, selector)
      ? removeShades()
      : addShades();
    
    console.groupEnd();
    return this;

    // helper functions
    function removeShades() {
      displayUtils.removeClass(className, selector)
      console.info("Shades removed.");
    }

    function addShades() {
      displayUtils.addClass(className, selector);
      console.info("Shades added.");
    }
  }

  return {
    floatingBtnsHideAll,
    hideResumeShowBack,
    hideBackShowResume,
    toggleFormDisplay,
    resetQuestionMode,
    toggleShadesOnTop,
  }
}