document.addEventListener("DOMContentLoaded", () => {

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const result = document.getElementById("result");
  const copyBtn = document.getElementById("copyBtn");

  let selectedFile = null;

  /* =========================
     File Handling
  ========================= */

  function handleFile(file) {
    selectedFile = file;

    preview.innerHTML = "";
    result.textContent = "";
    copyBtn.style.display = "none";

    const reader = new FileReader();

    reader.onload = (e) => {
      if (file.type.startsWith("image")) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; border-radius:12px;" />`;
      } 
      else if (file.type.startsWith("video")) {
        preview.innerHTML = `
          <video controls style="max-width:100%; border-radius:12px;">
            <source src="${e.target.result}" type="${file.type}">
          </video>
        `;
      } 
      else {
        alert("Unsupported file type.");
      }
    };

    reader.readAsDataURL(file);
  }

  /* =========================
     Drag & Drop
  ========================= */

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-active");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-active");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-active");

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  /* =========================
     Analyze
  ========================= */

  analyzeBtn.addEventListener("click", async () => {

    if (!selectedFile) {
      alert("Please upload a file first.");
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    result.textContent = "";
    copyBtn.style.display = "none";

    try {

      const base64 = await toBase64(selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: base64.split(",")[1],
          mediaType: selectedFile.type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      result.textContent = data.prompt || "No prompt generated.";
      copyBtn.style.display = "inline-block";

    } catch (error) {
      console.error("Analyze Error:", error);
      result.textContent = "Error: " + error.message;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze & Generate Prompt";
    }
  });

  /* =========================
     Copy Prompt
  ========================= */

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(result.textContent);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy Prompt";
    }, 1500);
  });

  /* =========================
     Utility
  ========================= */

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

});
