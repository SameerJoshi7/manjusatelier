export function optimizeCloudinaryUrl(url: string, width: number = 800): string {
  if (!url) return url;
  
  // Only modify if it's actually a cloudinary upload URL
  if (!url.includes('res.cloudinary.com')) return url;

  // Split URL into parts around the /upload/ path
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url; // Unexpected format

  const beforeUpload = url.slice(0, uploadIndex + 8);
  const afterUpload = url.slice(uploadIndex + 8);

  // Check if transformations already exist
  if (afterUpload.startsWith('f_auto,q_auto')) {
    return url; 
  }

  // Inject our optimized transformation: format=auto, quality=auto, width=X
  return `${beforeUpload}f_auto,q_auto,w_${width}/${afterUpload}`;
}
