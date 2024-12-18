// Remove only existing language-related classes
function assignLanguage(sectionBlock, lang) {
  sectionBlock.classList.remove("jp", "en"); // Add other language class names if necessary
  
  // Remove the existing "lang" attribute if it exists
  if (sectionBlock.hasAttribute("lang")) {
    sectionBlock.removeAttribute("lang");
  }

  // Set the new "lang" attribute
  sectionBlock.setAttribute("lang", lang);
  
  // Add the corresponding class for the new language
  sectionBlock.classList.add(lang);
}

// to generate a random number
function randomNo(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// own version of console.log (not much useful)
function log(variable, label) {
  label ? console.log(`${label}: ${variable}`) : console.log(`${variable}`);
}

// to convert all checked syllables to an array
function convertCheckedValuesToArray(nodeList) {
  let convertedArray;
  convertedArray = Array.from(document.querySelectorAll(nodeList))
                        .map(eachCheckBox => eachCheckBox.value); // [sn7]
  return convertedArray;
}  

// to copy `propertyName` property from source array of objects to target array
// used to fetch all the answers and mix up with the correct answer
function copyOneProperty(source, target, propertyName) {
  console.groupCollapsed("copyOneProperty()");
  console.info("propertyName: ", propertyName);

  source.forEach((element, i) => {
    if (propertyName === en) {
      console.info("Going through .toLowerCase() & trim()");
      target[i] = element[propertyName].toLowerCase().trim();
    } else {
      console.info("Skipped toLowerCase, going through trim()")
      target[i] = element[propertyName].trim();
    }
  });
  console.info(target);
  console.groupEnd();
}


// to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// to create node at the front end
function buildNode({parent, child, content, childValues = [], className = "", idName = "", eventFunction = "" }) {
  //console.log("Entering buildNode()");
  // Ensure className is always treated as an array
  className = Array.isArray(className) ? className : className.split(' ').filter(c => c.trim() !== ''); // 1) split with ' '; 2) remove excess spaces; 3) store if only it is not empty.

  // Ensure content is always treated as an array
  content = Array.isArray(content) ? content : [content];

  // Ensure value is always treated as an array
  childValues = Array.isArray(childValues) ? childValues : [childValues]

  content.forEach((contentItem, contentIndex) => {
    let newChild = document.createElement(child);
    //newChild.textContent = contentItem;
    // innerHTML instead of textContent to render HTML tags like <br>
    newChild.innerHTML = contentItem;

    // Assign value if childValues is provided and has enough entries
    if (childValues[contentIndex]) {
      newChild.value = childValues[contentIndex];
    }

    // Add all classes from className array (only non-empty)
   if (className.length > 0) {
    className.forEach(classItem => {
        newChild.classList.add(classItem);
      });
    }

    newChild.id = `${idName}-${contentIndex}`;

    // Add an event listener (if any)
    if (eventFunction) {
      newChild.addEventListener("click", eventFunction);
    }
    
    // Append the new element to the parent
    if (parent instanceof HTMLElement) {
      parent.appendChild(newChild);
    }

    //console.log("Appending to parent:", parent);
    //console.log("New child created:", newChild);
  }); 
  //console.log("Exiting buildNode()");
}

// to remove the content of a node
function clearScreen(elements, mode) { 
  //console.log("clearScreen()");
  // Ensure `elements` is treated as an array
  elements = Array.isArray(elements) ? elements : [elements];

  elements.forEach(element => {
    if (element) {
      switch (mode) {
        case "fast" :
          //console.info("MODE: fast - Clear: ", element);
          element.innerHTML = "";
          break;

        default:
          //console.info("MODE: animated - Clear: ", element);
          element.classList.add('fade-out-light');
          //element.innerHTML = ""; // Clear the content of the element
          setTimeout(() => {
            element.innerHTML = ""; // Clear the content of the element
            element.classList.remove('fade-out-light');
          }, 350); // Matches the transition duration
      }
    }
  });
  /*
  format for function calls
  setTimeout(() => {
  }, 350);
  */

  console.groupEnd();
}

/*async function clearScreen(elements) { 
  // Ensure elements is an array
  elements = Array.isArray(elements) ? elements : [elements];

  await Promise.all(
    elements.map(element => 
      new Promise(resolve => {
        if (element) {
          element.style.opacity = "1";  // Reset opacity to fully visible before transition
          element.classList.add('fade-out-light');
          
          // Listen for transition end to clear content and resolve
          element.addEventListener('transitionend', () => {
            console.log(`Clearing content for: ${element.id}`);
            element.innerHTML = ""; // Clear the content of the element
            element.classList.remove('fade-out-light'); // Reset for next usage
            resolve();
          }, { once: true });

          // Fallback in case 'transitionend' does not trigger
          setTimeout(() => {
            console.log(`Fallback clear for: ${element.id}`);
            element.innerHTML = "";
            element.classList.remove('fade-out-light');
            resolve();
          }, 1500); // Match transition duration
        } else {
          resolve(); // Immediately resolve if element is falsy
        }
      })
    )
  );

  console.log("clearScreen completed for all elements");
}*/

/*async function clearScreen(elements) {
  elements = Array.isArray(elements) ? elements : [elements];
  
  await Promise.all(
    elements.map(element => new Promise(resolve => {
      if (element) {
        console.log(`Adding fade-out to: ${element.id}`);
        element.classList.add('fade-out-light'); 

        // Wait for the transition to finish
        element.addEventListener('transitionend', () => {
          console.log(`Clearing content of: ${element.id}`);
          element.innerHTML = ""; // Clear content after fade-out completes
          element.classList.remove('fade-out-light'); // Reset fade-out for reuse
          resolve();
        }, { once: true });
      } else {
        resolve();
      }
    }))
  );
  console.log("clearScreen completed for all elements");
}*/

// to move the entire node
function clearNode({ parent, children = [] }) { 
  const childArray = Array.isArray(children) ? children : [children]; // Ensure children is an array]
  
  if (childArray.length > 0) {
    childArray.forEach(child => {
      if (parent.contains(child)) {
        child.classList.add('fade-out');

        // Wait for the transition before removing the child
        setTimeout(() => {
          parent.removeChild(child);
        }, 500); // Matches the transition duration
      }
    });
  } else {
    parent.innerHTML = ''; // Clears all children of the parent
  }
}

function checkNode({idName}) {
  return document.querySelectorAll(`[id^=${idName}]`).length > 0;
}

// (replaced using with `toggleClass`) Iterate over the nodes and toggle the disabled state
function flipNodeState(...nodes) { //[sn10]
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      //console.info("flipNodeState, node: ", node);
      node.disabled = !node.disabled;
      toggleClass("disabled", node);
    }
  });
}

// to toggle class name
function toggleClass(className = "", ...nodes) { // [sn15]
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.toggle(className); // Toggle the class
    }
  });
}

// to remove class name
function removeClass(className = "", ...nodes) {
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.remove(className); // remove the class
    }
  });
}

// to add class names
function addClass(className = "", ...nodes){
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.add(className); // add the class
    }
  });
}

function checkClass(className = "", node) {
  if (!className.trim() || !(node instanceof HTMLElement)) return false;
  return node.classList.contains(className);  
}
