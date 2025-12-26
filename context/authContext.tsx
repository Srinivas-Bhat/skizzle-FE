import { login, register } from "@/services/authServices";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";


export const AuthContext = createContext<AuthContextProps> ({
    token: null, 
    user: null, 
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    updateToken: async () => {},
});


export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [token, setToken] = useState<string | null >(null);
    const [user, setUser] = useState<UserProps | null >(null);
    const router = useRouter();

    const loadToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        if(storedToken) {
            try {
                const decoded = jwtDecode<DecodedTokenProps>(storedToken);
                if(decoded.exp && decoded.exp < Date.now() / 1000){
                    // token has expired , navigation to welcome page 
                    await AsyncStorage.removeItem("token");
                    gotoWelcomePage();
                    return ;
                }

                // user logged in and token is valid 
                setToken(storedToken);
                
                // connection to socket 
                await connectSocket();
                setUser(decoded.user);

                gotoHomePage();
            }
            catch(error) {
                gotoWelcomePage();
                console.log("failed to decode token: ", error);
            }
        } else {
            gotoWelcomePage();
        }
    }

    const gotoHomePage = () => {
        setTimeout(() => {
            router.replace("/(main)/home")
        }, 1500)
    }

    const gotoWelcomePage = () => {
        setTimeout(() => {
            router.replace("/(auth)/welcome")
        }, 1500)
    }

    const updateToken = async(token: string) => {
        if(token) {
            setToken(token);
            await AsyncStorage.setItem("token", token);

            //decode token (user)
            const decoded = jwtDecode<DecodedTokenProps>(token);
            console.log("decoded token", decoded);
            setUser(decoded.user);

        }
    }

    const signIn = async(email: string, password: string) => {
        const response = await login(email, password);
        console.log("response", response);
        
        await updateToken(response.token);
        console.log("response token updated", response.token);
        // socket connection 
        await connectSocket();
        console.log("connection ", response.token);

        router.replace("/(main)/home")

    }

    const signUp = async(name: string, email: string, password: string, avatar?: string | null) => {
        const response = await register(name, email, password, avatar);
        await updateToken(response.token);

        // socket connection 
        await connectSocket();
        router.replace("/(main)/home")
    }

    const signOut = async() => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem("token");

        // socket dis-connection 
        disconnectSocket();

        router.replace("/(auth)/welcome");
    }

    useEffect(() => {
        loadToken();
    }, [])


    return (
        <AuthContext.Provider value={{token, user, signIn, signUp, signOut, updateToken}}
        >
            {children}
        </AuthContext.Provider>
    )


};


export const useAuth = () => useContext(AuthContext);