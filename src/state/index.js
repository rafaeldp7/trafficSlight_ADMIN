import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage or use defaults
const getInitialState = () => {
    try {
        const savedUser = localStorage.getItem('adminData') || localStorage.getItem('adminUser');
        const savedToken = localStorage.getItem('adminToken');
        const savedMode = localStorage.getItem('adminMode') || 'dark';
        
        // Validate savedUser before parsing
        let parsedUser = null;
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null' && savedUser.trim() !== '') {
            try {
                parsedUser = JSON.parse(savedUser);
            } catch (parseError) {
                console.warn('Invalid JSON in localStorage, clearing user data:', parseError);
                localStorage.removeItem('adminData');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('adminToken');
            }
        }
        
        return {
            mode: savedMode,
            user: parsedUser,
            token: savedToken && savedToken !== 'undefined' ? savedToken : null,
            isLoggedIn: !!(parsedUser && savedToken && savedToken !== 'undefined'),
        };
    } catch (error) {
        console.error('Error parsing localStorage data:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminMode');
        return {
            mode: 'dark',
            user: null,
            token: null,
            isLoggedIn: false,
        };
    }
};

// Clean up any corrupted localStorage data on app startup
const cleanupLocalStorage = () => {
    try {
        const adminData = localStorage.getItem('adminData');
        const adminUser = localStorage.getItem('adminUser');
        const adminToken = localStorage.getItem('adminToken');
        
        // Check for corrupted data
        if (adminData === 'undefined' || adminData === 'null' || adminData === '') {
            localStorage.removeItem('adminData');
        }
        if (adminUser === 'undefined' || adminUser === 'null' || adminUser === '') {
            localStorage.removeItem('adminUser');
        }
        if (adminToken === 'undefined' || adminToken === 'null' || adminToken === '') {
            localStorage.removeItem('adminToken');
        }
    } catch (error) {
        console.warn('Error cleaning up localStorage:', error);
        // Clear all auth-related data if cleanup fails
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
    }
};

// Run cleanup before getting initial state
cleanupLocalStorage();
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
            
            // Save to localStorage (use adminData to match auth service)
            localStorage.setItem('adminData', JSON.stringify(action.payload.user));
            localStorage.setItem('adminToken', action.payload.token);
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
            
            // Clear localStorage (clear both possible keys)
            localStorage.removeItem('adminData');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
        }
    }
});

export const { setMode, setLogin, setLogout } = globalSlice.actions;

export default globalSlice.reducer;