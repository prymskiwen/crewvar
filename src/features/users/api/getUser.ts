import { api } from "../../../app/api";
import { useQuery } from "@tanstack/react-query";

const getUserById = (id: string, token: string): Promise<IUser> => {
    return api.get(`/users/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then((response) => response.data);
};

export const useGetUserQuery = (id: string, token: string) => {
    return useQuery({
        queryKey: ["users", id],
        queryFn: () => getUserById(id, token)
    });
};
