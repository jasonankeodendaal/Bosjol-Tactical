/**
 * Bosjol Tactical Ultra-Compact Image Compressor
 * Compresses images strictly down to ~4KB - 10KB to preserve Supabase database size & bandwidth/egress.
 */

export interface CompressionOptions {
    targetMaxKb?: number; // Target max size in KB (default: 10)
    targetMinKb?: number; // Target min size in KB (default: 4)
    maxDimension?: number; // Max width/height in px (default: 320)
}

/**
 * Compresses any input image file or data URL to ultra-compact WebP/JPEG format (4KB - 10KB).
 */
export async function compressImageToUltraCompact(
    fileOrDataUrl: File | Blob | string,
    options: CompressionOptions = {}
): Promise<{ dataUrl: string; sizeBytes: number; sizeKb: number; file: File }> {
    const targetMaxBytes = (options.targetMaxKb || 10) * 1024;
    const initialMaxDim = options.maxDimension || 320;

    // Load source image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(new Error('Failed to load image for compression'));

        if (typeof fileOrDataUrl === 'string') {
            image.src = fileOrDataUrl;
        } else {
            image.src = URL.createObjectURL(fileOrDataUrl);
        }
    });

    let maxDim = initialMaxDim;
    let quality = 0.55;
    let bestDataUrl = '';
    let bestSizeBytes = Infinity;
    let attempts = 0;

    // Iterative compression to find optimal dimensions and quality under targetMaxBytes
    while (attempts < 8) {
        attempts++;

        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
            if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            }
        } else {
            if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas 2D context unavailable');
        }

        // Use high quality image rendering on canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try image/webp first, fallback to image/jpeg
        let currentDataUrl = '';
        try {
            currentDataUrl = canvas.toDataURL('image/webp', quality);
        } catch {
            currentDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Approximate byte size of base64
        const base64Content = currentDataUrl.split(',')[1] || '';
        const currentBytes = Math.round((base64Content.length * 3) / 4);

        bestDataUrl = currentDataUrl;
        bestSizeBytes = currentBytes;

        if (currentBytes <= targetMaxBytes) {
            break;
        }

        // If too large, shrink dimensions and quality
        maxDim = Math.max(120, Math.round(maxDim * 0.8));
        quality = Math.max(0.18, quality - 0.1);
    }

    // Convert data URL back to File/Blob for optional API upload
    const byteString = atob(bestDataUrl.split(',')[1]);
    const mimeString = bestDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const fileName = typeof fileOrDataUrl === 'string' ? 'compressed_image.webp' : (fileOrDataUrl as File).name?.replace(/\.[^/.]+$/, '.webp') || 'compressed_image.webp';
    const compressedFile = new File([blob], fileName, { type: mimeString });

    return {
        dataUrl: bestDataUrl,
        sizeBytes: bestSizeBytes,
        sizeKb: parseFloat((bestSizeBytes / 1024).toFixed(1)),
        file: compressedFile
    };
}
