<em>In this code, vocabArray.length is 0 when I check in console.  Is it because, displayQuestion() is called before the json is loaded?  If so how can i edit my code?</em>

---

Yes, the issue arises because `displayQuestion()` is being called before the JSON data is loaded into `vocabArray`. The `fetch()` function works asynchronously, so the code following it may execute before the JSON data is fully loaded.

To fix this, you can call `displayQuestion()` only after the JSON data has been successfully loaded. This can be done by moving the call to `displayQuestion()` inside the `then()` block after the data has been assigned to vocabArray.

By moving `displayQuestion(sectionQuestion, vocabArray, randomYesNo)`; into the `then()` block, you ensure that it only gets called after the data has been fetched and stored in vocabArray. This way, vocabArray will have the correct length and content when `displayQuestion()` is executed.