import { globals } from "../services/globals.js";

export const VOCAB_MAPPING = {
  ka: globals.appData.kaVocab,
  hi: globals.appData.hiVocab,
  en: globals.appData.enVocab,
};

export const QUESTION_MODE_FRESH = "fresh";
export const QUESTION_MODE_STORED = "stored";

export const LANGUAGE_OPTIONS = {
  Number: '#',
  ENGLISH: 'English',
  JAPANESE: 'Japanese',
  HIRAGANA: 'Hiragana',
  KANJI: 'Kanji',
};

export const LANGUAGE_MAPPINGS = {
  ENGLISH: 'en',
  JAPANESE: 'jp',
  HIRAGANA: 'hi',
  KANJI: 'ka',
};

export const RUNTIME_ERROR_CODES = {
  INFINITE_LOOP: "iLoop",
  NO_SYLLABLE_SELECTED: "noSL",
  MEMORY_EMPTY: "mem0",
};

export const SYLLABLE_CHOICE_CHECKBOX_VALUES = {
  ALL: 'all',
};

export const MEMORY_BTN_NAMES = {
  FLUSH: 'flush',
  LIST: 'list',
};

export const MEMORY_STATUS = {
  EMPTY: 'Memory is empty.',
  ONE: 'word to repractice.',
  MANY: 'words to repractice.',
};

export const MCQ_DEFAULTS = {
  MIN_ANSWER_COUNT: 2, // DEFAULT IS 2, SHOULD NOT CHANGE THIS.
  MAX_ANSWER_COUNT: 4,
};

export const DATA_POOL_DEFAULTS = {
  MIN_POOL_SIZE: 3, // SHOULD NOT BE LOWER THAN 3
};

export const FLASH_CARD_MODE = {
  QUESTION: 'Did you get it right?',
  YES: 'Yes',
  NO: 'No',
};

export const MCQ_MODE = {
  CORRECT_ANSWER: 'Correct',
  WRONG_ANSWER: 'Keep Trying',
}

export const PLAIN_TEXT_STRINGS = {
  LOADING: 'Loading...',
  LOADING_FAIL: 'Loading fail!',
  FLIP_CARD: 'Flip',
  WELL_DONE: 'You have completed all the vocabs.  Well done!',
  RESTART_PROMPT: 'Let\'s Restart!',
};

export const LOCAL_STORAGE_KEYS = {
  TO_PRACTICE: 'toPractice',
  APP_STATE: 'appState',
  APP_DATA: 'appData',
  CURRENT_STATUS: 'currentStatus',
};