let vocabArray = []; 

function addVocab(target, word) {
  target.push(word);
  console.log("target: ", target);
}

/*
addVocab(aToO, {jp: "ああ", en: "Ah!, Oh!, Alas!"});
addVocab(aToO, {jp: "あい", en: "together, mutually, fellow"});
*/

// Fetch questions from JSON file
fetch('assets/data/n5-vocab.json')
  .then(response => response.json())
  .then(data => {
    vocabArray = data;
    console.log("vocabArray: ", vocabArray);
  })
  .catch(error => console.error('Error loading vocab JSON file:', error));
