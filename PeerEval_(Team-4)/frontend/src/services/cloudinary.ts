import axios from "axios";

const CLOUDINARY_CLOUD_NAME = "dupkspyag";
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // You can create a custom upload preset in your Cloudinary dashboard

interface UploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads a file directly to Cloudinary
 * @param file The file to upload
 * @returns The upload response from Cloudinary
 */
export const uploadToCloudinary = async (
  file: File
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Uploads a file to Cloudinary through our backend
 * @param file The file to upload
 * @returns The upload response from the backend
 */
export const uploadViaBackend = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/v1/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading via backend:", error);
    throw error;
  }
};

/**
 * Gets a Cloudinary URL with transformations
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The transformed image URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  } = {}
): string => {
  const { width, height, crop = "fill", quality = "auto" } = options;

  let transformations = `q_${quality}`;

  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (crop) transformations += `,c_${crop}`;

  return `https://response.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
