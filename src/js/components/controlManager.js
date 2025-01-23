export function controlManger() {

  // To hide both bringBack and resumePracticeBtn
  function floatingBtnsHideAll() {
    console.groupCollapsed("floatingBtnsHideAll()");

    removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    addClass('hide', // add 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    console.groupEnd();
    return this;
  }

  // To hide resumePracticeBtn; show bringBackBtn
  function hideResumeShowBack() {
    removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    addClass('hide', // add 'hide' class
      selectors.resumePracticeBtn,
    );
    return this;
  }

  // To hide bringBackBtn; show resumePracticeBtn
  function hideBackShowResume() {
    removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    addClass('hide', // add 'hide' class
      selectors.bringBackBtn,
    );
    return this;
  }

  // To toggle buttons and sections when move / resume btn is clicked
  function toggleFormDisplay(specialCSSClass) {
    console.groupCollapsed("toggleFormDisplay()");
    toggleClass('moved', selectors.settingForm);
    toggleClass('disabled', selectors.settingForm);
    toggleClass('dim', ...selectors.allSetting);

    const dynamicDOMClassList = dynamicDOM.classList;
    let dynamicDOMClassToToggle;
    if ((specialCSSClass === 'shift-sections-to-top-center') || dynamicDOMClassList.contains('shift-sections-to-top-center')) {
      dynamicDOMClassToToggle = 'shift-sections-to-top-center';
    } else {
      dynamicDOMClassToToggle = 'shift-sections-to-center';
    }

    setTimeout(() => {
      toggleClass(dynamicDOMClassToToggle, dynamicDOM);
    }, 400);

    toggleClass('hide',
      sectionStatus,
    );

    console.groupEnd();
    return this;
  }

  // To reset Question mode when something changes on the setting form
  function resetQuestionMode() {
    removeClass('disabled',
      selectors.settingSyllable,
      selectors.settingRepractice, 
    );
    addClass('disabled',
      selectors.settingRepractice, 
    );

    document.querySelector("#source-fresh").checked = true; // Set the 'source-fresh' radio input to checked
  }

  return {
    floatingBtnsHideAll,
    hideResumeShowBack,
    hideBackShowResume,
    toggleFormDisplay,
    resetQuestionMode,
  }
}