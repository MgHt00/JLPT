import { ELEMENTIDS, ELEMENT_NAMES, GENERATED_DOM } from "../constants/elementIDs.js";

export const selectors = {
  body : document.body,
  sectionQuestion : document.querySelector(`#${ELEMENTIDS.SECTION_QUESTION}`),
  sectionMessage : document.querySelector(`#${ELEMENTIDS.SECTION_MESSAGE}`),
  sectionAnswer : document.querySelector(`#${ELEMENTIDS.SECTION_ANSWER}`),
  sectionStatus : document.querySelector(`#${ELEMENTIDS.SECTION_STATUS}`),
  dynamicDOM : document.querySelector(`#${ELEMENTIDS.DYNAMIC_DOM}`),

  settingForm : document.querySelector(`#${ELEMENTIDS.SETTING_FORM}`),
  settingFlashYesNo : document.querySelector(`#${ELEMENTIDS.SETTING_FLASH_YES_NO}`),
  settingNoOfAns : document.querySelector(`#${ELEMENTIDS.SETTING_NO_OF_ANS}`),
  settingSource: document.querySelector(`#${ELEMENTIDS.SETTING_SOURCE}`),
  settingSyllable : document.querySelector(`#${ELEMENTIDS.SETTING_SYLLABLE}`),
  settingRepractice: document.querySelector(`#${ELEMENTIDS.SETTING_REPRACTICE}`),

  switchRandomYesNo : document.querySelector(`#${ELEMENTIDS.SWITCH_RANDOM_YES_NO}`),
  switchFlashYesNo : document.querySelector(`#${ELEMENTIDS.SWITCH_FLASH_YES_NO}`),
  qChoice : document.querySelector(`#${ELEMENTIDS.QUESTION_CHOICE}`),
  aChoice : document.querySelector(`#${ELEMENTIDS.ANSWER_CHOICE}`),
  fieldsetSyllable : document.querySelector(`#${ELEMENTIDS.FIELDSET_SYLLABLE}`),
  memoryInfo : document.querySelector(`#${ELEMENTIDS.MEMORY_INFO}`),
  memoryBtns : document.querySelector(`#${ELEMENTIDS.MEMORY_BTNS}`),
  sourceFresh: document.querySelector(`#${ELEMENTIDS.SOURCE_FRESH}`),
  submitBtn : document.querySelector(`#${ELEMENTIDS.SUBMIT_BTN}`),
  allSetting : document.querySelectorAll(ELEMENTIDS.ALL_SETTING),
  bringBackBtn : document.querySelector(`#${ELEMENTIDS.BRING_BACK_BTN}`),
  resumePracticeBtn : document.querySelector(`#${ELEMENTIDS.RESUME_PRACTICE_BTN}`),
  bringBackBtnContainer : document.querySelector(`#${ELEMENTIDS.BRING_BACK_BTN_CONTAINER}`),

  labelRandom : document.querySelector(`#${ELEMENTIDS.LABEL_RANDOM}`),
  labelSequential : document.querySelector(`#${ELEMENTIDS.LABEL_SEQUENTIAL}`),
  labelFlashCard: document.querySelector(`#${ELEMENTIDS.LABEL_FLASH_CARD}`),
  labelMCQ: document.querySelector(`#${ELEMENTIDS.LABEL_MCQ}`),

  checkboxSyllableAll: document.querySelector(`#${ELEMENTIDS.CHECKBOX_SYLLABLE_ALL}`),

  aChoiceSelectorAll : document.querySelectorAll(ELEMENTIDS.ANSWER_CHOICE_SELECTOR_ALL),
  aChoiceOptionAll : document.querySelector(ELEMENTIDS.ANSWER_CHOICE_OPTION_ALL).options,
  aDefaultChoice : document.querySelector(ELEMENTIDS.ANSWER_DEFAULT_CHOICE).options[1],
  noOfAnsAll : document.querySelectorAll(ELEMENTIDS.NO_OF_ANSWER_ALL),


  get readNoOfAns() { //[sn19]
    //if it is not a getter, use this; outside of "get"
    return document.querySelector(ELEMENTIDS.NO_OF_ANSWER_CHECKED).value;
  },

  get readrandomYesNo() {
    return document.querySelector(ELEMENTIDS.RANDOM_YES_NO_CHECKED).value;
  },

  get readflashYesNo() {
    return document.querySelector(ELEMENTIDS.FLASH_YES_NO_CHECKED).value;
  },

  get readQuestionMode() {
    return document.querySelector(ELEMENTIDS.SOURCE_CHECKED).value;
  },

  get readqChoiceInput() {
    return this.qChoice.value;
  },

  get readaChoiceInput() {
    return this.aChoice.value;
  },

  get readMemoryInfoDOMs() {
    return [document.querySelector(`#${ELEMENTIDS.MEMORY_INFO_ZERO}`)];
  },

  get readMemoryBtns() {
    return [
      document.querySelector(`#${ELEMENTIDS.FLUSH_MEMORY_BTN_ZERO}`), 
      document.querySelector(`#${ELEMENTIDS.LIST_MEMORY_BTN_ZERO}`)
    ];
  },

  get individualSyllableChoiceCheckboxes() {
    return document.querySelectorAll(`input[name=${ELEMENT_NAMES.SYLLABLE_CHOICE}]`);
  },

  get syllableErrorContainer() {
    return document.querySelectorAll(`div[id^=${GENERATED_DOM.SYLLABLE_ERROR}]`);
  },
};