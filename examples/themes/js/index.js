import {Wheel} from '../../../dist/spin-wheel-esm.js';
import {loadFonts, loadImages} from '../../../scripts/util.js';
import {props} from './props.js';
//import {dateFormat} from '../../../scripts/util.js' 

//console.log(dateFormat(new Date (), "%Y-%m-%d %H:%M:%S"));


const domain = "localhost:5000";
const path = domain + + '/api/';

window.onload = async () => {
  function postLabels (labelsJSON) {
    fetch(path, {
      method: "POST",
      body: JSON.stringify(labelsJSON),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => {if (!response.ok) {console.log(response.json())}});
      //.then((json) => console.log(json));
  }

  function getLabelsJSON(onlyLabel = false, wheel = window.wheel) {
    let itemArray = [];
    window.wheel._items.forEach((x) => {itemArray.push({label: x._label, weight: x._weight, backgroundColor: x._backgroundColor, labelColor: x._labelColor})})
    return {leavesArray: itemArray};
  }
  function clearLeaves() {
    if(confirm("Are you sure you want to clear leaves?") == true) {
      let temp = props[dropdown.selectedIndex];
      temp.items = [];
      window.wheel._items = [];
      window.wheel.init({
        ...temp,
        rotation: wheel.rotation, // Preserve value.
      });
      window.wheel.refresh();
    }
  }
  await loadFonts(props.map(i => i.itemLabelFont));

  const wheel = new Wheel(document.querySelector('.wheel-wrapper'));
  const dropdown = document.querySelector('select');

  const images = [];

  for (const p of props) {
    // Initalise dropdown with the names of each example:
    const opt = document.createElement('option');
    opt.textContent = p.name;
    dropdown.append(opt);

    // Convert image urls into actual images:
    images.push(initImage(p, 'image'));
    images.push(initImage(p, 'overlayImage'));
    for (const item of p.items) {
      images.push(initImage(item, 'image'));
    }
  }

  await loadImages(images);

  // Show the wheel once everything has loaded
  document.querySelector('.wheel-wrapper').style.visibility = 'visible';

  // Handle dropdown change:
  dropdown.onchange = () => {
    wheel.init({
      ...props[dropdown.selectedIndex],
      rotation: wheel.rotation, // Preserve value.
    });
  };

  // Select default:
  dropdown.options[0].selected = 'selected';
  dropdown.onchange();

  // Save object globally for easy debugging.
  window.wheel = wheel;

  const btnSpin = document.getElementById("spinnerButton");
  const btnClearLeaves = document.getElementById("clearLeaves");
  const btnAddLeaves = document.getElementById("addLeaves");
  const popup = document.getElementById("popup");
  const leafEntryField = document.getElementById("leafEntry");
  const btnAddLeaf = document.getElementById("addLeaf");
  const btnSubmitLeaves = document.getElementById("submitLeaves");
  const addLeavesQueueDiv = document.getElementById("addLeavesQueue");

  let inputItems = [];
  let parsedInputJSON = [];
  btnAddLeaf.addEventListener("click", (e) => {
    e.preventDefault();
    let value = leafEntryField.value.trim();

    if (!value) return;

    inputItems.push(value);
    leafEntryField.value = "";
    leafEntryField.focus();
    value = "";

    //addLeavesQueueDiv.innerHTML += `<input id="{}">`; // TODO Form spawn for each entry with weight, labelColor, backgroundColor fields
    addLeavesQueueDiv.innerHTML = inputItems.toLocaleString();

  });

  btnSubmitLeaves.addEventListener("click", (e) => {

    parsedInputJSON = [];

    e.preventDefault();
    if (leafEntryField.value.trim() !== "") { btnAddLeaf.click() };
    popup.classList.add("hidden");
    let temp = props[dropdown.selectedIndex];
    inputItems.forEach((x) => {parsedInputJSON.push(JSON.parse(`{"label": "${x}"}`))});
    if(document.getElementById("clearCheck").checked === true) {
      clearLeaves();
      temp.items = parsedInputJSON;
    } else {
      temp.items = temp.items.concat(parsedInputJSON);
    }

    window.wheel.init({
      ...temp,
      rotation: wheel.rotation, // Preserve value.
    });
    window.wheel.refresh();

    inputItems = [];

    postLabels(getLabelsJSON())
  });

  leafEntryField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnAddLeaf.click();
    }
  });
  let modifier = 0;

  window.addEventListener('click', (e) => {

    // Listen for click event on spin button:
    if (e.target === btnSpin) {
      const {duration, winningItemRotaion} = calcSpinToValues();
      wheel.spinTo(winningItemRotaion, duration);
    }

    if (e.target === btnClearLeaves) {
      clearLeaves();
    }

    if (e.target === btnAddLeaves) {
      popup.classList.remove("hidden");
      leafEntryField.focus();
    }
    

  });

  console.log(getLabelsJSON());
  function calcSpinToValues() {
    const duration = 3000;
    const winningItemRotaion = getRandomInt(360, 360 * 1.75) + modifier;
    modifier += 360 * 1.75;
    return {duration, winningItemRotaion};
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function initImage(obj, pName) {
    if (!obj[pName]) return null;
    const i = new Image();
    i.src = obj[pName];
    obj[pName] = i;
    return i;
  }

};