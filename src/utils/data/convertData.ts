export const convertData = (data: string) => {
    return new Date(data).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

export const formatTimeAgo = (createdAt: any) => {
    let date: Date;

    // Handle Firestore timestamp
    if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
    } else {
        return 'Unknown time';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};