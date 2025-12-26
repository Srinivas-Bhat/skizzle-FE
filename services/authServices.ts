
import { API_URL } from "@/constants";
import axios from "axios";

export const login = async(email: string, password: string): Promise<{token: string}> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email, 
            password, 
        });

        return response.data;
    }
    catch(error: any) {
        console.log("error in login service : ", error);
        const msg = error?.response?.data?.msg || "Login failed";
        throw new Error(msg);
    }
}


export const register = async(name: string, email: string, password: string, avatar?: string | null): Promise<{token: string}> => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            email, 
            password, 
            name,
            avatar
        }, {
            headers: {
                // This is the critical line for ngrok
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    }
    catch(error: any) {
        console.log("error in register service : ", error);
        if (error.response) {
            console.log("Server responded with:", error.response.status, error.response.data);
        } else {
            console.log("Error message:", error.message);
        }
        const msg = error?.response?.data?.msg || "Registration failed";
        throw new Error(msg);
    }
}