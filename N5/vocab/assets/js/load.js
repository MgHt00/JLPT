function loadData() {
  randomYesNo = true;
  syllableChoice = ["a", "i"]
  qChoiceInput = "hi";
  aChoiceInput = "en";
  flashYesNo = false;
  noOfAnswers = 4;

  prepareJSON(syllableChoice);
  
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


const fieldset = document.getElementById('syllable-fieldset');
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
        if (event.target.checked) {
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


document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form from submitting the usual way

  randomYesNo = document.querySelector('input[name="randomYesNo"]:checked').value;
  //console.log(randomYesNo);
  
  changeState('input[name="syllableChoice"]:checked');

  //syllableInputCheck('input[name="syllableChoice"]:checked');
  syllableChoice = checkBoxToArray('input[name="syllableChoice"]:checked');
  //console.log(syllableChoice);
  /*
  qChoiceInput = document.getElementById('qChoiceInput').value;
  aChoiceInput = document.getElementById('aChoiceInput').value;
  flashYesNo = document.getElementById('flashYesNo').value === "true";
  noOfAnswers = parseInt(document.getElementById('noOfAnswers').value);

  console.log(randomYesNo, syllableChoice, qChoiceInput, aChoiceInput, flashYesNo, noOfAnswers);

  */
});

/*
function syllableInputCheck(nodeList) {
  syllableChoice = Array.from(document.querySelectorAll(nodeList))
                        .map(cb => cb.value); // [sn7]
  log(syllableChoice);
}
*/

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

loadData();