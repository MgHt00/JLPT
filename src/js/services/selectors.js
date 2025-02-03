export const selectors = {
  body : document.body,
  sectionQuestion : document.querySelector("#section-question"),
  sectionMessage : document.querySelector("#section-message"),
  sectionAnswer : document.querySelector("#section-answer"),
  sectionStatus : document.querySelector("#section-status"),
  dynamicDOM : document.querySelector("#dynamic-DOM"),

  settingForm : document.querySelector("#settingsForm"),
  switchRandomYesNo : document.querySelector("#randomYesNo"),
  settingFlashYesNo : document.querySelector("#settings-flashYesNo"),
  switchFlashYesNo : document.querySelector("#flashYesNo"),
  settingNoOfAns : document.querySelector("#settings-noOfAnswers"),
  //settingNoOfAnsERRblk : document.querySelector("#settings-noOfAnswers-errBLK"),
  settingSource: document.querySelector("#settings-source"),
  qChoice : document.querySelector("#qChoiceInput"),
  aChoice : document.querySelector("#aChoiceInput"),
  fieldsetSyllable : document.querySelector("#fieldset-syllable"),
  settingSyllable : document.querySelector("#settings-syllableChoice"),
  settingRepractice: document.querySelector("#settings-repractice"),
  memoryInfo : document.querySelector("#memory-info"),
  memoryBtns : document.querySelector("#memory-btns"),
  aChoiceSelectorAll : document.querySelectorAll("[id^='aChoiceInput']"),
  aChoiceOptionAll : document.querySelector('select[id="aChoiceInput"]').options,
  aDefaultChoice : document.querySelector('select[name="aChoiceInput"]').options[1],
  noOfAnsAll : document.querySelectorAll("[id^='noOfAnswers']"),
  submitBtn : document.querySelector("#submit-btn"),
  allSetting : document.querySelectorAll("[id|='settings']"),
  bringBackBtn : document.querySelector("#bring-back-btn"),
  resumePracticeBtn : document.querySelector("#resume-practice-btn"),

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
    //console.info("qChoice.value: ", this.qChoice.value);
    return this.qChoice.value;
  },

  get readaChoiceInput() {
    //console.info("aChoice.value: ", this.aChoice.value);
    return this.aChoice.value;
  },

  get readMemoryInfoDOMs() {
    return [document.querySelector("#memory-info-0")];
  },

  get readMemoryBtns() {
    return [document.querySelector("#flush-memory-btn-0"), document.querySelector("#list-memory-btn-0")];
  }
};