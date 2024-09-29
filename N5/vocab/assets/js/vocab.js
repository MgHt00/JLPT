const questionMgr = questionManager();
const vocabMgr =  vocabManager();
const answerMgr = answerManager();

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function questionManager() {
  let questionObj = {};

  function newQuestion() {
    console.groupCollapsed("---questionManager() - newQuestion()---");

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

    if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
      //console.log("vocabArray ", appData.vocabArray);
      questionObj = fetchOneQuestion();
      
      appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer
      console.log("ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
      
      buildNode({ 
        parent: sectionQuestion, 
        child: 'div', 
        content: questionObj[appState.qChoiceInput],
      });
      answerMgr.renderAnswers();  
    } else { // if there is no more question left to show
      answerMgr.noMoreQuestion();
    }

    console.groupEnd();
  }

  function setMode(m) {
    //console.groupCollapsed("questionManager() - setMode()");

    const validModes = ["fresh", "stored"];
    if(!validModes.includes(m)) {
      newQuestion.mode = "fresh"; // default to `fresh`
      console.warn("Invalid mode is passed. Defaulting to `fresh`.");
    } else {
      newQuestion.mode = m;
      //console.info("Question mode: ", newQuestion.mode);
    }

    console.groupEnd();
  }

  function fetchOneQuestion() {
    //console.groupCollapsed("questionManager() - fetchOneQuestion()");

    let selectedQuestionObj = {}; // to store the question obj temporarily
    if (typeof fetchOneQuestion.index === 'undefined') {
      fetchOneQuestion.index = 0;
    }

    if (appState.randomYesNo) {
      fetchOneQuestion.index = randomNo(0, (appData.vocabArray.length - 1));
    } else {
      fetchOneQuestion.index = 0;
    }
    selectedQuestionObj = appData.vocabArray[fetchOneQuestion.index];
    return selectedQuestionObj;
  }

  function completeAndContinue() {
    //console.groupCollapsed("questionManager() - completeAndContinue()");

    vocabMgr.removeQuestion(fetchOneQuestion.index);
    newQuestion();
    
    console.groupEnd();
  }

  return {
    newQuestion,
    completeAndContinue,
    setMode,
    get readQuestionObj() {return questionObj;},
    get readQuestionMode() {return newQuestion.mode},
  }
}


function answerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  function renderAnswers() {
    //console.groupCollapsed("answerManager() - renderAnswers()");

    ansArray = prepareAnswers();
    //console.log("Inside renderAnswers(); ansArray: ", ansArray, "Inside renderAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      assignLanguage(sectionAnswer, "en"); // if aChoice was set to Kanji or Hirigana, reset to "en"
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Check Answer', 
        className: 'answer-btn', 
        idName: 'answer-btn', 
        eventFunction: showAnswer 
      });
    } else { // if it is a multiple choice game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ansArray, 
        className: 'answer-btn', 
        eventFunction: multipleChoice 
      });
    }

    console.groupEnd();
  }

  function noMoreQuestion() {
    //console.groupCollapsed("noMoreQuestion()");
    
    if (questionMgr.readQuestionMode === "fresh") { // if currently showing data from JSON
      questionMgr.readQuestionMode = "stored";
      //console.log("Processed questionMgr.readQuestionMode: ", questionMgr.readQuestionMode);
      toLocalStorageYesNo();

    } else if (questionMgr.readQuestionMode === "stored") { // if currently showing data from localstorage
        if (noMoreQuestion.ranOnce) { // checked whether localstorage has been ran once.
          //console.info("mistake bank as been ran once. ", noMoreQuestion.ranOnce);
          completeAndRestart();
        }
        else if (vocabMgr.readStoredLength <= 2) { 
          // even though local storage is zero when the program starts, check whether new words have been added during the run
          // less than 2 vocab in local storage will lead to infinite loop; so the if statement is adjusted to <=2
          //console.info("too few vocabs in local storage");
          completeAndRestart();
        } 
        else {
          noMoreQuestion.ranOnce = true;
          toLocalStorageYesNo();
        }
    }

    console.groupEnd();
    return this;
  }

  function toLocalStorageYesNo() {
    buildNode({ 
        parent: sectionMessage, 
        child: 'div', 
        content: `There are ${vocabMgr.readStoredLength} words in mistake bank.  Would you like to practice those?`, 
        className: 'vocabs-complete', 
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Yes', 
        className: 'answer-btn', 
        idName: 'continue-yes', 
        eventFunction: answerMgr.ContinueYesNo,
      });

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'No', 
        className: 'answer-btn', 
        idName: 'continue-no', 
        eventFunction: answerMgr.ContinueYesNo,
      });
  }

  function completeAndRestart() {
    buildNode({ 
      parent: sectionMessage, 
      child: 'div', 
      content: 'You have completed all the vocabs.  Well done!', 
      className: 'vocabs-complete', 
    });

    buildNode({ 
      parent: sectionAnswer, 
      child: 'div', 
      content: 'Lets Restart!', 
      className: 'answer-btn', 
      idName: 'answer-btn', 
      eventFunction: listeners().restart,
    });
  }

  function prepareAnswers() {
    //console.groupCollapsed("answerManager() - prepareAnswers()");

    let selectedArray = vocabMapping[selectors.aChoice.value];
    //console.info("selectedArray: ", selectedArray, "| selectedArray.legth: ", selectedArray.length);
    let tempAnsArray = [];

    tempAnsArray[0] = appState.correctAns; // add correct answer in index. 0

    if (!selectedArray) {
      console.error(`No vocab array found for choice: ${selectors.aChoice.value}`);
      return;
    }

    if (selectedArray.length === 0) {
      console.error(`The vocab array is empty for choice: ${selectors.aChoice.value}`);
      return;
    }
    //let choiceInput = selectors.readNoOfAns;
    let choiceInput = appState.noOfAnswers;
    //console.info("choiceInput = appState.noOfAnswers: ", choiceInput);
    let noOfChoice = Math.min(choiceInput, selectedArray.length); // [le5]
    //console.info("noOfChoice: ", noOfChoice);

    /* Infinite loop check is moved inside loader() with errorInstance.showError() */

    for (let i = 1; i < noOfChoice; i++) {
      let randomIndex;
      let randomWord;

      do { // [le3] Loop to ensure no duplicates are added 
        randomIndex = randomNo(0, selectedArray.length - 1);
        randomWord = selectedArray[randomIndex];
      } while (tempAnsArray.includes(randomWord));

      tempAnsArray[i] = randomWord;
    }

    tempAnsArray = shuffleArray(tempAnsArray);
    console.groupEnd();
    return tempAnsArray;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  function showAnswer() {
    //console.groupCollapsed("answerManager() - showAnswer()");

    // Remove exiting buttons
    const answerButtons = document.querySelectorAll('[id^="answer-btn"]'); // sn3
    answerButtons.forEach(button => {
      button.remove();
    });

    // Show correct answer
    buildNode({ 
      parent: sectionAnswer, 
      child: 'div', 
      content: appState.correctAns, 
      className: 'answer-message', 
      idName: 'answer-message' 
    });

    // Show buttons
    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ 
        parent: sectionMessage, 
        child: 'div', 
        content: 'Did you get it right?', 
        className: 'answer-message', 
        idName: 'answer-message' 
      });
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: ['Yes', 'No'], 
        className: 'answer-btn', 
        idName: 'choice-btn', 
        eventFunction: flashcardYesNo 
      });
    } else {
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'answer-message', 
        idName: 'next-btn' });
    }

    console.groupEnd();
  }

  function multipleChoice(event) {
    //console.groupCollapsed("answerManager() - multipleChoice()");

    const btnText = event.currentTarget.textContent;
    if (appState.correctAns === btnText) {
      clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);

      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Correct!', 
        className: 'answer-message', 
        idName: 'answer-message' 
      });
      buildNode({ parent: sectionAnswer, 
        child: 'div', 
        content: 'Next', 
        className: 'answer-btn', 
        idName: 'choice-btn', 
        eventFunction: questionMgr.completeAndContinue 
      });

    } else {
      if (sectionMessage.textContent !== 'Keep Trying') { // if worng message is not shown already.
        vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
        buildNode({ 
          parent: sectionMessage, 
          child: 'div', 
          content: 'Keep Trying', 
          className: 'wrong-answer' 
        });
      }
    }
    console.groupEnd();
  }

  function flashcardYesNo(event) { // sn4
    //console.groupCollapsed("answerManager() - flashcardYesNo()");

    const btnID = event.currentTarget.id;

    if (btnID === "choice-btn-0") {
      questionMgr.completeAndContinue();
    } else if (btnID === "choice-btn-1") {
      
      vocabMgr.storeToPractice(questionMgr); // add wrongly selected word to localstorage
      questionManager.completeAndContinue();
    }

    console.groupEnd();
  }

  function ContinueYesNo(event) {
    console.groupCollapsed("answerManager() - ContinueYesNo()");

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      noMoreQuestion.ranOnce = true; // set true to `ranOnce` so that when storedData complete, continue to stored data will not show again.
      console.info("noMoreQuestion.ranOnce CHANGED :", noMoreQuestion.ranOnce);
      listenerInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {
      listenerInstance.restart();
    }

    console.groupEnd();
  }

  //let rePractice = [];

  function practiceAgain() {
    //const questionInstance = questionMgr;
    console.log("Inside showQuestionAgain(); questionObj: ", questionMgr.readQuestionObj);
    rePractice.push(questionMgr.readQuestionObj);
  }

  return {
    vocabMapping,
    renderAnswers,
    noMoreQuestion,
    ContinueYesNo,
  }
}

function vocabManager() {
  
  function removeQuestion(i) {
    //console.groupCollapsed("vocabManager() - removeQuestion()");

    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
      //console.log(`currentQIndex ${i} is removed. vocabArray.length: ${appData.vocabArray.length}`);
      //console.log("Inside removeQuestion(): After deletion; ", appData.vocabArray);
    } else {
      //console.log(`vocabArray.length: ${appData.vocabArray.length}; reach the end.`);
      // !!!​CHECK!!  Is it really ok without anything in this else block?????????
    }

    console.groupEnd();
  }

  function storeToPractice(questionInstance) { // [sn5]
    console.groupCollapsed("vocabManager() - storeToPractice()");

    let incorrectSets = loadLocalStorage();
    
    //console.log(questionInstance.readQuestionObj);
    // [sn6] Check if the object already exists in the array
    let exists = incorrectSets.some(answer =>
      answer.ka === questionInstance.readQuestionObj.ka &&
      answer.hi === questionInstance.readQuestionObj.hi &&
      answer.en === questionInstance.readQuestionObj.en
    );
  
    // If it doesn't exist, add it to the array
    if (!exists) {
      incorrectSets.push(questionInstance.readQuestionObj);
      console.log("New word pushed to localstorage.");
      localStorage.setItem("toPractice", JSON.stringify(incorrectSets));
      loadLocalStorage();
    }

    console.groupEnd();
  }
  
  function loadLocalStorage() {
    //console.groupCollapsed("vocabManager() - loadLocalStorage()");

    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    //console.log("storedObjects ", storedObjects);
    console.groupEnd();

    return storedObjects;
  }
  
  function clearIncorrectAnswers() {
    console.groupCollapsed("vocabManager() - clearIncorrectAnswers()");

    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loader().loadMemoryData();

    console.groupEnd();
  }

  return {
    removeQuestion,
    storeToPractice,
    clearIncorrectAnswers,
    loadLocalStorage,
    get readStoredLength() { 
      let storedLength = loadLocalStorage();
      return storedLength.length;
    },
  }
}

function errorManager() {
  const codeMapping = {
    iLoop: "infiniteloop",
    noSL: "syllable-error"
  };
  
  function runtimeError(errcode) {
    console.groupCollapsed("runtimeError()")
    console.info("errcode: ", errcode);
    
    if (codeMapping[errcode] === "infiniteloop") {
      let selectedArray = answerMgr.vocabMapping[selectors.aChoice.value];
      let choiceInput = parseInt(appState.noOfAnswers, 10);
      let noOfChoice = Math.min(choiceInput, selectedArray.length);
      
      console.info("selectedArray :", selectedArray);
      console.info("choiceInput :", choiceInput);
      console.info("noOfChoice: ", noOfChoice);
      
      // Infinite Loop Prevention: If selectedArray contains very few elements, 
      // the loop inside do...while of `prepareAnswers()` could run infinitely because it’s trying to pick a unique answer from a small pool, 
      // but keeps failing due to duplicates. This is less likely, but worth checking.
  
      if (selectedArray.length <= noOfChoice) {
        console.error("Not enough unique answers to generate.");
        if (!document.querySelector("[id|='runtime-error']")) { // if error is not already shown
          showError({errcode: "iLoop", parentName: selectors.settingNoOfAns, idName: "runtime-error"});
        }  
        console.groupEnd();
        return false; // Return false when there is an error
      } else {
        console.info("No runtime error: good to go!");
        console.groupEnd();
        return true; // Return true when there is no error
      }
    }
    
    else if(codeMapping[errcode] === "syllable-error") {
      if (!document.querySelector("[id|='syllable-error']")) { // if error is not already shown
        errorInstance.showError({
          errcode: "noSL",
          parentName: selectors.fieldsetSyllable,
          idName: 'syllable-error',
        });
      }
      return false; // Return false for syllable error case
    }
}

  function showError({ errcode, parentName, idName }) {
    console.groupCollapsed("showError()");
    
    const classNameMapping = {
      iLoop: "setting-error",
      noSL: "setting-error",
    };

    let errorMessage = "";
    
    if (codeMapping[errcode] === "infiniteloop") {
        console.warn("Runtime error: Not enough unique answers to generate.");
        errorMessage = `
            Not enough unique answers available. 
            Please reduce the number of answer choices.
        `;
    }

    else if (codeMapping[errcode] === "syllable-error") {
      console.error("No syllables selected.");
        errorMessage = `
            Select at least one syllable
        `;
    }

    buildNode({ 
      parent: parentName, 
      child: 'div', 
      content: errorMessage, 
      className: classNameMapping[errcode],
      idName: idName,
  });
  console.groupEnd();
  return this;
}
  
  return {
    runtimeError,
    showError,
  }
}