```javascript
do {
  randomIndex = randomNo(0, selectedArray.length - 1);
  randomWord = selectedArray[randomIndex];
} while (tempAnsArray.includes(randomWord));
```

### What This Code Does
This code block is designed to ensure that when you pick a random word from `selectedArray`, it is not a duplicate of any word that has already been added to `tempAnsArray`.

### Step-by-Step Breakdown

1. **`do { ... } while (condition);` Loop:**
   - This is a **do-while loop**, which will always execute the code inside the `do { ... }` block at least once before checking the condition in the `while` statement. It continues to loop as long as the `while` condition is `true`.

2. **`randomIndex = randomNo(0, selectedArray.length - 1);`:**
   - This line generates a random index within the range of the `selectedArray` array. 
   - `randomNo(0, selectedArray.length - 1)` is a function call that returns a random number between `0` and the last index of the array (`selectedArray.length - 1`).

3. **`randomWord = selectedArray[randomIndex];`:**
   - This line selects a word from `selectedArray` using the random index generated in the previous step and assigns it to the variable `randomWord`.

4. **`while (tempAnsArray.includes(randomWord));`:**
   - This is the condition for the loop to continue running. It checks if the randomly selected word (`randomWord`) is already present in the `tempAnsArray`.
   - `.includes()` is an array method that returns `true` if the array contains the specified value (`randomWord` in this case) and `false` otherwise.

5. **Behavior of the Loop:**
   - The loop continues to generate a new `randomIndex` and selects a `randomWord` until it finds one that is **not already in** `tempAnsArray`.
   - Once a unique word is found (i.e., a word that is not already in `tempAnsArray`), the loop stops, and the unique word can be added to `tempAnsArray`.

### Example Scenario

Imagine `selectedArray` is `['apple', 'banana', 'orange', 'apple']`, and `tempAnsArray` already contains `['banana']`:

- The loop will randomly select an index, say `0`, which corresponds to `'apple'`.
- It then checks if `'apple'` is in `tempAnsArray`. Since it's not, the loop will exit, and `'apple'` can be added to `tempAnsArray`.
- If the loop had instead selected `index 1`, which corresponds to `'banana'`, it would recognize that `'banana'` is already in `tempAnsArray` and continue looping to find a different word.

### Summary

This code ensures that the word being added to `tempAnsArray` is unique by continuously selecting random words until a non-duplicate is found. This way, when `tempAnsArray` is finally built, it contains no duplicate words.