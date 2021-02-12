const canvas = document.querySelector("canvas");
const tilesetContainer = document.querySelector(".tileset-container");
const tilesetSelection = document.querySelector(".tileset-selection");
const tilesetImage = document.querySelector("#tileset-source");

const setWidth = document.getElementById("canvas_x");
const setHeight = document.getElementById("canvas_y");
const setNewSize = document.getElementById("set_canvas_size");
const canvasError = document.getElementById("canvas_error");

let exportImg = document.getElementById("export_img");
const exportJSON = document.getElementById("export_json");

let selection = [0, 0];
let json = "";

exportImg.onclick = exportImage;

let currentLayer = 0;

let layers = [
  //Bottom Layers
  {},
  //Top Layers
  {},
];

//Set Canvas Size
const setCanvasSize = () => {
  const newWidth = setWidth.value;
  const newHeight = setHeight.value;

  if (newWidth && newHeight !== "") {
    if (parseInt(newWidth % 32) === 0 && parseInt(newHeight % 32) === 0) {
      canvas.width = setWidth.value;
      canvas.height = setHeight.value;
      draw();
      console.log("divisible by 32");
    } else {
      canvasError.innerHTML =
        "Please enter a valid Canvas Size Multiples of 32. eg : 32, 64, 128...";
    }
  } else {
    canvasError.innerHTML = "Input Cannot be Input";
  }
};

setNewSize.addEventListener("click", setCanvasSize);

const draw = () => {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  let sizeOfCrop = 32;

  layers.forEach((layer) => {
    Object.keys(layer).forEach((key) => {
      const posX = parseInt(key.split("-")[0]);
      const posY = parseInt(key.split("-")[1]);

      const [tileSheetX, tileSheetY] = layer[key];

      context.drawImage(
        tilesetImage,
        tileSheetX * 32,
        tileSheetY * 32,
        sizeOfCrop,
        sizeOfCrop,
        posX * 32,
        posY * 32,
        sizeOfCrop,
        sizeOfCrop
      );
    });
  });
};

const getCordinate = (event) => {
  const { x, y } = event.target.getBoundingClientRect();
  const mouseX = event.clientX - x;
  const mouseY = event.clientY - y;
  return [Math.floor(mouseX / 32), Math.floor(mouseY / 32)];
};

tilesetContainer.addEventListener("mousedown", (e) => {
  selection = getCordinate(e);

  tilesetSelection.style.left = selection[0] * 32 + "px";
  tilesetSelection.style.top = selection[1] * 32 + "px";

  let selectedSprite = getCordinate(e)[0];

  if (selectedSprite === 0 || selectedSprite === 1) {
    setLayer(1);
    console.log("Selected Sprite on TOP!");
  } else {
    setLayer(0);
    console.log("Selected Sprite on Ground!");
  }
  //   console.log(getCordinate(e));
});

let isMouseDown = false;
canvas.addEventListener("mousedown", () => {
  isMouseDown = true;
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
});

canvas.addEventListener("mousedown", addTile);
canvas.addEventListener("mousedown", (event) => {
  if (isMouseDown) {
    addTile(event);
  }
});

function addTile(mouseEvent) {
  const clicked = getCordinate(mouseEvent);
  let key = clicked[0] + "-" + clicked[1];
  layers[currentLayer][key] = [selection[0], selection[1]];
  draw();
}

function setLayer(newLayer) {
  currentLayer = newLayer;
}

function clearCanvas() {
  layers = [{}, {}];
  draw();
}

function exportImage() {
  const data = canvas.toDataURL();
  let image = new Image();
  image.src = data;
  const image_window = window.open("");
  image_window.document.write(image.outerHTML);
}

function exportToJSON() {
  const data = JSON.stringify(layers);
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(data);
  let exportFileDefaultName = "data.json";
  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

document.getElementById("files").addEventListener("change", impotJSON, false);

function impotJSON(evt) {
  let files = evt.target.files;
  let output = [];
  for (let i = 0, f; (f = files[i]); i++) {
    let reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e) {
        try {
          json = JSON.parse(e.target.result);
          layers = [json[0], json[1]];
          draw();
        } catch (err) {
          alert(err);
        }
      };
    })(f);
    reader.readAsText(f);
  }
}

exportJSON.addEventListener("click", exportToJSON);

//init
tilesetImage.onload = function () {
  draw();
  setLayer(0);
};

tilesetImage.src = "./css/sprite_2.png";
