import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const checkIsAdmin = async (email: string): Promise<boolean> => {
  try {
    if (!email) return false;
    
    // Cek di collection admins berdasarkan email
    const adminDoc = await getDoc(doc(db, 'admins', email));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      return adminData.role === 'admin' && adminData.isActive === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const createAdminUser = async (email: string) => {
  try {
    const adminRef = doc(db, 'admins', email);
    await setDoc(adminRef, {
      email: email,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};