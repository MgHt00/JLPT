const body = document.querySelector("#section-body");
const sectionQuestion = document.querySelector("#section-question");
const sectionMessage = document.querySelector("#section-message");
const sectionAnswer = document.querySelector("#section-answer");
const sectionStatus = document.querySelector("#section-status");
const dynamicDOM = document.querySelector("#dynamic-DOM");

let ka = "ka";
let hi = "hi";
let en = "en";

let enLang = "en";
let jpLang = "jp";

let kaVocab = [];
let hiVocab = [];
let enVocab = [];


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
  syllableChoice: [],
  vocabArray : [],
  rePractice: [],
};

const selectors = {
  settingForm : document.querySelector("#settingsForm"),
  switchRandomYesNo : document.querySelector("#randomYesNo"),
  settingFlashYesNo : document.querySelector("#settings-flashYesNo"),
  switchFlashYesNo : document.querySelector("#flashYesNo"),
  settingNoOfAns : document.querySelector("#settings-noOfAnswers"),
  settingSource: document.querySelector("#settings-source"),
  qChoice : document.querySelector("#qChoiceInput"),
  aChoice : document.querySelector("#aChoiceInput"),
  fieldsetSyllable : document.querySelector("#fieldset-syllable"),
  settingSyllable : document.querySelector("#settings-syllableChoice"),
  settingRepractice: document.querySelector("#settings-repractice"),
  memoryInfo : document.querySelector("#memory-info"),
  aChoiceSelectorAll : document.querySelectorAll("[id^='aChoiceInput']"),
  aChoiceOptionAll : document.querySelector('select[id="aChoiceInput"]').options,
  aDefaultChoice : document.querySelector('select[name="aChoiceInput"]').options[1],
  noOfAnsAll : document.querySelectorAll("[id^='noOfAnswers']"),
  submitBtn : document.querySelector("#submit-btn"),
  allSetting : document.querySelectorAll("[id|='settings']"),
  bringBackBtn : document.querySelector("#bring-back-btn"),

  get readNoOfAns() { //[sn19]
    //if it is not a getter, use this; outside of "get"
    //noOfAns: () => document.querySelector("input[name='noOfAnswers']:checked").value,
    //console.info(document.querySelector("input[name='noOfAnswers']:checked").value);
    return document.querySelector("input[name='noOfAnswers']:checked").value;
  },

  get readrandomYesNo() {
    return document.querySelector('input[name="randomYesNo"]:checked').value;
  },

  get readflashYesNo() {
    return document.querySelector('input[name="flashYesNo"]:checked').value;
  },

  get readQuestionMode() {
    return document.querySelector('input[name="source"]:checked').value;
  },

  get readqChoiceInput() {
    return this.qChoice.value;
  },

  get readaChoiceInput() {
    return this.aChoice.value;
  },

  get readMemoryInfoDOMs() {
    return [document.querySelector("#memory-info-0"), document.querySelector("#flush-memory-btn-0")];
  },
};

//let qNo = 0;