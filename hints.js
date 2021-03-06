var __WKViewHints = Object.freeze((function(){
  'use strict';
  var hints = [];

  function addHint(elem, hintText) {
    let bounding = elem.getBoundingClientRect();
    if (bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        (elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0) &&
        hints.every(
          function (other) {
            let other_bounding = other.getBoundingClientRect();
            return !(Math.abs(other_bounding.top - bounding.top) < 5
                     && Math.abs(other_bounding.left - bounding.left) < 5)
          })
       ){
      let hint = document.createElement('div');
      hint.setAttribute('webkitviewhint', 'hint');
      hint.style.left = bounding.left + 'px';
      hint.style.top = bounding.top + 'px';
      elem.appendChild(hint);
      hint.appendChild(document.createTextNode(hintText));
      hints.push(hint);
    }
  }

  function cleanup(event) {
    console.log("cleaning up");
    hints.forEach(hint => hint.remove());
    document.removeEventListener('keydown', readKey);
    window.webkit.messageHandlers["webkit--callback-unfocus"].postMessage('');
    hints = [];
  }

  function readKey(event) {
    let key = event.key
    let newHints = hints.filter(hint => hint.innerText.startsWith(key));
    if (newHints.length > 1){
      hints.forEach(function (hint) {
        if (!hint.innerText.startsWith(key))
          hint.remove();
      });
      newHints.forEach(function (hint) {
        hint.innerText = hint.innerText.substring(1)
      });
      hints = newHints;
    }
    else if (newHints.length == 1){
      let selected = newHints[0].parentNode;
      console.log(selected);
      cleanup();
      selected.focus();
      selected.click();
    }
    else {
      cleanup();
    }
  }

  return function(hintKeys) {
    let N = hintKeys.length
    let tags = 'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])';
    let elems = document.querySelectorAll(tags);
    let hintPadLen = Math.ceil(Math.log(elems.length)/Math.log(N))
    let idxToHintText = function (idx) {
      return idx.toString(N).padStart(hintPadLen, '0').split('').map(
        digit => hintKeys.charAt(parseInt(digit, N))).join('');};

    elems.forEach((elem, idx) => addHint(elem, idxToHintText(idx)));

    document.addEventListener('keydown', readKey);
    return hints.length;
  };
})());

// Local Variables:
// js-indent-level: 2
// End:
