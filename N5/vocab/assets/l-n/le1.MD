Your code structure looks solid, and you've implemented the core functionalities well. Here's a summary and a few pointers for further improvement:

### Summary of the Flow:
1. **HTML Structure**:
   - Simple HTML structure with `section-question` and `section-answer` sections.
   
2. **Global Variables**:
   - Defined in `globals.js` for various purposes like storing vocab arrays, question and answer states, etc.

3. **Main Logic** (`main.js`):
   - Handles the core interactions such as assigning languages, displaying content, generating random numbers, and handling multiple-choice logic.
   
4. **Vocabulary Handling** (`vocab.js`):
   - Manages vocab data, including fetching from JSON files, preparing questions and answers, and shuffling options.

5. **Data Loading** (`load.js`):
   - Responsible for loading the JSON files based on syllable choices, merging them, and triggering the start of the game.

6. **DOM Manipulation** (`dom.js`):
   - Defines reusable functions like `buildNode` for creating and appending elements dynamically to the DOM.

7. **Local Storage** (`localstorage.js`):
   - Handles storing and retrieving incorrectly answered questions for future practice.
<br><br>
---
# main.js
### loadDefaults()
- Input ရှိရင် input ကို variable တွေထဲထည့် ၊ input မရှိရင် defaults တွေ load

### assignLanguage(sectionBlock, lang)
- HTML tag မှာ `lang` နဲ့ `class` attribute ထည့်

### displayContent(sectionBlock, content)
- `content` ပါတဲ့ `div` တစ်ခု ဆောက်ပြီး `sectionBlock` မှာပေါင်းထည့်

### randomNo(min, max)
- Random no. ထုတ်

### function log(variable, label)
- `consol.log` ထုတ်

### storeOrContinue(event)
- click လုပ်လိုက်တဲ့ event id ကို ယူ
- yes ဆိုရင် ရှေဆက့်
- no ဆိုရင် localStorage ထဲသိမ်း

### multipleChoice(event)
- click လုပ်တဲ့ အဖြေမှန်ရင် `clearScreen()` ပြီး `buildDOM()` ၂ ခါခေါ်

### clearScreen(elements)
- pass လုပ်ထားတဲ့ element တွေကို loop ပတ်ပြီး ရှင်း

### newQuestion()
- question အသစ်ကို load လုပ်

### buildDOM(parent, child, content, className, id)
- pass လုပ်လိုက်တဲ့ content နဲ့ className ကို ဇယားတွေရှုပ်နေမှာစိုးလို့ array ဖြစ်အောင် တန်းပြောင်းပြီး screen ပေါ် တစ်ခုချင်းစီတင်။  check sn2 for more detail.

### buildAnswers() 
- `ansArray` ထဲကို shuffled လုပ်ထားတဲ့ answers တွေထည့်
- answer button တွေဆောက်

### showAnswer() 
- ရှိပြီးသား answer button တွေကိုဖျက်
- correct answer ပြ
- လိုအပ်ရင် ထပ်သွားဖို့ button တွေထပ်ပြ

<br><br>

---------

# vocab.js
### fetchOneCategory(source, target, catName)
- `source` ရဲ့ `catName` (ka/hi/en) တစ်မျိုးတည်းရဲ့ ရှိသမျှကို `target` ထဲကူး

### prepareQuestion(section, vocab, randomYesNo, qChoice)
- `randomYesNo` အတိုင်း `vocab` array ရဲ့ `qChoice` ကို `section` မှာပြ

### function prepareAnswers(aChoice, noOfChoice, correctAns)
- pass လုပ်ထားတဲ့ noOfChoice အရေအတွက်အတိုင်း answer ပြနိုင်ဖို့ correct answer + မထပ်တဲ့ answer တွေ ပြင်ဆင်

### shuffleArray(array)
- to shuffle an array

<br><br>
---

# load.js
loadData()
- to load user's choice from the interface

prepareJSON(syllables)
- user practice လုပ်ချင်တဲ့ syllable အတိုင်း json file တွေ fetch လုပ်
<br><br>
---

# localstorage.js
### storeToPractice(objToStore)
- မှားတဲ့ questions တွေကို object လိုက် လက်ခံပြီး localStorage ထဲ သိမ်း

### loadIncorrectAnswers()
- localStorage ထဲက ဆွဲထုတ်

### clearIncorrectAnswers()
- localStorage ကို ရှင်း

<br><br>
----------
# unused functions
```javascript
function checkDuplicates(ansArray) {
  let checkedAnsArr = [];
  checkedAnsArr[0] = ansArray[0].toString(); // The correct answer is intact.

  for(let i = 1; i < ansArray.length; i++) {
    let checkingAns = ansArray[i].toString();

    // Check if sourceAns already exists in checkedAnsArr
    if (!checkedAnsArr.includes(checkingAns)) {
      checkedAnsArr.push(checkingAns); // Add unique answers to checkedAnsArr
    } 
  }

  return checkedAnsArr;
}

function checkTotalAns(ansArray, noOfAnswers) {
  log(ansArray);
  if (ansArray.length < noOfAnswers) {
    // Handle the case where the array is shorter than expected
    console.log("The ansArray has fewer items than expected. Handling...");
  } else {
    // Proceed with the next steps if the array length is correct
    console.log("The ansArray is correct in length.");
  }
}
