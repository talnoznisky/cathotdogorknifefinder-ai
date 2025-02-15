let preview = document.getElementById("preview");
let resultDiv = document.getElementById("result");
let dropArea = document.getElementById("drop-area");
let fileInput = document.getElementById("file-input");
let loadingDiv = document.getElementById("loading");

let classifier;

// Load model
function loadModel() {
    classifier = ml5.objectDetector('cocossd', function() {
        console.log('Model Loaded');
    });
}

window.onload = loadModel;

// Drag & Drop events
dropArea.addEventListener("dragover", function(event) {
    event.preventDefault();
    dropArea.style.backgroundColor = "#b2ebf2";
});

dropArea.addEventListener("dragleave", function() {
    dropArea.style.backgroundColor = "#e0f7fa";
});

dropArea.addEventListener("drop", function(event) {
    event.preventDefault();
    dropArea.style.backgroundColor = "#e0f7fa";

    let file = event.dataTransfer.files[0];
    handleFile(file);
});

dropArea.addEventListener("click", function() {
    fileInput.click();
});

fileInput.addEventListener("change", function(event) {
    let file = event.target.files[0];
    handleFile(file);
});

// Handle image selection
function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
        let reader = new FileReader();
        reader.onload = function(e) {
            preview.onload = function () {
                classifyImage();  // Only classify AFTER image is fully loaded
            };
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select an image file.");
    }
}

// Classify image
function classifyImage() {
    // Clear previous results
    resultDiv.style.display = "none";
    resultDiv.textContent = "";
    resultDiv.className = "";

    // Show loading
    loadingDiv.style.display = "block";

    classifier.detect(preview, gotResults);
}

// Process results with confidence threshold
function gotResults(error, results) {
    // Hide loading indicator
    loadingDiv.style.display = "none";

    if (error) {
        console.error(error);
        resultDiv.textContent = "Error finding objects.";
        resultDiv.className = "error";
        resultDiv.style.display = "block";
        return;
    }

    // Filter results by confidence (only keep objects > 50% confidence)
    let detectedItems = results
        .filter(result => result.confidence > 0.5) 
        .map(result => result.label.toLowerCase())
        .filter(label => ["cat", "knife", "hot dog"].includes(label));

    // Update UI after detection
    if (detectedItems.length > 0) {
        resultDiv.textContent = `Found: ${detectedItems.join(", ").toUpperCase()}`;
        resultDiv.className = "success";
    } else {
        resultDiv.textContent = "Found: nothing, irrelevant";
        resultDiv.className = "error";
    }

    resultDiv.style.display = "block";
}
