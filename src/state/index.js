import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage or use defaults
const getInitialState = () => {
    const savedUser = localStorage.getItem('adminUser');
    const savedToken = localStorage.getItem('adminToken');
    const savedMode = localStorage.getItem('adminMode') || 'dark';
    
    return {
        mode: savedMode,
        user: savedUser ? JSON.parse(savedUser) : null,
        token: savedToken,
        isLoggedIn: !!(savedUser && savedToken),
    };
};

const initialState = getInitialState();


export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === "dark" ? "light" : "dark";
            localStorage.setItem('adminMode', state.mode);
        },
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoggedIn = true;
            
            // Save to localStorage
            localStorage.setItem('adminUser', JSON.stringify(action.payload.user));
            localStorage.setItem('adminToken', action.payload.token);
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
            
            // Clear localStorage
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
        }
    }
});

export const { setMode, setLogin, setLogout } = globalSlice.actions;

export default globalSlice.reducer;