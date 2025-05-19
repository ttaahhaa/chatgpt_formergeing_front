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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    const userInfo = await this.fetchUserInfo();
    console.log('User info after login:', userInfo);
  }

  async fetchUserInfo(): Promise<UserInfo> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    // Ensure permissions array exists and has default permissions based on role
    const permissions = data.permissions || [];
    if (data.role === 'admin') {
      permissions.push('admin', 'chat:stream', 'documents:upload');
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
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    this.userInfo = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
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