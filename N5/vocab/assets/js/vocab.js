const questionMgr = questionManager();
const vocabMgr =  vocabManager();
const answerMgr = AnswerManager();

function fetchOneCategory(source, target, catName) {
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

function questionManager() {
  let questionObj = {};
  //let questionRound = "fresh";
  //console.log("Initial questionRound: ", questionRound);

  function newQuestion() {
    console.groupCollapsed("---questionManager() - newQuestion()---");

    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
      console.log("vocabArray ", appData.vocabArray);
      
      questionObj = prepareQuestion();
      appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer
      
      console.log("ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
      
      buildNode({ 
        parent: sectionQuestion, 
        child: 'div', 
        content: questionObj[appState.qChoiceInput],
      });
      answerMgr.buildAnswers();  
    } else { // if there is no more question left to show
      answerMgr.noMoreQuestion();
    }
    
    console.groupEnd();
  }

  function setMode(m) {
    console.groupCollapsed("questionManager() - setMode()");

    const validModes = ["fresh", "stored"];
    if(!validModes.includes(m)) {
      newQuestion.mode = "fresh"; // default to `fresh`
      console.warn("Invalid mode is passed. Defaulting to `fresh`.");
    } else {
      newQuestion.mode = m;
      console.info("Question mode: ", newQuestion.mode);
    }

    console.groupEnd();
  }

  function prepareQuestion() {
    console.groupCollapsed("questionManager() - prepareQuestion()");

    let selectedQuestionObj = {}; // to store the question obj temporarily
    if (typeof prepareQuestion.index === 'undefined') {
      prepareQuestion.index = 0;
    }

    if (appState.randomYesNo) {
      prepareQuestion.index = randomNo(0, (appData.vocabArray.length - 1));
    } else {
      prepareQuestion.index = 0;
    }
    selectedQuestionObj = appData.vocabArray[prepareQuestion.index];
    return selectedQuestionObj;
  }

  function completeAndContinue() {
    console.groupCollapsed("questionManager() - completeAndContinue()");

    vocabMgr.removeQuestion(prepareQuestion.index);
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


function AnswerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  function buildAnswers() {
    console.groupCollapsed("AnswerManager() - buildAnswers()");

    ansArray = prepareAnswers();
    //console.log("Inside buildAnswers(); ansArray: ", ansArray, "Inside buildAnswers(); flashYesNo: ", flashYesNo);

    if (appState.flashYesNo) { // if it is a flash card game
      buildNode({ 
        parent: sectionAnswer, 
        child: 'div', 
        content: 'Show Answer', 
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
    console.groupCollapsed("noMoreQuestion()");

    if (questionMgr.readQuestionMode === "fresh") { // if currently showing data from JSON
      questionMgr.readQuestionMode = "stored";
      console.log("Processed questionMgr.readQuestionMode: ", questionMgr.readQuestionMode);

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
    } else if (questionMgr.readQuestionMode === "stored") { // if currently showing data from localstorage
      // ဒီမှာ storedmemory က zero သေချာလားထပ်စစ်ဖို့လိုတယ်။ 
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
        //eventFunction: listeners().debouncedMoveForm,
        eventFunction: listeners().restart,
      });
    }

    console.groupEnd();
    return this;
  }

  function prepareAnswers() {
    console.groupCollapsed("AnswerManager() - prepareAnswers()");

    let selectedArray = vocabMapping[selectors.aChoice.value];
    console.info("selectedArray: ", selectedArray, "| selectedArray.legth: ", selectedArray.length);
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
    let choiceInput = selectors.readNoOfAns;
    noOfChoice = Math.min(choiceInput, selectedArray.length); // [le5]
    console.info("noOfChoice: ", noOfChoice);
    
    // Infinite Loop Prevention: If selectedArray contains very few elements, 
    // the loop inside do...while could run infinitely because it’s trying to pick a unique answer from a small pool, 
    // but keeps failing due to duplicates. This is less likely, but worth checking.

    if (selectedArray.length <= noOfChoice) {
      console.error("Not enough unique answers to generate.");
      runtimeError("infiniteloop");
      return;
      // JOB - return ပြန်လိုက်ပြီးတဲ့နောက် error ပြရမယ်။  
      // ဘယ်နေရာမှာ ပြမလဲ စဥ်းစားရမယ်။  အခုက return ထားတော့ အဖြေ မပြပဲ question ချည်းပဲ ပြနေတယ်။ 
      // newquestion ကို load မလုပ်ခင် အရင် စစ်ရမယ်ထင်တာပဲ။  မီးပြတ်တော့မယ်လေ ၊ ဝါးတီးဆွဲရမယ်။ 
    }

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
    console.groupCollapsed("AnswerManager() - showAnswer()");

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
        eventFunction: storeOrContinue 
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
    console.groupCollapsed("AnswerManager() - multipleChoice()");

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

  function storeOrContinue(event) { // sn4
    console.groupCollapsed("AnswerManager() - storeOrContinue()");

    const btnID = event.currentTarget.id;
    //const questionInstance = questionManager();

    if (btnID === "choice-btn-0") {
      //questionMgr.newQuestion();
      questionMgr.completeAndContinue();
    } else if (btnID === "choice-btn-1") {
      
      vocabMgr.storeToPractice(questionMgr); // // add wrongly selected word to localstorage
      //practiceAgain(questionInstance);
      //questionMgr.newQuestion(); // NEED TO CHECK THIS
      questionManager.completeAndContinue();
    }

    console.groupEnd();
  }

  function ContinueYesNo(event) {
    console.groupCollapsed("AnswerManager() - ContinueYesNo()");

    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      listenerInstance.continuetoStoredData();
    } else if (btnID === "continue-no-0") {

      //listeners().debouncedMoveForm();
      listenerInstance.restart();
    }

    console.groupEnd();
  }

  function runtimeError(errcode) {
    const codeMapping = {
      infiniteloop: 1,
    }
    
    if(codeMapping[errcode] === 1) {
      console.warn("Runtime error: Not enough unique answers to generate.");
      //alert("Not enough unique answers available. Please reduce the number of answer choices."); // Notify user
      // Optionally, return to halt execution or take other actions
      buildNode({ 
        parent: selectors.settingNoOfAns, 
        child: 'div', 
        content: 'Not enough unique answers available. Please reduce the number of answer choices.', 
        className: 'runtime-error', 
      });
      return;
    }
  }

  //let rePractice = [];

  function practiceAgain() {
    //const questionInstance = questionMgr;
    console.log("Inside showQuestionAgain(); questionObj: ", questionMgr.readQuestionObj);
    rePractice.push(questionMgr.readQuestionObj);
  }

  return {
    buildAnswers,
    noMoreQuestion,
    ContinueYesNo,
  }
}

function vocabManager() {
  
  function removeQuestion(i) {
    console.groupCollapsed("vocabManager() - removeQuestion()");

    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
      console.log(`currentQIndex ${i} is removed. vocabArray.length: ${appData.vocabArray.length}`);
      console.log("Inside removeQuestion(): After deletion; ", appData.vocabArray);
    } else {
      console.log(`vocabArray.length: ${appData.vocabArray.length}; reach the end.`);
    }

    console.groupEnd();
  }

  function storeToPractice(questionInstance) { // [sn5]
    console.groupCollapsed("vocabManager() - storeToPractice()");

    let incorrectSets = loadLocalStorage();

    // QuestionManager ရဲ့ questionRound ကို အပြင်ထုတ်ပြီး အခု function ထဲမှာ ပြင်ဖို့လိုတယ် ထင်တယ်
    // စမ်းဖို့က memory ကို flush လုပ် , round အသစ် နဲ့ စပြီး answer အမှားကို ရွေး ။ သဘောက လမ်းမှာ localstorage ထဲ
    // အသစ်ထည့်တယ်ပေ့ါ။  vocab ကုန်သွားတဲ့အခါ localstorage ရှိနေသော်လည်း questionmanager က memory zero ထင်ပြီး
    // let's restart ပြနေတယ်။  
    
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
    console.groupCollapsed("vocabManager() - loadLocalStorage()");

    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    console.log("storedObjects ", storedObjects);
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
    //clearIncorrectAnswers,
    //get readQuestionIndex() { return currentQIndex; },
  }
}