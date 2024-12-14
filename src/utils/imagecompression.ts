import imageCompression from "browser-image-compression";

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export const compressImages = async (images: File[]) =>
  Promise.all(
    images.map(async (image) => {
      const compressedImage = await imageCompression(image, options);
      return compressedImage.size < image.size ? compressedImage : image;
    }),
  );
