const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../google-service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const uploadToDrive = async (file) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: "application/pdf",
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Upload to specific folder
      },
      media: {
        mimeType: "application/pdf",
        body: fs.createReadStream(file.path),
      },
    });

    // Set permissions to view
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get shareable link
    const result = await drive.files.get({
      fileId: response.data.id,
      fields: "webViewLink",
    });

    fs.unlinkSync(file.path); // Remove local file

    return {
      fileId: response.data.id,
      viewLink: result.data.webViewLink,
    };
  } catch (error) {
    console.error("Drive upload error:", error);
    throw error;
  }
};

const deleteFromDrive = async (fileId) => {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error("Drive delete error:", error);
    throw error;
  }
};

const renameInDrive = async (fileId, newName) => {
  try {
    await drive.files.update({
      fileId,
      requestBody: { name: newName },
    });
  } catch (error) {
    console.error("Drive rename error:", error);
    throw error;
  }
};

module.exports = {
  uploadToDrive,
  deleteFromDrive,
  renameInDrive,
};
