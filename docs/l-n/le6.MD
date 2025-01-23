If you’re aiming to update `cumulativeAverage` over time, rather than recalculating it from scratch, you’ll want to avoid repeatedly dividing the total correct answers by the total number of questions each time you call the function.

Instead, let’s keep `cumulativeAverage` as an ongoing percentage score that updates only based on the latest question result. Here’s how you could adjust your code:

1. **Track correct answers dynamically:** Each time a new question is answered, update `cumulativeAverage` based on whether the answer was correct.
  
2. **Formula to Update Cumulative Average:**
   - Incrementally calculate the average using:
     \[
     \text{cumulativeAverage} = \frac{\text{cumulativeAverage} \times (\text{totalQuestionsAnswered} - 1) + \text{newResult}}{\text{totalQuestionsAnswered}}
     \]
   - Where `newResult` is `1` if correct, `0` if incorrect.

Here’s how to implement it:

```javascript
// Initialize these variables outside of the function
let cumulativeAverage = 0;
let totalQuestionsAnswered = 0;
let totalCorrectAnswers = 0;

function updateCumulativeAverage(isCorrect) {
  totalQuestionsAnswered++;
  if (isCorrect) totalCorrectAnswers++;
  
  // Calculate new cumulative average based on the latest answer
  cumulativeAverage = (cumulativeAverage * (totalQuestionsAnswered - 1) + (isCorrect ? 1 : 0)) / totalQuestionsAnswered;
  
  return Math.round(cumulativeAverage * 100); // Returns cumulative average as a percentage rounded to whole number
}
```

Now, each time you call `updateCumulativeAverage(true)` for a correct answer or `updateCumulativeAverage(false)` for an incorrect one, `cumulativeAverage` will adjust based on the new input and return a rounded whole-number percentage, like 67%, 75%, etc.