interface LoginCredentials {
  username: string;
  password: string;
}

interface UserInfo {
  username: string;
  email: string;
  role: string;
  permissions: string[];
  name: string;
  img: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private userInfo: UserInfo | null = null;

  private constructor() {
    // Initialize token from localStorage if it exists and we're in the browser
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
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
    await this.fetchUserInfo();
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
    this.userInfo = data;
    return data;
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