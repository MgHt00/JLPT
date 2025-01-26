export const helpers = {
  // Remove only existing language-related classes
  assignLanguage(sectionBlock, lang) {
    sectionBlock.classList.remove("jp", "en"); // Add other language class names if necessary
    
    // Remove the existing "lang" attribute if it exists
    if (sectionBlock.hasAttribute("lang")) {
      sectionBlock.removeAttribute("lang");
    }

    // Set the new "lang" attribute
    sectionBlock.setAttribute("lang", lang);
    
    // Add the corresponding class for the new language
    sectionBlock.classList.add(lang);
  },

  // to generate a random number
  randomNo(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // own version of console.log (not much useful)
  log(variable, label) {
    label ? console.log(`${label}: ${variable}`) : console.log(`${variable}`);
  },

  // to convert all checked syllables to an array
  convertCheckedValuesToArray(nodeList) {
    let convertedArray;
    convertedArray = Array.from(document.querySelectorAll(nodeList))
                          .map(eachCheckBox => eachCheckBox.value); // [sn7]
    return convertedArray;
  },

  // to copy `propertyName` property from source array of objects to target array
  // used to fetch all the answers and mix up with the correct answer
  copyOneProperty(source, target, propertyName) {
    console.groupCollapsed("copyOneProperty()");
    console.info("propertyName: ", propertyName);

    source.forEach((element, i) => {
      if (propertyName === "en") {
        console.info("Going through .toLowerCase() & trim()");
        target[i] = element[propertyName].toLowerCase().trim();
      } else {
        console.info("Skipped toLowerCase, going through trim()")
        target[i] = element[propertyName].trim();
      }
    });
    console.info(target);
    console.groupEnd();
  },

  // to shuffle an array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  },
}