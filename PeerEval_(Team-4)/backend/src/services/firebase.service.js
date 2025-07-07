import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: "src/.env" });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - The ID token to verify
 * @returns {Promise<Object>} - The decoded token
 */
export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw error;
  }
};

/**
 * Get user data from Firebase
 * @param {string} uid - The user ID
 * @returns {Promise<Object>} - The user data
 */
export const getFirebaseUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting Firebase user:', error);
    throw error;
  }
};

export default { verifyFirebaseToken, getFirebaseUser };