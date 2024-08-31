let qNo = 0;

const vocabMapping = {
  ka: kaVocab,
  hi: hiVocab,
  en: enVocab
};

// Fetch questions from JSON file
fetch('assets/data/n5-vocab.json')
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

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function prepareQuestion(arr, random) {
  let i = randomNo(0, (arr.length-1));
  let selectedQuestionObj = {}; // to store the question obj temporarily

  if (random) {
    selectedQuestionObj = arr[i];
  }
  else {
    selectedQuestionObj = arr[qNo];
    qNo++;
  }
  return selectedQuestionObj;
}

function prepareAnswers(aChoice, noOfChoice, correctAns) {
  let selectedArray = vocabMapping[aChoice];
  let tempAnsArray = [];

  tempAnsArray[0] = correctAns[aChoice]; // add correct answer in index. 0
  
  if (!selectedArray) {
    console.error(`No vocab array found for choice: ${aChoice}`);
    return;
  }

  if (selectedArray.length === 0) {
    console.error(`The vocab array is empty for choice: ${aChoice}`);
    return;
  }

  noOfChoice = Math.min(noOfChoice, selectedArray.length);

  for (let i = 1; i < noOfChoice; i++) {
    let randomIndex;
    let randomWord;

    // [le3] Loop to ensure no duplicates are added 
    do {
      randomIndex = randomNo(0, selectedArray.length - 1);
      randomWord = selectedArray[randomIndex];
    } while (tempAnsArray.includes(randomWord));

    tempAnsArray[i] = randomWord;
  }
  tempAnsArray = shuffleArray(tempAnsArray);
  return tempAnsArray;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}