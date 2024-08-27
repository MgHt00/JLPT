const sectionQuestion = document.querySelector("#section-question");
const sectionAnswer = document.querySelector("#section-answer");

let enLang = "en";
let jpLang = "jp";

function assignLanguage (sectionBlock, lang) {
  sectionBlock.setAttribute("lang", lang);
  sectionAnswer.classList.add();
  sectionBlock.classList.add(lang);
}

function displayContent(sectionBlock, content) {
  let divBlock = document.createElement("div");
  divBlock.textContent = content;
  sectionBlock.appendChild(divBlock);
}

displayContent(sectionQuestion, "dynamic question");
displayContent(sectionAnswer, "dynamic answer");
assignLanguage(sectionQuestion, enLang);
assignLanguage(sectionAnswer, jpLang);