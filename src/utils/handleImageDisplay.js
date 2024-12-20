export const handleImageDisplay = (base64String) => {
  if (base64String) {
    const binaryString = atob(base64String);
    const byteNumbers = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteNumbers[i] = binaryString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    return URL.createObjectURL(blob);
  }
  return null;
};
