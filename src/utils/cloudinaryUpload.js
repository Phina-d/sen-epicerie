const CLOUD_NAME = "dbiltufxo";
const UPLOAD_PRESET = "senepicerie_products";

export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error("Aucune image sélectionnée.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible d'envoyer l'image vers Cloudinary."
    );
  }

  const data = await response.json();

  return data.secure_url;
}