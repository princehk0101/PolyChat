import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { authApi, tokenStore, normalizeApiError } from "../services/api";
import GlassCard from "../components/UI/GlassCard";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "438691191304-tb23kp3g02pfqjr7mgqdfknfg30po2oj.apps.googleusercontent.com";

const SignupContent = () => {
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await authApi.register(form);
      setMessage("Signup Successful");
      navigate("/login");
    } catch (error) {
      setMessage(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setMessage("Google ID token not received.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.googleLogin({
        token: credentialResponse.credential,
      });
      tokenStore.setTokens(res.data);
      await refreshCurrentUser();
      navigate("/chat");
    } catch (err) {
      setMessage(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-900 to-base-950">
      <GlassCard className="max-w-md w-full">
        <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-ink-950">Create Account</h1>
        <p className="text-ink-600 mt-2">
          Join the workspace to start collaborating.
        </p>

        {message && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              message.includes("Successful")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-ink-200 flex-1" />
          <span className="text-xs text-ink-400 font-medium">OR</span>
          <div className="h-px bg-ink-200 flex-1" />
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-ink-200 bg-white">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google Signup Failed")}
            theme="outline"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center text-sm text-ink-600">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-700 font-semibold hover:text-accent-600">
            Sign in
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

const Signup = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <SignupContent />
  </GoogleOAuthProvider>
);

export default Signup;
