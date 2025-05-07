export const ELEMENTIDS = {
  SECTION_QUESTION: "section-question",
  SECTION_MESSAGE: "section-message",
  SECTION_ANSWER: "section-answer",
  SECTION_STATUS: "section-status",

  DYNAMIC_DOM: "dynamic-DOM",

  SETTING_FORM: "settingsForm",
  SETTING_FLASH_YES_NO: "settings-flashYesNo",
  SETTING_NO_OF_ANS: "settings-noOfAnswers",
  SETTING_SOURCE: "settings-source",
  SETTING_SYLLABLE: "settings-syllableChoice",
  SETTING_REPRACTICE: "settings-repractice",

  SWITCH_RANDOM_YES_NO: "randomYesNo",
  SWITCH_FLASH_YES_NO: "flashYesNo",
  QUESTION_CHOICE: "qChoiceInput",
  ANSWER_CHOICE: "aChoiceInput",
  FIELDSET_SYLLABLE: "fieldset-syllable",
  MEMORY_INFO: "memory-info",
  MEMORY_BTNS: "memory-btns",
  ANSWER_CHOICE_SELECTOR_ALL: "[id^='aChoiceInput']",
  ANSWER_CHOICE_OPTION_ALL: 'select[id="aChoiceInput"]',
  ANSWER_DEFAULT_CHOICE: 'select[name="aChoiceInput"]',
  NO_OF_ANSWER_ALL: "[id^='noOfAnswers']",
  SUBMIT_BTN: "submit-btn",
  ALL_SETTING: "[id|='settings']",
  BRING_BACK_BTN: "bring-back-btn",
  RESUME_PRACTICE_BTN: "resume-practice-btn",
  BRING_BACK_BTN_CONTAINER: "bring-back-btn-container",

  NO_OF_ANSWER_CHECKED: 'input[name="noOfAnswers"]:checked',
  RANDOM_YES_NO_CHECKED: 'input[name="randomYesNo"]:checked',
  FLASH_YES_NO_CHECKED: 'input[name="flashYesNo"]:checked',
  SOURCE_CHECKED: 'input[name="source"]:checked',
  SOURCE_FRESH: 'source-fresh',

  MEMORY_INFO_ZERO: "memory-info-0",
  FLUSH_MEMORY_BTN_ZERO: "flush-memory-btn-0",
  LIST_MEMORY_BTN_ZERO: "list-memory-btn-0",

  LABEL_RANDOM: "random-label",
  LABEL_SEQUENTIAL : "sequential-label",
  LABEL_FLASH_CARD : "flashcard-label",
  LABEL_MCQ : "multiple-choice-label",

  CHECKBOX_SYLLABLE_ALL: 'syllableALL',
};

export const ELEMENT_NAMES = {
  SYLLABLE_CHOICE: 'syllableChoice',
};

export const BUILD_ANSWER_OPTIONS = {
  KANJI: 'a-ka',
  HIRAGANA: 'a-hi',
  ENGLISH: 'a-en',
};

export const GENERATED_DOM = {
  SYLLABLE_ERROR: 'syllable-error',
  INFINITE_LOOP: 'infiniteloop',

  MEMORY_BTN_FLUSH: {
    ICON: '<i class="fa-solid fa-trash-can"></i>',
    CSS_CLASS: 'flush-memory-setting-btn',
    ELEMENT_ID: 'flush-memory-btn',
  },

  MEMORY_BTN_LIST: {
    ICON: '<i class="fa-solid fa-rectangle-list"></i>',
    CSS_CLASS: 'list-memory-setting-btn',
    ELEMENT_ID: 'list-memory-btn',
  },

  MISTAKE_LIST: {
    CONTAINER_CLASS: 'mistake-list-container',
    CONTAINER_ID: 'mistake-list-div',

    HEADER_CLASS: 'mistakes-row-header',
    HEADER_ID: 'mistakes-heading',

    HEADER_COLUMN_CLASS: 'mistakes-column-header',
    HEADER_COLUMN_ID: 'mistake-column-header',

    ROW_CLASS: 'mistakes-row',
    ROW_ID: 'mistakeList-row',

    COLUMN_CLASS: 'mistakes-column',
  },

  LOADING: {
    FONT: 'poppins-regular',
    ELEMENT_ID: 'preload-info',
  },
};

export const RENDER_ANSWERS = {
  ANSWER_BUTTON: 'answer-btn',
  ANSWER_BUTTON_LABEL: 'answer-btn-text',
  ANSWER_MESSAGE: 'answer-message',
  CHOICE_BUTTON: 'choice-btn',
  CORRECT_ANSWER: 'correct-answer',
  YES_TO_CONTINUE: 'continueYes',
  NO_TO_CONTINUE: 'continueNo',
};