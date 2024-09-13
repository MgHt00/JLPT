const body = document.querySelector("#section-body");
const sectionQuestion = document.querySelector("#section-question");
const sectionMessage = document.querySelector("#section-message");
const sectionAnswer = document.querySelector("#section-answer");
//let vocabArray = [];

let ka = "ka";
let hi = "hi";
let en = "en";

let enLang = "en";
let jpLang = "jp";


let kaVocab = [];
let hiVocab = [];
let enVocab = [];

//let questionObj = {};
//let ansArray = [];
let correctAns;

const appState = {
  randomYesNo : false,
  //syllableChoice,
  qChoiceInput: "hi",
  aChoiceInput: "en",
  flashYesNo: true,
  noOfAnswers: 4,
};

const appData = {
  syllableChoice: [],
  vocabArray : [],
};

const selectors = {
  settingForm : document.querySelector("#settingsForm"),
  settingFlashYesNo : document.querySelector("#settings-flashYesNo"),
  qChoice : document.querySelector("#qChoiceInput"),
  aChoice : document.querySelector("#aChoiceInput"),
  fieldsetSyllable : document.querySelector("#fieldset-syllable"),
  aChoiceSelectorAll : document.querySelectorAll("[id^='aChoiceInput']"),
  aChoiceOptionAll : document.querySelector('select[id="aChoiceInput"]').options,
  aDefaultChoice : document.querySelector('select[name="aChoiceInput"]').options[1],
  noOfAnsSelector : document.querySelectorAll("[id^='noOfAnswers']"),
  submitBtn : document.querySelector("#submit-btn"),
  allSetting : document.querySelectorAll("[id|='settings']"),
  bringBackBtn : document.querySelector("#bring-back-btn"),
};

//let qNo = 0;