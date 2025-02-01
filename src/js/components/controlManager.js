export function controlManger(globals, utilsManager) {
  const { selectors } = globals;
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
    displayUtils.removeClass('hide', // remove 'hide' class
      selectors.bringBackBtn,
      selectors.resumePracticeBtn,
    );
    displayUtils.addClass('hide', // add 'hide' class
      selectors.resumePracticeBtn,
    );
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
    displayUtils.toggleClass('moved', selectors.settingForm);
    displayUtils.toggleClass('disabled', selectors.settingForm);
    displayUtils.toggleClass('dim', ...selectors.allSetting);

    const dynamicDOMClassList = selectors.dynamicDOM.classList;
    let dynamicDOMClassToToggle;
    if ((specialCSSClass === 'shift-sections-to-top-center') || dynamicDOMClassList.contains('shift-sections-to-top-center')) {
      dynamicDOMClassToToggle = 'shift-sections-to-top-center';
    } else {
      dynamicDOMClassToToggle = 'shift-sections-to-center';
    }

    setTimeout(() => {
      displayUtils.toggleClass(dynamicDOMClassToToggle, selectors.dynamicDOM);
    }, 400);

    displayUtils.toggleClass('hide',
      selectors.sectionStatus,
    );

    console.groupEnd();
    return this;
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

  function preloadState() {
    console.groupCollapsed("preloadState()");
    //displayUtils.toggleClass('so-dim', selectors.settingForm);
    domUtils.buildNode({
      parent: selectors.body,
      child: 'div',
      content: 'Loading...',
      className: 'poppins-regular',
      idName: 'preload-info',
    });

    document.addEventListener('DOMContentLoaded', function() {
      const loading = document.querySelector("#preload-info-0");
      if (loading) {
        displayUtils.addClass('show', loading);
      } else {
        console.error("Element #preload-info-0 not found in the DOM.");
      }
    });

    console.groupEnd();
  }

  return {
    floatingBtnsHideAll,
    hideResumeShowBack,
    hideBackShowResume,
    toggleFormDisplay,
    resetQuestionMode,
    preloadState,
  }
}