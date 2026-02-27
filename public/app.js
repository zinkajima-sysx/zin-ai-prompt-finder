const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");

let selectedFile = null;

dropZone.onclick = () => fileInput.click();

fileInput.onchange = e => handleFile(e.target.files[0]);

function handleFile(file) {
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" width="300">`;
  };
  reader.readAsDataURL(file);
}

document.getElementById("analyzeBtn").onclick = async () => {
  if (!selectedFile) return alert("Upload file first");

  const base64 = await toBase64(selectedFile);

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: base64.split(",")[1],
      mediaType: selectedFile.type
    })
  });

  const data = await response.json();
  result.textContent = data.prompt;
  copyBtn.style.display = "block";
};

copyBtn.onclick = () => {
  navigator.clipboard.writeText(result.textContent);
  alert("Prompt Copied!");
};

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
