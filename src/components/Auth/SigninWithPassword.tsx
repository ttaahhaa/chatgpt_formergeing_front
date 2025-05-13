"use client";
import { PasswordIcon, UserIcon } from "@/assets/icons";
import React, { useState } from "react";

// Simple InputGroup component
const InputGroup = ({
  type,
  label,
  className,
  placeholder,
  name,
  handleChange,
  value,
  icon
}: {
  type: string;
  label: string;
  className?: string;
  placeholder: string;
  name: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div className={`relative ${className}`}>
      {label && <label className="mb-2.5 block font-medium text-black dark:text-white">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={handleChange}
          className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-4 pl-[56px] text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
        />
      </div>
    </div>
  );
};

// Mock user data for local authentication
const MOCK_USERS = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" },
];

export default function SigninWithPassword() {
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Simple local authentication
    const user = MOCK_USERS.find(
      (user) => user.username === data.username && user.password === data.password
    );

    setTimeout(() => {
      setLoading(false);

      if (user) {
        // Authentication successful
        setSuccess(true);
        // Store auth state in localStorage
        localStorage.setItem("auth_user", JSON.stringify({ username: user.username }));
        // Redirect to home page
        window.location.href = "/";
      } else {
        // Authentication failed
        setError("Invalid username or password. Please try again.");
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-500/20">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-500 dark:bg-green-500/20">
          Login successful! Redirecting...
        </div>
      )}

      <InputGroup
        type="text"
        label="Username"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your username"
        name="username"
        handleChange={handleChange}
        value={data.username}
        icon={<UserIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
