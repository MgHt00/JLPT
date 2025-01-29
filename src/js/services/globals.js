import { selectors } from "./selectors.js";

const defaultConfig = {
  ka : "ka",
  hi : "hi",
  en : "en",

  enLang : "en",
  jpLang : "jp",
}

const appState = {
  randomYesNo : true,
  qChoiceInput: "hi",
  aChoiceInput: "en",
  flashYesNo: true,
  qMode: "fresh",
  noOfAnswers: 2,
  correctAns: "",
};

const appData = {
  preloadVocabData : {},

  kaVocab : [],
  hiVocab : [],
  enVocab : [],

  syllableChoice: [],
  vocabArray : [],
  rePractice: [],
};

const currentStatus = {
  //stillInProgress : false,
  questionCount : 0,
  totalNoOfQuestions : 0,
  cumulativeAverage : 0,
  totalCorrectAnswers : 0,
  totalQuestionsAnswered : 0,
  averageScore : 0,
}

export const globals = {
  defaultConfig,
  appState,
  appData,
  currentStatus,
  selectors,
}