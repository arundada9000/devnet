const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_DIMENSIONS = { width: 200, height: 200 };

export function validateFile(file) {
  const errors = [];

  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Unsupported type: ${file.type}. Use JPEG, PNG, WebP, or HEIC.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 10MB.`);
  }

  if (file.size === 0) {
    errors.push("File is empty.");
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
  };
}

export function validateDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const valid = img.width >= MIN_DIMENSIONS.width && img.height >= MIN_DIMENSIONS.height;
      resolve({
        valid,
        width: img.width,
        height: img.height,
        error: valid ? null : `Image too small: ${img.width}x${img.height}. Min ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}.`,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: "Could not decode image." });
    };
    img.src = url;
  });
}
