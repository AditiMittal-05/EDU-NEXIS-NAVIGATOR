import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true
})

export async function register({username, email, password}){
    const response = await authApiInstance.post("/auth/register", {
        username, email, password
    })
    return response.data
}