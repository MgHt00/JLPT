const settingForm = document.querySelector("#settingsForm");
const settingFlashYesNo = document.querySelector("#settings-flashYesNo");
const fieldsetSyllable = document.querySelector("#fieldset-syllable");
const qChoiceSelector = document.querySelector("#qChoiceInput");
const aChoiceSelector = document.querySelector("#aChoiceInput");
const aChoiceSelectorAll = document.querySelectorAll("[id^='aChoiceInput']");
const aChoiceOptionAll = document.querySelector('select[id="aChoiceInput"]').options;
const aDefaultChoice = document.querySelector('select[name="aChoiceInput"]').options[1];
const noOfAnsSelector = document.querySelectorAll("[id^='noOfAnswers']");
const submitBtn = document.querySelector("#submit-btn");

function loadData(e) {
  e.preventDefault(); // Prevent form from submitting the usual way

  randomYesNo = document.querySelector('input[name="randomYesNo"]:checked').value;
  flashYesNo = document.querySelector('input[name="flashYesNo"]:checked').value;
  noOfAnswers = document.querySelector('input[name="noOfAnswers"]:checked').value;
  
  syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');

  if (syllableChoice.length === 0) {
    buildNode({
      parent: fieldsetSyllable, 
      child: 'div', 
      content: 'Select at least one syllables', 
      className: 'setting-error', 
      idName: 'syllable-error',
    });
    return;
  }
  
  qChoiceInput = document.querySelector('#qChoiceInput').value;
  aChoiceInput = document.querySelector('#aChoiceInput').value;

  console.log("randomYesNo: ", randomYesNo, "| flashYesNo: ",flashYesNo, " | noOfAnswers: ",noOfAnswers, " | syllableChoice: ", syllableChoice, " | qChoiceInput: ", qChoiceInput, 
    " | aChoiceInput: ", aChoiceInput);

  prepareJSON(syllableChoice);

  qChoiceInput === ("hi" || "ka") ? assignLanguage(sectionQuestion, jpLang) : assignLanguage(sectionQuestion, enLang);
  aChoiceInput === ("hi" || "ka") ? assignLanguage(sectionAnswer, jpLang) : assignLanguage(sectionAnswer, enLang);
}

function prepareJSON(syllableChoice) {
  const syllableMapping = {
    a: "assets/data/n5-vocab-a.json",
    i: "assets/data/n5-vocab-i.json",
  };

  // if user selects "all", load all property names from `syllableMapping`
  if (syllableChoice.includes("all")) {
    // Dynamically get all syllable keys from syllableMapping
    syllableChoice = Object.keys(syllableMapping); // [sn9] This replaces syllableChoice with all syllables
  }
  
  // Create an array of Promises
  const promises = syllableChoice.map(element => {
    //console.log(element);
    let selectedJSON = syllableMapping[element];
    console.log(selectedJSON);
    return fetch(selectedJSON).then(response => response.json());
  });

  // Wait for all Promises to resolve and then merge the results into vocabArray
  Promise.all(promises)
    .then(results => {
      vocabArray = results.flat(); // Combine all arrays into one
      //console.log(vocabArray); // Now this should show the full combined array
      fetchOneCategory(vocabArray, kaVocab, ka); // le2
      fetchOneCategory(vocabArray, hiVocab, hi);
      fetchOneCategory(vocabArray, enVocab, en);

      // Call start() after the data is loaded (sn1.MD)
      start();
    })
    .catch(error => console.error('Error loading vocab JSON files:', error));
}


function checkBoxToArray(nodeList) {
  let convertedArray;
  convertedArray = Array.from(document.querySelectorAll(nodeList))
                        .map(eachCheckBox => eachCheckBox.value); // [sn7]
  return convertedArray;
}

function syllableChanges(event) { // [le4]
  const allCheckbox = document.getElementById('syllableAll');
  const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
                               .filter(checkbox => checkbox !== allCheckbox);

    if (checkNode({ idName: 'syllable-error' })) {
      clearNode({
        parent: fieldsetSyllable, 
        children: Array.from(document.querySelectorAll('div[id^="syllable-error"]'))
      });
    }

  if (event.target === allCheckbox) {
    if (allCheckbox.checked) {
        otherCheckboxes.forEach(checkbox => {
            checkbox.disabled = true;
            checkbox.checked = false; // Uncheck the others if "All" is checked
        });
    } else {
        otherCheckboxes.forEach(checkbox => checkbox.disabled = false);
    }
} else {
    if (event.target.checked) { //[sn8]
        allCheckbox.disabled = true;
        allCheckbox.checked = false; // Uncheck "All" if any other is checked
    } else {
        const anyChecked = otherCheckboxes.some(checkbox => checkbox.checked);
        if (!anyChecked) {
            allCheckbox.disabled = false;
            allCheckbox.checked = true; // check "All" if nothing is checked
        }
    }
}
}

function dynamicAnswer() {
  // Get the user's question choice
  const qChoice = document.querySelector('#qChoiceInput').value;
  console.log(qChoice);

  const ansMapping = { // [sn11]
    ka: { parent: aChoiceSelector, child: 'option', content: 'Kanji', childValues: 'ka', idName: 'a-ka'},
    hi: { parent: aChoiceSelector, child: 'option', content: 'Hiragana', childValues: 'hi', idName: 'a-hi'},
    en: { parent: aChoiceSelector, child: 'option', content: 'English', childValues:'en', idName: 'a-en'},
  };

  clearNode({ parent: aChoiceSelector, children: Array.from(aChoiceOptionAll) }); // Array.from(aChoiceSelectorAll): Converts the NodeList (which is similar to an array but doesn't have all array methods) into a true array

  // Loop through the ansMapping object and call buildNode
  Object.entries(ansMapping).forEach(([key, params]) => { // [sn13]
    // Exclude the option if it matches the user's question choice
    if (key !== qChoice) {
      buildNode(params);
    }
  });
}

function flashmodeChanges(e) {
  console.log(e.target.value);
  flipNodeState(...noOfAnsSelector); 
}

/*
function constructQuestion() {
  clearNode({ parent: qChoiceSelector, child: document.querySelector("#qChoiceDummy") });
  buildNode({ parent: qChoiceSelector, child: "option", content: ['Kanji', 'Hiragana', 'English'], childValues: ['ka', 'hi', 'en'] });
  qChoiceSelector.removeEventListener('click', constructQuestion);

  flipNodeState(...aChoiceSelectorAll);
}
*/

function defaultState() {
  //flipNodeState(submitBtn);
  //flipNodeState(...aChoiceSelectorAll); // [sn14] aChoiceSelector is a NodeList. Need to spread before passing to a function
  flipNodeState(...noOfAnsSelector); 
}

// Event Listeners
settingForm.addEventListener('submit', loadData);
fieldsetSyllable.addEventListener('change', syllableChanges);
//qChoiceSelector.addEventListener('click', constructQuestion);
qChoiceSelector.addEventListener('change', dynamicAnswer);
settingFlashYesNo.addEventListener('change', flashmodeChanges);

defaultState();