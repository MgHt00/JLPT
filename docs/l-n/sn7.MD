Here’s a basic form structure that you can use for user input:

```html
<form id="settingsForm">
  <!-- Random Yes/No -->
  <label for="randomYesNo">Random Question Order:</label>
  <select id="randomYesNo" name="randomYesNo">
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
  <br><br>

  <!-- Syllable Choice Checkboxes -->
  <fieldset>
    <legend>Choose Syllables:</legend>
    <input type="checkbox" id="syllableA" name="syllableChoice" value="a">
    <label for="syllableA">A</label><br>
    <input type="checkbox" id="syllableI" name="syllableChoice" value="i">
    <label for="syllableI">I</label><br>
    <!-- Add more syllables as needed -->
  </fieldset>
  <br>

  <!-- Question Choice Input -->
  <label for="qChoiceInput">Question Language:</label>
  <select id="qChoiceInput" name="qChoiceInput">
    <option value="kanji">Kanji</option>
    <option value="hi">Hiragana</option>
    <option value="en">English</option>
  </select>
  <br><br>

  <!-- Answer Choice Input -->
  <label for="aChoiceInput">Answer Language:</label>
  <select id="aChoiceInput" name="aChoiceInput">
    <option value="kanji">Kanji</option>
    <option value="hi">Hiragana</option>
    <option value="en">English</option>
  </select>
  <br><br>

  <!-- Flash Card Yes/No -->
  <label for="flashYesNo">Flashcard Mode:</label>
  <select id="flashYesNo" name="flashYesNo">
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
  <br><br>

  <!-- Number of Answers -->
  <label for="noOfAnswers">Number of Answers:</label>
  <select id="noOfAnswers" name="noOfAnswers">
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
  </select>
  <br><br>

  <button type="submit">Submit</button>
</form>
```

### Handling Form Submission

You can capture the form data in JavaScript and use it to set your global variables:

```javascript
document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form from submitting the usual way

  randomYesNo = document.getElementById('randomYesNo').value === "true";
  
  syllableChoice = Array.from(document.querySelectorAll('input[name="syllableChoice"]:checked'))
                        .map(cb => cb.value);
  
  qChoiceInput = document.getElementById('qChoiceInput').value;
  aChoiceInput = document.getElementById('aChoiceInput').value;
  flashYesNo = document.getElementById('flashYesNo').value === "true";
  noOfAnswers = parseInt(document.getElementById('noOfAnswers').value);

  console.log(randomYesNo, syllableChoice, qChoiceInput, aChoiceInput, flashYesNo, noOfAnswers);

  // You can now proceed with these values to start the quiz or perform other actions
});
```

This will allow the user to select options, and the form data will be processed in JavaScript, updating the respective variables.

---
<em>I understand the first line (Array.from), but why we need to go through the .map?  Can you explain and teach it to me? </em>

---
Sure! Let's explore what the `syllableChoice` array would look like if we don't include the `.map()` step.

### Without `.map()`

If you skip the `.map(cb => cb.value)` step and only use `Array.from()` on the NodeList, your `syllableChoice` variable would contain an array of the checkbox elements themselves, not their values.

Here's what the code would look like:

```javascript
syllableChoice = Array.from(document.querySelectorAll('input[name="syllableChoice"]:checked'));
```

### Example

Suppose you have the following checkboxes in your form:

```html
<input type="checkbox" name="syllableChoice" value="a" checked>
<input type="checkbox" name="syllableChoice" value="i" checked>
<input type="checkbox" name="syllableChoice" value="u">
```

If you run the above code without the `.map()`, `syllableChoice` will look like this:

```javascript
syllableChoice = [
  input[type="checkbox"][name="syllableChoice"][value="a"],
  input[type="checkbox"][name="syllableChoice"][value="i"]
];
```

### What This Means

- **Each element in the `syllableChoice` array is a DOM element**: Specifically, each element is an `input` element representing a checkbox. You can still interact with these elements (e.g., read their properties, set attributes), but this is different from having an array of the values that you probably want.

- **To get the values later, you'd need to access them manually**: For example, to get the value of the first selected checkbox, you would need to access it like this:

  ```javascript
  syllableChoice[0].value; // "a"
  syllableChoice[1].value; // "i"
  ```

### With `.map()`

When you use `.map(cb => cb.value)`, you directly get an array of the `value` attributes of the selected checkboxes:

```javascript
syllableChoice = ['a', 'i'];
```

This is usually more convenient and directly useful, especially if you want to work with the selected syllables rather than the checkbox elements themselves.