const settingForm = document.querySelector("#settingsForm");
const fieldsetSyllable = document.querySelector("#fieldset-syllable");
const qChoiceSelector = document.querySelector("#qChoiceInput");
const aChoiceSelector = document.querySelectorAll("[id^='aChoiceInput']");
const noOfAnsSelector = document.querySelectorAll("[id^='noOfAnswers']");
const submitBtn = document.querySelector("#submit-btn");

function loadData(e) {
  e.preventDefault(); // Prevent form from submitting the usual way

  randomYesNo = document.querySelector('input[name="randomYesNo"]:checked').value;
  flashYesNo = document.querySelector('input[name="flashYesNo"]:checked').value;
  syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');
  qChoiceInput = document.querySelector('#qChoiceInput').value;
  aChoiceInput = document.querySelector('#aChoiceInput').value;
  noOfAnswers = document.querySelector('#noOfAnswers').value;

  console.log("randomYesNo: ", randomYesNo, " | syllableChoice: ", syllableChoice, " | qChoiceInput: ", qChoiceInput, 
    " | aChoiceInput: ", aChoiceInput, " | flashYesNo: ",flashYesNo, " | noOfAnswers: ",noOfAnswers);

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
                        .map(cb => cb.value); // [sn7]
  return convertedArray;
}

function fieldsetChanges(event) { // [le4]
  const allCheckbox = document.getElementById('syllableAll');
  const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
                               .filter(checkbox => checkbox !== allCheckbox);

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
        }
    }
}
}

function qChanges(e) {
  const ansMapping = {
    ka: document.querySelector('#a-ka'),
    hi: document.querySelector('#a-hi'),
    en: document.querySelector('#a-en'),
  };

  const qChoice = document.querySelector("#qChoiceInput").value;
  flipNodeState(aChoiceSelector);
}

function dynamicAnswer() {
  //flipNodeState(aChoiceSelector);

  // Get the user's question choice
  const qChoice = document.querySelector('#qChoiceInput').value;
  console.log(qChoice);

  const ansMapping = { // [sn11]
    ka: { parent: aChoiceSelector, child: 'option', content: 'Kanji', idName: 'a-ka'},
    hi: { parent: aChoiceSelector, child: 'option', content: 'Hiragana', idName: 'a-hi'},
    en: { parent: aChoiceSelector, child: 'option', content: 'English', idName: 'a-en'},
  };

  // Loop through the ansMapping object and call buildNodeObj
  Object.entries(ansMapping).forEach(([key, params]) => { // [sn13]
    // Log params to see if the className is being passed correctly
    console.log("params before buildNodeObj: ", params);

    // Exclude the option if it matches the user's question choice
    if (key !== qChoice) {
      buildNodeObj(params);
    }
  });
}


function defaultState() {
  flipNodeState(submitBtn);
  flipNodeState(...aChoiceSelector); // [sn14] aChoiceSelector is a NodeList. Need to spread before passing to a function
  flipNodeState(...noOfAnsSelector); 
}

// Event Listeners
settingForm.addEventListener('submit', loadData);
fieldsetSyllable.addEventListener('change', fieldsetChanges);
qChoiceSelector.addEventListener('change', dynamicAnswer);

defaultState();
//dynamicAnswer();