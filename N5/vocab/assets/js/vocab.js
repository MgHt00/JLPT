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


function displayQuestion(arr, random, qChoice, aChoice) {
  let i = randomNo(0, (arr.length-1));
  let selectedQuestionObj = {}; // to store the question obj temporarily

  if (random) {
    selectedQuestionObj = arr[i];
    displayContent(sectionQuestion, arr[i][qChoice]);
  }
  else {
    selectedQuestionObj = arr[qNo];
    displayContent(sectionQuestion, arr[qNo][qChoice]);
    qNo++;
  }
  return selectedQuestionObj[aChoice];  
}

function displayAnswers(aChoice, choiceNum, correctAns) {
  let selectedArray = vocabMapping[aChoice];
  let tempAnsArray = [];
  let checkedAnsArray = [];

  tempAnsArray[0] = correctAns; // add correct answer in index. 0
  
  if (!selectedArray) {
    console.error(`No vocab array found for choice: ${aChoice}`);
    return;
  }

  if (selectedArray.length === 0) {
    console.error(`The vocab array is empty for choice: ${aChoice}`);
    return;
  }

  choiceNum = Math.min(choiceNum, selectedArray.length);

  for (let i = 1; i < (choiceNum); i++) { // loop is reduced 1 time than choicNum to include the correct answer
    let randomIndex = randomNo(0, (selectedArray.length-1));
    tempAnsArray[i] = [selectedArray[randomIndex]];
  }
  log(tempAnsArray, "tempAnsArray");
  checkedAnsArray = checkDuplicates(tempAnsArray);
  log(checkedAnsArray, "checkedAnsArray");
}

function checkDuplicates(ansArray) {
  let checkedAnsArr = [];
  checkedAnsArr[0] = ansArray[0].toString(); // The correct answer is intact.
  log(checkedAnsArr[0], "correct ans: ");

  for(let i = 1; i < ansArray.length; i++) {
    let checkingAns = ansArray[i].toString();
    console.log("Checking answer: ", checkingAns);

    // Check if sourceAns already exists in checkedAnsArr
    if (!checkedAnsArr.includes(checkingAns)) {
      checkedAnsArr.push(checkingAns); // Add unique answers to checkedAnsArr
    } else {
      console.log("Duplicate found: ", checkingAns);
      // Handle duplicates if needed (e.g., skip, replace, etc.)
    }
  }

  return checkedAnsArr;
}

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
  log(target);
}