export const downloadFileFromBuffer = (bytes: Buffer, fileName: string) => {
  console.log(bytes);

  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < bytes.length; i += 1) {
    ia[i] = bytes[i];
  }

  const blob = new Blob([ia], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.style.display = "none";
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
