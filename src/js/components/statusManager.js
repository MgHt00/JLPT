export function statusManager(globals, utilsManager) {
  const { appData, currentStatus } = globals;
  const { domUtils } = utilsManager;

  // Initialize statusManager's properties, if it’s not defined yet ...
  if (statusManager.goodToResume === undefined) {
    statusManager.goodToResume = "false";
  }

  // return `questionCount`
  function readQuestionCount() {
    return currentStatus.questionCount;
  }

  // increase `questionCount`
  function increaseQuestionCount() {
    currentStatus.questionCount++;
    //console.info("currentStatus() -> questionCount: ", questionCount);
  }

  // reset `questionCount`
  function resetQuestionCount () {
    currentStatus.questionCount = 0;
    return this;
  }

  // reset `totalNoOfQuestion` to zero
  function resetTotalNoOfQuestion() {
    currentStatus.totalNoOfQuestions = 0;
    return this;
  }

  // assign `vocabArrary` length to `totalNoOfQuestions`
  function getTotalNoOfQuestions(state) {
    console.groupCollapsed("getTotalNoOfQuestions()");

    switch (state) {
      case "fresh":
        console.info("state : ", state);
        currentStatus.totalNoOfQuestions = appData.vocabArray.length;
        break;

      case "stored":
        console.info("state : ", state);
        currentStatus.totalNoOfQuestions += appData.vocabArray.length;
        break;
    }

    //totalNoOfQuestions = appData.vocabArray.length;
    console.info("currentStatus() -> totalNoOfQuestions: ", currentStatus.totalNoOfQuestions);

    console.groupEnd();
    return currentStatus.totalNoOfQuestions;
  }

  // to print score and status(`#/#`) on screen
  function printQuestionStatus() {
    domUtils.clearScreen(selectors.sectionStatus);

    setTimeout(() => {
      if (currentStatus.totalQuestionsAnswered >= 1) { // show cumulative average only it is not the first question shown
        domUtils.buildNode({
          parent: selectors.sectionStatus,
          child: "div",
          content: `Average Correct Rate: ${currentStatus.averageScore}%`,
        });
      }
  
      domUtils.buildNode({
        parent: selectors.sectionStatus,
        child: "div",
        content: `${readQuestionCount()} / ${currentStatus.totalNoOfQuestions}`,
      });
    }, 350);
  }

  // to reset all variables concerning with calculating the cumulative average
  function resetCumulativeVariables() {
    currentStatus.cumulativeAverage = 0;
    currentStatus.totalCorrectAnswers = 0;
    currentStatus.totalQuestionsAnswered = 0; 
    return this;
  }

  // to increase totalCorrectAnswers
  function increaseTotalCorrectAnswers() {
    currentStatus.totalCorrectAnswers++;
    return this;
  }

  // to increase totalQuestionsAnswered
  function increaseTotalQuestionsAnswered() {
    currentStatus.totalQuestionsAnswered++;
    return this;
  }

  function updateCumulativeAverage(isCorrect) {
    //console.groupCollapsed("updateCumulativeAverage()");

    currentStatus.totalQuestionsAnswered++;
    if (isCorrect) currentStatus.totalCorrectAnswers++;
    //console.info("totalQuestionsAnswered :", totalQuestionsAnswered, "totalCorrectAnswers :", totalCorrectAnswers);

    // Calculate new cumulative average based on the latest answer
    currentStatus.cumulativeAverage = (currentStatus.cumulativeAverage * (currentStatus.totalQuestionsAnswered - 1) + (isCorrect ? 1 : 0)) / currentStatus.totalQuestionsAnswered; //le6
    //console.info("cumulativeAverage :", cumulativeAverage);

    // Calculate the percentage and round to a whole number
    currentStatus.averageScore = Math.round(currentStatus.cumulativeAverage * 100); // This will give you a whole number
    //console.info("averageScore :", averageScore);

    return currentStatus.averageScore; // Return the rounded percentage directly
  }

  // to read totalCorrectAnswers
  function readTotalCorrectAnswers() {
      return currentStatus.totalCorrectAnswers;
  }

  function stillInProgress() {
    console.groupCollapsed("stillInProgress()");

    const savedCurrentStatus = JSON.parse(localStorage.getItem("currentStatus")); // Parse JSON
    const savedTotalQuestionsAnswered = savedCurrentStatus.totalQuestionsAnswered;
    const savedTotalNoOfQuestions = savedCurrentStatus.totalNoOfQuestions;

    //if (savedCurrentStatus && (savedCurrentStatus.questionCount >= 1)) {
    if (savedCurrentStatus && (savedTotalQuestionsAnswered < savedTotalNoOfQuestions)) {
      console.info("TRUE - program still in progress.  ", savedTotalQuestionsAnswered, "/", savedTotalNoOfQuestions);
      console.groupEnd();
      return true;
    } else {
      console.info("FALSE - no remaining questions.", savedTotalQuestionsAnswered, "/", savedTotalNoOfQuestions);
      console.groupEnd();
      return false;
    }
  }  

  function getGoodToResume() {
    return statusManager.goodToResume;
  }

  function setGoodToResume(value) {
    console.groupCollapsed("setGoodToResume()");

    const validValues = [true, false];
    if(!validValues.includes(value)) {
      statusManager.goodToResume = false;
      console.warn("statusManager.goodToResume set to default - FALSE");
    } else {
      statusManager.goodToResume = value;
      console.info("statusManager.goodToResume set to - ", value);
    }

    console.groupEnd();
  }
  

  return {
    resetQuestionCount,
    resetTotalNoOfQuestion,
    getTotalNoOfQuestions,
    readQuestionCount,
    increaseQuestionCount,
    printQuestionStatus,
    resetCumulativeVariables,
    //calCumulativeAverage,
    //increaseTotalCorrectAnswers,
    //increaseTotalQuestionsAnswered,
    updateCumulativeAverage,
    stillInProgress,
    get goodToResume() { return getGoodToResume(); },
    set goodToResume(value) { setGoodToResume(value); },
  }
}