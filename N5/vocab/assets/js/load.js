function loadData() {
  randomYesNo = true;
  syllableChoice = ["a", "i"]
  qChoiceInput = "hi";
  aChoiceInput = "en";
  flashYesNo = false;
  noOfAnswers = 4;

  prepareJSON(syllableChoice);
  
  qChoiceInput === "hi" ? assignLanguage(sectionQuestion, jpLang) : assignLanguage(sectionQuestion, enLang);
  aChoiceInput === "hi" ? assignLanguage(sectionAnswer, jpLang) : assignLanguage(sectionAnswer, enLang);
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


/*
// Fetch questions from JSON file
fetch("assets/data/n5-vocab-a.json")
  .then(response => response.json())
  .then(data => {
    vocabArray = data;
    fetchOneCategory(vocabArray, kaVocab, ka); // le2
    fetchOneCategory(vocabArray, hiVocab, hi);
    fetchOneCategory(vocabArray, enVocab, en);

    // Call start() after the data is loaded (sn1.MD)
    start();
  })
  .catch(error => console.error('Error loading vocab JSON file:', error));
*/


loadData();