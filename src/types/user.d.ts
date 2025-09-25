interface IUser {
    id: string;
    email: string;
    fullName: string;
    role: "USER" | "ADMIN";
    avatar?: string | Blob;
    socialMedia?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        snapchat?: string;
        website?: string;
    };
}