export const displayUtils = {
  // to toggle class name
  toggleClass(className = "", ...nodes) { // [sn15]
    if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.classList.toggle(className); // Toggle the class
      }
    });
  },

  // to remove class name
  removeClass(className = "", ...nodes) {
    if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.classList.remove(className); // remove the class
      }
    });
  },

  // to add class names
  addClass(className = "", ...nodes){
    if(!className.trim()) return; // Prevent adding an empty or whitespace-only class

    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.classList.add(className); // add the class
      }
    });
  },

  checkClass(className = "", node) {
    if (!className.trim() || !(node instanceof HTMLElement)) return false;
    return node.classList.contains(className);  
  },
}