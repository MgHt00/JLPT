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
  let questionRound = "fresh";
  console.log("Initial questionRound: ", questionRound);

  function newQuestion() {
    clearScreen([sectionQuestion, sectionMessage, sectionAnswer]);
    if (appData.vocabArray.length >= 1) { // check if there are still questions left to show.
      //console.log("Inside newQuestion: vocabArray ", appData.vocabArray);
      questionObj = prepareQuestion();
      appState.correctAns = questionObj[selectors.aChoice.value]; // store correct answer
      //console.log("inside newQuestion(); ramdomYesNo: ", appState.randomYesNo, "| questionObj: ", questionObj, "| appState.correctAns: ", appState.correctAns);
      
      buildNode({ 
        parent: sectionQuestion, 
        child: 'div', 
        content: questionObj[appState.qChoiceInput],
      });
      answerMgr.buildAnswers();  
    } else {
      if (questionRound === "fresh") { // if currently showing data from JSON
        questionRound = "localstorage";
        console.log("Processed questionRound: ", questionRound);

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
      } else if (questionRound === "localstorage") { // if currently showing data from localstorage
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
    }
  }

  /*
  function prepareQuestion() {
    let i = randomNo(0, (appData.vocabArray.length - 1));
    let selectedQuestionObj = {}; // to store the question obj temporarily

    if (appState.randomYesNo) {
      selectedQuestionObj = appData.vocabArray[i];
      vocabMgr.removeQuestion(i); // remove shown quesion from vocabArray
    }
    else {
      if (qNo < appData.vocabArray.length - 1) {
        selectedQuestionObj = appData.vocabArray[qNo];
        vocabMgr.removeQuestion(i); // remove shown quesion from vocabArray
        console.log("appData.vocabArray.length: ", appData.vocabArray.length, "| qNo : ", qNo);
        qNo++;
      } else {
        // မေးခွန်းကုန်သွားရင်
      }
    }
    return selectedQuestionObj;
  }
  */
  

  function prepareQuestion() {
    let selectedQuestionObj = {}; // to store the question obj temporarily
    if (typeof prepareQuestion.index === 'undefined') {
      //prepareQuestion.index = -1; // Start from -1, increment before use
      prepareQuestion.index = 0;
    }

    /*
    logic က ဒီမှာ မှားနေတယ်။  မေးပြီးသား question ကို ဖျက်ဖျက်လိုက်တဲ့ အတွက် ၊ random ကို no 
    လုပ်ထားရင် prepareQuestion.index က အမြဲ 0 ကို ပြနေမှ အစဥ်လိုက်ဖြစ်နေမယ်။  
    */ 

    /*
    console.log("prepareQuestion.index:(before increment) ", prepareQuestion.index);
    if (appState.randomYesNo) {
      prepareQuestion.index = randomNo(0, (appData.vocabArray.length - 1));
    } else {
        if(prepareQuestion.index < appData.vocabArray.length - 1) {
          prepareQuestion.index++;
        }
    }
    console.log("prepareQuestion.index:(after increment) ", prepareQuestion.index);
    selectedQuestionObj = appData.vocabArray[prepareQuestion.index];
    //vocabMgr.removeQuestion(prepareQuestion.index); // remove shown quesion from vocabArray
    */

    if (appState.randomYesNo) {
      prepareQuestion.index = randomNo(0, (appData.vocabArray.length - 1));
    } else {
      prepareQuestion.index = 0;
    }
    selectedQuestionObj = appData.vocabArray[prepareQuestion.index];
    return selectedQuestionObj;
  }

  function completeAndContinue() {
    //console.log("Entering correctAndContinue(); prepareQuestion.index to remove: ", prepareQuestion.index);
    vocabMgr.removeQuestion(prepareQuestion.index);
    //console.log("newQuestion is called.");
    //console.log("_________________");
    newQuestion();
  }

  return {
    newQuestion,
    completeAndContinue,
    get readQuestionObj() {return questionObj;},
  }
}


function AnswerManager() {
  const vocabMapping = {
    ka: kaVocab,
    hi: hiVocab,
    en: enVocab
  };

  function buildAnswers() {
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
  }

  function prepareAnswers() {
    //console.log("Inside prepareAnswers(); selectors.aChoice: ", selectors.aChoice, "| noOfChoice: ", noOfChoice, " | appState.correctAns: ", appState.correctAns);
    let selectedArray = vocabMapping[selectors.aChoice.value];
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
    noOfChoice = Math.min(choiceInput, selectedArray.length);

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
  }

  function multipleChoice(event) {
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
  }

  function storeOrContinue(event) { // sn4
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
  }

  function ContinueYesNo(event) {
    const btnID = event.currentTarget.id;

    if (btnID === "continue-yes-0") {
      loaderInstance.loadStoredJSON(); 
    } else if (btnID === "continue-no-0") {

      //listeners().debouncedMoveForm();
      listenerInstance.restart();
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
    ContinueYesNo,
  }
}

function vocabManager() {
  
  function removeQuestion(i) {
    if (appData.vocabArray.length >= 1) {
      appData.vocabArray.splice(i, 1);
      console.log(`currentQIndex ${i} is removed. vocabArray.length: ${appData.vocabArray.length}`);
      console.log("Inside removeQuestion(): After deletion; ", appData.vocabArray);
    } else {
      console.log(`vocabArray.length: ${appData.vocabArray.length}; reach the end.`);
    }
  }

  function storeToPractice(questionInstance) { // [sn5]
    console.log("Entering storeToPractice()");
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
  }
  
  function loadLocalStorage() {
    let storedObjects = JSON.parse(localStorage.getItem("toPractice")) || [];
    storedLength = storedObjects.length;
    console.log("storedObjects ", storedObjects);
    return storedObjects;
  }
  
  function clearIncorrectAnswers() {
    localStorage.removeItem("toPractice");
    console.log("localstorage flushed.");
    clearNode({
      parent: selectors.memoryInfo,
      children: selectors.readMemoryInfoDOMs,
    });
    loader().loadMemoryData();
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