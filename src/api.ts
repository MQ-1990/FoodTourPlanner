const API_URL = "http://localhost:5000";

export async function testBackend() {
    const res = await fetch(`${API_URL}/api/test`);
    return res.json();
}

export interface AuthResponse {
    message: string;
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: string;
    };
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
}

export async function signupApi(
    email: string,
    username: string,
    password: string
): Promise<AuthResponse | { message: string }> {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
    }

    return data;
}