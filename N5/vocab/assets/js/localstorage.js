function storeToPractice(questionInstance) { // [sn5]
  let incorrectAnswers = JSON.parse(localStorage.getItem("toPractice")) || [];

  // [sn6] Check if the object already exists in the array
  let exists = incorrectAnswers.some(answer =>
    answer.ka === questionInstance.readQuestionObj.ka &&
    answer.hi === questionInstance.readQuestionObj.hi &&
    answer.en === questionInstance.readQuestionObj.en
  );

  // If it doesn't exist, add it to the array
  if (!exists) {
    incorrectAnswers.push(questionInstance.readQuestionObj);
    localStorage.setItem("toPractice", JSON.stringify(incorrectAnswers));
    //temp
    loadIncorrectAnswers();
  }
}

function loadIncorrectAnswers() {
  let incorrectAnswers = JSON.parse(localStorage.getItem("toPractice")) || [];
  console.log("Inside loadIncorrectAnswers(): ", incorrectAnswers);
  // You can use the `incorrectAnswers` array for further processing
}

function clearIncorrectAnswers() {
  //localStorage.removeItem("toPractice");
  console.log("Yes, we are in.");
}