import React, { useState } from "react";
import "./Login.css";

import { loginUser, signupUser } from "../../firebase";

const Login = () => 
  {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () =>
     {
    try 
    {
      if (isLogin) 
        {
        await loginUser(email, password);
      } else {
        await signupUser(email, password, name);
      }
    } catch (err) 
    {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isLogin ? "Login" : "Sign Up"}</h1>

        
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleAuth}>
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p
          style={{ cursor: "pointer" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Create new account"
            : "Already have account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;