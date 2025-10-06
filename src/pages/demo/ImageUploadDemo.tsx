import { useState } from 'react';
import { ImageUpload, ImageGallery } from '../../components/common';
import { DashboardLayout } from '../../layout/DashboardLayout';

export const ImageUploadDemo = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Upload Demo</h1>
                        <p className="text-gray-600">Test the Firebase Storage image upload functionality</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Profile Photo Upload */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo Upload</h2>
                            <p className="text-gray-600 mb-4">Single image upload with avatar variant</p>
                            
                            <div className="flex justify-center">
                                <ImageUpload
                                    uploadType="profile"
                                    currentImage={profileImage}
                                    onImageChange={setProfileImage}
                                    variant="avatar"
                                    size="lg"
                                    placeholder="Upload profile photo"
                                />
                            </div>
                            
                            {profileImage && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        ✅ Profile image uploaded successfully!
                                    </p>
                                    <p className="text-xs text-green-600 mt-1 break-all">
                                        URL: {profileImage}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Photos Upload */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Photos</h2>
                            <p className="text-gray-600 mb-4">Multiple image uploads for user gallery</p>
                            
                            <ImageGallery
                                images={additionalImages}
                                onImagesChange={setAdditionalImages}
                                uploadType="additional"
                                maxImages={6}
                                size="md"
                            />
                            
                            {additionalImages.length > 0 && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        ✅ {additionalImages.length} additional photos uploaded!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Card Variant Upload */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Image Upload</h2>
                            <p className="text-gray-600 mb-4">Card variant for general image uploads</p>
                            
                            <ImageUpload
                                uploadType="profile"
                                currentImage={null}
                                onImageChange={(url) => console.log('Card image uploaded:', url)}
                                variant="card"
                                size="lg"
                                placeholder="Upload card image"
                            />
                        </div>

                        {/* Banner Upload */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Image Upload</h2>
                            <p className="text-gray-600 mb-4">Banner variant for wide images</p>
                            
                            <ImageUpload
                                uploadType="profile"
                                currentImage={null}
                                onImageChange={(url) => {
                                    console.log('Banner image uploaded:', url);
                                    setGalleryImages(prev => [...prev, url!]);
                                }}
                                variant="banner"
                                size="xl"
                                placeholder="Upload banner image"
                            />
                        </div>
                    </div>

                    {/* Gallery Images Display */}
                    {galleryImages.length > 0 && (
                        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery Images ({galleryImages.length})</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {galleryImages.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Gallery image ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Usage Examples */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Examples</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Photo</h3>
                                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`<ImageUpload
    uploadType="profile"
    currentImage={profileImage}
    onImageChange={setProfileImage}
    variant="avatar"
    size="lg"
    placeholder="Upload profile photo"
/>`}
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Image Gallery</h3>
                                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`<ImageGallery
    images={galleryImages}
    onImagesChange={setGalleryImages}
    uploadType="additional"
    maxImages={6}
    size="md"
/>`}
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Custom Hook</h3>
                                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`const { uploadFile, deleteImage, isUploading, uploadProgress, error } = useImageUpload({
    uploadType: 'profile',
    userId: currentUser?.uid,
    maxSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (url) => console.log('Uploaded:', url),
    onError: (error) => console.error('Error:', error)
});`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-medium text-blue-900 mb-2">Firebase Storage Integration</h3>
                                <p className="text-sm text-blue-700">Direct upload to Firebase Storage with progress tracking</p>
                            </div>
                            
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-medium text-green-900 mb-2">Multiple Variants</h3>
                                <p className="text-sm text-green-700">Avatar, card, banner, and gallery variants for different use cases</p>
                            </div>
                            
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="font-medium text-purple-900 mb-2">Drag & Drop</h3>
                                <p className="text-sm text-purple-700">Support for drag and drop file uploads</p>
                            </div>
                            
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h3 className="font-medium text-yellow-900 mb-2">File Validation</h3>
                                <p className="text-sm text-yellow-700">File type and size validation with error handling</p>
                            </div>
                            
                            <div className="p-4 bg-red-50 rounded-lg">
                                <h3 className="font-medium text-red-900 mb-2">Progress Tracking</h3>
                                <p className="text-sm text-red-700">Real-time upload progress with visual indicators</p>
                            </div>
                            
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <h3 className="font-medium text-indigo-900 mb-2">Error Handling</h3>
                                <p className="text-sm text-indigo-700">Comprehensive error handling with user-friendly messages</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
