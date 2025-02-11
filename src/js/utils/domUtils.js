export const domUtils = {
  // to create node at the front end
  buildNode({parent, child, content, childValues = [], className = "", id = "", eventFunction = "" }) {
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

      newChild.id = `${id}-${contentIndex}`;

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
  },

  // to remove the content of a node
  clearScreen(elements, mode) { 
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

    console.groupEnd();
  },

  // to move the entire node
  clearNode({ parent, children = [] }) { 
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
  },

  checkNode({id}) {
    return document.querySelectorAll(`[id^=${id}]`).length > 0;
  },

  // (replaced using with `toggleClass`) Iterate over the nodes and toggle the disabled state
  flipNodeState(...nodes) { //[sn10]
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        //console.info("flipNodeState, node: ", node);
        node.disabled = !node.disabled;
        toggleClass("disabled", node);
      }
    });
  },
}