import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: "src/.env" });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "dopaminedrivingdashboard",
        clientEmail: "firebase-adminsdk-fbsvc@dopaminedrivingdashboard.iam.gserviceaccount.com",
        // Replace newlines in the private key
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCb8ZeIqo1I5o7P\nuFPPcGrzU9PLqQ4K+IoKV+cSKKfkPm7iXsCGz5sMTrKJ4FQnCcr2hvo6nr2TC+HU\nQSouwk0UG3/sJM4VHwRSmWxO6qhk7ar1lrCNWxygoGj2tKv6a70bp7j5gr6gRZaV\n9YMi23XB4HTffY8MHbQccPeG7GX5r3iZYmz7KNL6/rm/trc78CEPJGeCZG0jbYsS\nTsf6eFEE8bU8KbTQrSOe302ENf/JtrpQfzTTeaond3A2YPovZKaxrA8ive/rKRhF\ntud1V0Qz/CUAi0Kh32EsS28+2l5cFoPyQ0VRNh5m13wLEGaqeRP9TRYJ3LBZUILr\np9Hs/vxFAgMBAAECggEAFSpaNdtoJ6/bTEgpX+tTKMmE4oyEcmq/WZ4Kp8VK3Ei5\nBhJ0MRf2ZFo+E0aWRWIn4QP67H/lHRMsyIE7t3L5wTPmTefE7Mrz7D4UnDVvO5ui\na4jTV6w5G3gKJwnomamL1jgSfBMJynkHcj0LWmzM886CLl89Thit/Ho8rlxhjtzS\n1a5cmwvyPUD8qODVSXTeIwPghZYYMJzLv8S9vTgdld02f7o1981IJqGF5X5zTpqF\n1HVtk6meW13iDdLzVZpZp7tlX8CB7SpYuR/U++x4Q7CP0ErQQeSB9O8v3gxIzFGU\n36NJH6MD9pdyktWloS6cn46Jnb3WKZ9mBMZV+OC7dQKBgQDIQnUfM9+GAZTWIaac\nuUl5ePfBdscBxmtGvTUOLvniH6i0Tt9Hm3f37AOuBszyx/2nNzsCUFILa9dfGe09\nIDJFIOt1SbUxWs2zUJv9jx1VZm1XkPNtemnm6W+PvtiMCAg+Okg1B5fJLdfcz9dF\nR1jcxo/FMkcvk1sOlK1aHxqbPwKBgQDHWWV7U2a8D2Ur8ixcaKEVPhtHWFqggAGJ\neZvE2P74o2m+u/DmbgM9BuBxYiyeOuoEa9uyAY1FbacbGzbkgEiI0byRlWdwx8ej\n1CLEffinZQh4gnvQTHodk3802voc6Mftjv48fwfS6sp1zvl0icVN+WAe18W9zYpn\nAnDRyzlbewKBgBUJzk4h3/ivD9jTHjLW0F4/lB+x/8Qy+TAsTneX/c6ArvOKWbCn\nJ5pXJCfTNRLIaeB4T+21THlAshaenarPSBi1Fadzv+JYfMW60Th5IYbIRPJvGvPE\naX3Fxl+emBdV/K+05cMUciDDfSsIdsAjd7Vx8savuoTIAUft3KxcGip3AoGAMz6w\nzq4W17shZ9WeP7cJyZsoigOVcHLXck6Xk1ew25uuYECR4bpgDL0KzzrMe3Rrme1c\nEXtCpJlWfqpVRxIPE1TPI6GDcMN6d4vd0CMN24ImVkw8pcQzFA1Jgv3Tk8DnPBMp\nGcYR7c87cmNdTu7nkG7NncAb7fm7XVWMSPHz8acCgYAMnKNpiX2Os/PD0SD51SR2\nPk5qmnr9RY3agOTiNJXPoiveUtsD5HReq6Es8yaodQQ79BdS9KOXwa0vEmWV9sMC\nocSLfDVXre0Trso3nseYkcFSiHfVeOSFmzvSWNGOyBdFVOVOdce5r+L5MPM3UIcm\n5UlLtTayzipGnbLgSoXieg==\n-----END PRIVATE KEY-----\n",
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