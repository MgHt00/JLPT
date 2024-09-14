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
//let correctAns;

const appState = {
  randomYesNo : false,
  //syllableChoice,
  qChoiceInput: "hi",
  aChoiceInput: "en",
  flashYesNo: true,
  noOfAnswers: 4,
  correctAns: "",
};

const appData = {
  syllableChoice: [],
  vocabArray : [],
  rePractice: [],
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
  noOfAnsAll : document.querySelectorAll("[id^='noOfAnswers']"),
  submitBtn : document.querySelector("#submit-btn"),
  allSetting : document.querySelectorAll("[id|='settings']"),
  bringBackBtn : document.querySelector("#bring-back-btn"),

  //noOfAns: () => document.querySelector("input[name='noOfAnswers']:checked").value,
  get readNoOfAns() { //[sn19]
    return document.querySelector("input[name='noOfAnswers']:checked").value;
  },

  get readRandomYesNo() {
    return document.querySelector('input[name="randomYesNo"]:checked').value;
  },

  get readFlashYesNo() {
    return document.querySelector('input[name="flashYesNo"]:checked').value;
  },
};

//let qNo = 0;