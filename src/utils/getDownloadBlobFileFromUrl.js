export const downloadBlobFileFromUrl = (url, fileName) => {
  try {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "downloaded_file.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading blob file:", error);
  }
};
