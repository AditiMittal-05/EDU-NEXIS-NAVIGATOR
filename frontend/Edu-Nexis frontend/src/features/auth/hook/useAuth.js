import { useDispatch } from "react-redux"
import { register } from "../service/auth.api.js"
import { setUser } from "../state/auth.slice.js"

export const useAuth = () => {
    const dispatch = useDispatch()
    async function handleRegister({username, email, password}) {
        const data = await register({username, email, password})
        dispatch(setUser(data.user))
    }

    const handleLogout = () => {
        dispatch(setUser(null))
    }

    return {
        handleRegister,
        handleLogout,
        setUser: (user) => dispatch(setUser(user))
    }
}