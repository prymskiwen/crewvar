import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    uploadBytesResumable,
    getMetadata
} from 'firebase/storage';
import { storage } from './config';

// Types
export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

// Upload profile photo
export const uploadProfilePhoto = async (
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `users/${userId}/profile-photo/${fileName}`;
        const storageRef = ref(storage, filePath);

        if (onProgress) {
            // Use resumable upload for progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            state: snapshot.state
                        } as UploadProgress;
                        onProgress(progress);
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } else {
            // Simple upload without progress tracking
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        }
    } catch (error) {
        throw error;
    }
};

// Upload additional photo
export const uploadAdditionalPhoto = async (
    file: File,
    userId: string,
    photoSlot?: number,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        const fileName = `additional-${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `users/${userId}/additional-photos/${fileName}`;
        const storageRef = ref(storage, filePath);

        if (onProgress) {
            // Use resumable upload for progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            state: snapshot.state
                        } as UploadProgress;
                        onProgress(progress);
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } else {
            // Simple upload without progress tracking
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        }
    } catch (error) {
        throw error;
    }
};

// Upload chat image
export const uploadChatImage = async (
    file: File,
    roomId: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        const fileName = `chat-${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `chat/${roomId}/${fileName}`;
        const storageRef = ref(storage, filePath);

        if (onProgress) {
            // Use resumable upload for progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            state: snapshot.state
                        } as UploadProgress;
                        onProgress(progress);
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } else {
            // Simple upload without progress tracking
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        }
    } catch (error) {
        throw error;
    }
};

// Delete file
export const deleteFile = async (fileUrl: string): Promise<void> => {
    try {
        // Extract file path from URL
        const url = new URL(fileUrl);
        const filePath = url.pathname.substring(1); // Remove leading slash

        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
    } catch (error) {
        throw error;
    }
};

// Get file metadata
export const getFileMetadata = async (fileUrl: string) => {
    try {
        // Extract file path from URL
        const url = new URL(fileUrl);
        const filePath = url.pathname.substring(1); // Remove leading slash

        const storageRef = ref(storage, filePath);
        const metadata = await getMetadata(storageRef);
        return metadata;
    } catch (error) {
        throw error;
    }
};

// Utility function to extract file path from URL
export const getFilePathFromUrl = (fileUrl: string): string => {
    try {
        const url = new URL(fileUrl);
        return url.pathname.substring(1); // Remove leading slash
    } catch (error) {
        throw new Error('Invalid file URL');
    }
};
