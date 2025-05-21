interface LoginCredentials {
  username: string;
  password: string;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  name: string;
  img: string;
  created_at: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private userInfo: UserInfo | null = null;

  private constructor() {
    // Initialize token from localStorage if it exists and we're in the browser
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      // Try to restore user info from localStorage
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo);
        } catch (e) {
          console.error('Failed to parse saved user info:', e);
        }
      }
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
        credentials: 'include', // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Set token immediately after receiving it
      this.setToken(data.access_token);

      // Verify the token works by fetching user info
      try {
        const userInfo = await this.fetchUserInfo();
        console.log('User info after login:', userInfo);

        // Double-check that the token is valid
        if (!this.isAuthenticated()) {
          throw new Error('Token validation failed');
        }
      } catch (error) {
        // If user info fetch fails, clear the token and throw
        this.clearToken();
        throw new Error('Failed to validate authentication');
      }
    } catch (error) {
      // Clear token if login fails
      this.clearToken();
      throw error;
    }
  }

  async fetchUserInfo(): Promise<UserInfo> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear it
        this.clearToken();
      }
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    // Ensure permissions array exists and has default permissions based on role
    const permissions = data.permissions || [];
    if (data.role === 'admin') {
      permissions.push('*'); // This single permission grants access to everything
    }

    const userInfo: UserInfo = {
      ...data,
      permissions: [...new Set(permissions)] // Remove duplicates
    };

    this.userInfo = userInfo;

    // Save user info to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    console.log('Fetched user info:', userInfo);
    return userInfo;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      // Set token in localStorage
      localStorage.setItem('token', token);

      // Set token in cookie with proper attributes
      const cookieOptions = [
        `token=${token}`,
        'path=/',
        'SameSite=Strict',
        'Secure',
        'HttpOnly'
      ].join('; ');

      document.cookie = cookieOptions;
    }
  }

  getToken(): string | null {
    // First try to get from memory
    if (this.token) return this.token;

    // Then try localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        this.token = storedToken; // Cache in memory
        return storedToken;
      }
    }
    return null;
  }

  clearToken() {
    this.token = null;
    this.userInfo = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // Clear the token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure; HttpOnly';
    }
  }

  hasPermission(permission: string): boolean {
    if (!this.userInfo) return false;
    if (this.userInfo.role === 'admin') return true;
    if (this.userInfo.permissions.includes("*")) return true;
    return this.userInfo.permissions.includes(permission);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  logout() {
    this.clearToken();
  }
}

export default AuthService; 