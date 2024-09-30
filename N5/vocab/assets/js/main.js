function assignLanguage(sectionBlock, lang) {
  // Remove only existing language-related classes
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


function randomNo(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(variable, label) {
  label ? console.log(`${label}: ${variable}`) : console.log(`${variable}`);
}

function copyOneProperty(source, target, catName) {
  // to copy `CatName` property from source array of objects to target array
  // used to fetch all the answers and mix up with the correct answer
  let i = 0;
  source.forEach(element => {
    target[i] = element[catName];
    i++;
  });
}

// to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

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

function clearScreen(elements) { // to remove the content of a node
  // Ensure `elements` is treated as an array
  elements = Array.isArray(elements) ? elements : [elements];

  elements.forEach(element => {
    if (element) {
      element.innerHTML = ""; // Clear the content of the element
    }
  });
}

function clearNode({ parent, children = [] }) { // to move the entire node
  if (children.length > 0) {
    children.forEach(child => {
      if (parent.contains(child)) { // Ensure the child exists within the parent before removing
        parent.removeChild(child);
      }
    });
  } else {
    parent.innerHTML = ''; // Clears all children of the parent
  }
}

function checkNode({idName}) {
  return document.querySelectorAll(`[id^=${idName}]`).length > 0;
}

function flipNodeState(...nodes) { //[sn10]
  // Iterate over the nodes and toggle the disabled state
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.disabled = !node.disabled;
      toggleClass("disabled", node);
    }
  });
}

function toggleClass(className = "", ...nodes) { // [sn15]
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.toggle(className); // Toggle the class
    }
  });
}

function removeClass(className = "", ...nodes) {
  if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.remove(className); // remove the class
    }
  });
}