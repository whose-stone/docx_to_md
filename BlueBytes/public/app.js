const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");
const selectionCount = document.getElementById("selectionCount");
const convertButton = document.getElementById("convertButton");
const clearButton = document.getElementById("clearButton");
const statusLine = document.getElementById("statusLine");
const progressBlock = document.getElementById("progressBlock");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const progressValue = document.getElementById("progressValue");

let selectedFiles = [];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function setStatus(message, state = "") {
  statusLine.textContent = message;
  statusLine.classList.remove("is-error", "is-success");
  if (state) {
    statusLine.classList.add(state);
  }
}

function setProgress(percent, label) {
  progressBlock.hidden = false;
  progressBar.style.width = `${percent}%`;
  progressValue.textContent = `${percent}%`;
  progressLabel.textContent = label;
}

function resetProgress() {
  progressBlock.hidden = true;
  progressBar.style.width = "0%";
  progressValue.textContent = "0%";
  progressLabel.textContent = "Uploading files...";
}

function updateList() {
  fileList.innerHTML = "";
  emptyState.hidden = selectedFiles.length > 0;
  selectionCount.textContent = `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ready`;

  selectedFiles.forEach((file, index) => {
    const row = document.createElement("li");
    row.className = "file-row";
    row.style.animationDelay = `${index * 50}ms`;
    row.innerHTML = `
      <div class="file-meta">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatBytes(file.size)}</span>
      </div>
      <span class="file-pill">DOCX</span>
    `;
    fileList.appendChild(row);
  });

  convertButton.disabled = selectedFiles.length === 0;
  clearButton.disabled = selectedFiles.length === 0;
}

function mergeFiles(incoming) {
  const unique = new Map(selectedFiles.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file]));
  Array.from(incoming).forEach((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (file.name.toLowerCase().endsWith(".docx")) {
      unique.set(key, file);
    }
  });
  selectedFiles = Array.from(unique.values());
  updateList();
  if (selectedFiles.length) {
    setStatus("Files queued. Convert when you're ready.");
  }
}

function clearFiles() {
  selectedFiles = [];
  fileInput.value = "";
  updateList();
  resetProgress();
  setStatus("Choose one or more DOCX files to begin.");
}

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (eventName === "drop") {
      mergeFiles(event.dataTransfer.files);
    }
    dropzone.classList.remove("is-over");
  });
});

fileInput.addEventListener("change", (event) => mergeFiles(event.target.files));
clearButton.addEventListener("click", clearFiles);

convertButton.addEventListener("click", async () => {
  if (!selectedFiles.length) {
    setStatus("Add at least one DOCX file before converting.", "is-error");
    return;
  }

  convertButton.disabled = true;
  clearButton.disabled = true;
  setStatus("Preparing upload...");
  setProgress(8, "Preparing files...");

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file, file.name));

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/convert", true);
  xhr.responseType = "blob";

  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return;
    const percent = Math.min(92, Math.round((event.loaded / event.total) * 70) + 10);
    setProgress(percent, "Uploading files...");
  };

  xhr.onload = () => {
    convertButton.disabled = false;
    clearButton.disabled = false;

    if (xhr.status >= 200 && xhr.status < 300) {
      setProgress(100, "Conversion complete");
      const blob = xhr.response;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bluebytes-markdown.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      const convertedCount = xhr.getResponseHeader("X-Converted-Count") || selectedFiles.length;
      setStatus(`Done. Downloaded a ZIP with ${convertedCount} converted Markdown file(s).`, "is-success");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let message = "Conversion failed.";
      try {
        const payload = JSON.parse(reader.result);
        message = payload.detail || message;
      } catch {
        message = xhr.statusText || message;
      }
      resetProgress();
      setStatus(message, "is-error");
    };
    reader.readAsText(xhr.response);
  };

  xhr.onerror = () => {
    convertButton.disabled = false;
    clearButton.disabled = false;
    resetProgress();
    setStatus("Network error while converting files.", "is-error");
  };

  xhr.send(formData);
});

updateList();
resetProgress();
