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
  console.log(selectedQuestionObj);
  return selectedQuestionObj;
}

function prepareAnswers(aChoice, noOfChoice, correctAns) {
  let selectedArray = vocabMapping[aChoice];
  let tempAnsArray = [];
  let checkedAnsArray = [];

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

  console.log(tempAnsArray);
  return tempAnsArray;
}

/*
function checkDuplicates(ansArray) {
  let checkedAnsArr = [];
  checkedAnsArr[0] = ansArray[0].toString(); // The correct answer is intact.

  for(let i = 1; i < ansArray.length; i++) {
    let checkingAns = ansArray[i].toString();

    // Check if sourceAns already exists in checkedAnsArr
    if (!checkedAnsArr.includes(checkingAns)) {
      checkedAnsArr.push(checkingAns); // Add unique answers to checkedAnsArr
    } 
  }

  return checkedAnsArr;
}

*/

function checkTotalAns(ansArray, noOfAnswers) {
  log(ansArray);
  if (ansArray.length < noOfAnswers) {
    // Handle the case where the array is shorter than expected
    console.log("The ansArray has fewer items than expected. Handling...");
  } else {
    // Proceed with the next steps if the array length is correct
    console.log("The ansArray is correct in length.");
  }
}
