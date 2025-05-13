// Authentication utility functions

/**
 * Check if the user is authenticated by checking localStorage or sessionStorage
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") {
        return false; // When running on server
    }

    // Check both localStorage and sessionStorage
    const localUser = localStorage.getItem("auth_user");
    const sessionUser = sessionStorage.getItem("auth_user");

    return Boolean(localUser || sessionUser);
};

/**
 * Get the authenticated user data
 */
export const getAuthUser = (): { username: string } | null => {
    if (typeof window === "undefined") {
        return null; // When running on server
    }

    // Try localStorage first, then sessionStorage
    const localUser = localStorage.getItem("auth_user");
    const sessionUser = sessionStorage.getItem("auth_user");

    if (localUser) {
        return JSON.parse(localUser);
    } else if (sessionUser) {
        return JSON.parse(sessionUser);
    }

    return null;
};

/**
 * Log out the user by removing auth data from storage
 */
export const logout = (): void => {
    if (typeof window === "undefined") {
        return; // When running on server
    }

    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_user");

    // Redirect to login page
    window.location.href = "/auth/signin";
}; 