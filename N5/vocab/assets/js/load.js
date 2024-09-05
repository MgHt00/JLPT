const settingForm = document.querySelector("#settingsForm");

function loadData(e) {
  e.preventDefault(); // Prevent form from submitting the usual way

  randomYesNo = document.querySelector('input[name="randomYesNo"]:checked').value;
  flashYesNo = document.querySelector('input[name="flashYesNo"]:checked').value;
  syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');
  qChoiceInput = document.getElementById('qChoiceInput').value;
  aChoiceInput = document.getElementById('aChoiceInput').value;
  noOfAnswers = document.getElementById('noOfAnswers').value;

  console.log("randomYesNo: ", randomYesNo, " | syllableChoice: ", syllableChoice, " | qChoiceInput: ", qChoiceInput, 
    " | aChoiceInput: ", aChoiceInput, " | flashYesNo: ",flashYesNo, " | noOfAnswers: ",noOfAnswers);

  //IMPORTANT FIX IS NEEDED prepareJSON(syllableChoice);

  qChoiceInput === ("hi" || "ka") ? assignLanguage(sectionQuestion, jpLang) : assignLanguage(sectionQuestion, enLang);
  aChoiceInput === ("hi" || "ka") ? assignLanguage(sectionAnswer, jpLang) : assignLanguage(sectionAnswer, enLang);

}

const syllableMapping = {
  a: "assets/data/n5-vocab-a.json",
  i: "assets/data/n5-vocab-i.json",
};

function prepareJSON(syllables) {
  //console.log(syllables);

  // Create an array of Promises
  const promises = syllables.map(element => {
    //console.log(element);
    let selectedJSON = syllableMapping[element];
    //console.log(selectedJSON);
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


const fieldset = document.getElementById('fieldset-syllable');
const allCheckbox = document.getElementById('syllableAll');
const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
                             .filter(checkbox => checkbox !== allCheckbox);

fieldset.addEventListener('change', function(event) { // [le4]
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
});

function checkBoxToArray(nodeList) {
  let convertedArray;
  convertedArray = Array.from(document.querySelectorAll(nodeList))
                        .map(cb => cb.value); // [sn7]
  return convertedArray;
}

function changeState(node) {
  console.log(node);
  console.log(node.disabled.value);
}

//loadData();
settingForm.addEventListener('submit', loadData);