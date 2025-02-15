export function controlManger(globals, utilsManager) {
  const { selectors, currentStatus } = globals;
  const { displayUtils, domUtils } = utilsManager;

  // To hide both bringBack and resumePracticeBtn
  function floatingBtnsHideAll() {
    console.groupCollapsed("floatingBtnsHideAll()");

    displayUtils.removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass('hide', // add 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    console.groupEnd();
    return this;
  }

  // To hide resumePracticeBtn; show bringBackBtn
  function hideResumeShowBack() {
    console.groupCollapsed("hideResumeShowBack()");
    displayUtils.removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass('hide', // add 'hide' class
      selectors.resumePracticeBtn,
    );
    console.groupEnd();
    return this;
  }

  // To hide bringBackBtn; show resumePracticeBtn
  function hideBackShowResume() {
    displayUtils.removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass('hide', // add 'hide' class
      selectors.bringBackBtn,
    );
    return this;
  }

  // To toggle buttons and sections when move / resume btn is clicked
  function toggleFormDisplay(specialCSSClass) {
    console.groupCollapsed("toggleFormDisplay()");

    toggleClasses();

    const dynamicDOMClassList = selectors.dynamicDOM.classList;

    const shiftTopCenter = 'shift-sections-to-top-center';
    const shiftCenter = 'shift-sections-to-center';

    let dynamicDOMClassToToggle;

    if ((specialCSSClass === shiftTopCenter) || dynamicDOMClassList.contains(shiftTopCenter)) {
      dynamicDOMClassToToggle = shiftTopCenter;
    } else {
      dynamicDOMClassToToggle = shiftCenter;
    }

    setTimeout(() => {
      displayUtils.toggleClass(dynamicDOMClassToToggle, selectors.dynamicDOM);
    }, 400);

    displayUtils.toggleClass('hide', selectors.sectionStatus);

    console.groupEnd();
    return this;

    // functions private to the module
    function toggleClasses() {
      displayUtils
        .toggleClass('moved', selectors.settingForm)
        .toggleClass('disabled', selectors.settingForm)
        .toggleClass('dim', ...selectors.allSetting);
    }
  }

  // To reset Question mode when something changes on the setting form
  function resetQuestionMode() {
    displayUtils.removeClass('disabled',
      selectors.settingSyllable,
      selectors.settingRepractice, 
    );
    displayUtils.addClass('disabled',
      selectors.settingRepractice, 
    );

    document.querySelector("#source-fresh").checked = true; // Set the 'source-fresh' radio input to checked
  }

  function toggleShadesOnTop() {
    console.groupCollapsed("toggleShadesOnTop()");
    
    const className = "shades-on-top";
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