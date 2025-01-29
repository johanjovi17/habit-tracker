import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import "../../login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to log in. Check your credentials.", {
        position: "top-center",
      });
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUID = userCredential.user.uid;

      // Save user data in Firestore
      await setDoc(doc(db, "users", firebaseUID), {
        email,
        habits: [],
        totalPoints: 0,
      });

      toast.success("Account created successfully!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to create account. Try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-container-content">
        <h1>Login / Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
