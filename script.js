let preview = document.getElementById("preview");
let resultDiv = document.getElementById("result");
let dropArea = document.getElementById("drop-area");
let fileInput = document.getElementById("file-input");
let loadingDiv = document.getElementById("loading");

let classifier;

function loadModel() {
    // classifier = ml5.objectDetector("cocossd", function () {
    classifier = ml5.objectDetector("MobileNet", function () {
        console.log("Model Loaded");
    });
}

window.onload = loadModel;

dropArea.addEventListener("dragover", function (event) {
    event.preventDefault();
    dropArea.style.backgroundColor = "#b2ebf2";
});

dropArea.addEventListener("dragleave", function () {
    dropArea.style.backgroundColor = "#e0f7fa";
});

dropArea.addEventListener("drop", function (event) {
    event.preventDefault();
    event.stopPropagation();
    dropArea.style.backgroundColor = "#e0f7fa";

    let file = event.dataTransfer.files[0];
    handleFile(file);
});

dropArea.addEventListener("click", function () {
    fileInput.click();
});

fileInput.addEventListener("change", function (event) {
    let file = event.target.files[0];
    handleFile(file);
});

function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
        if (file.type === "image/heic" || file.name.endsWith(".heic")) {
            convertHEIC(file);
        } else {
            loadImage(file);
        }
    } else {
        alert("Please select a valid image file.");
    }
}

function convertHEIC(file) {
    let reader = new FileReader();
    reader.onload = function (event) {
        heic2any({ blob: file, toType: "image/jpeg" })
        .then((convertedBlob) => {
            let convertedFile = new File([convertedBlob], file.name + ".jpg", { type: "image/jpeg" });
            loadImage(convertedFile);
        })
        .catch((error) => {
            alert("Failed to process HEIC file. Check console for details.");
        });
    };
    reader.readAsArrayBuffer(file);
}

function loadImage(file) {
    let reader = new FileReader();
    reader.onload = function (event) {
        preview.src = event.target.result;
        preview.style.display = "block";
        classifyImage();
    };
    reader.readAsDataURL(file);
}

function classifyImage() {
    resultDiv.style.display = "none";
    loadingDiv.style.display = "block";

    classifier.detect(preview, function (error, results) {
        loadingDiv.style.display = "none";

        if (error) {
            console.error(error);
            resultDiv.textContent = "Error detecting objects.";
            resultDiv.className = "error";
            resultDiv.style.display = "block";
            return;
        }

        let detectedItems = results
            .map((result) => result.label.toLowerCase())
            .filter((label) => ["cat", "knife", "hot dog"].includes(label));

        if (detectedItems.length > 0) {
            resultDiv.textContent = `Found: ${detectedItems.join(", ").toUpperCase()}`;
            resultDiv.className = "success";
        } else {
            resultDiv.textContent = "Found: nothing, irrelevant";
            resultDiv.className = "error";
        }

        resultDiv.style.display = "block";
    });
}
