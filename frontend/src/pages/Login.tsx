import { useState } from "react";
import { loginUser } from "../services/api";

export default function Login({ setUser, setPage }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      setUser(user);
    } catch (error) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your Vi-Notes account</p>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary btn-submit" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-footer">
          <p>Don't have an account? 
            <button 
              className="link-btn" 
              onClick={() => setPage("register")}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}