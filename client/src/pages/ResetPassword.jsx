import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { resetCode } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally, you can add a check here to verify the reset code
    // For example, make an API call to validate the reset code
  }, [resetCode]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.put(`/reset-password/${resetCode}`, {
        password
      });
      setLoading(false);
      toast.success(response.data.message);
      navigate('/login'); // Redirect to login page after successful password reset
    } catch (error) {
      setLoading(false);
      toast.error("Failed to reset password. Please try again.");
    }
  };
  

  return (
    <div>
      <h2>Reset Password</h2>
      <div>
        <label>New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button onClick={handleResetPassword} disabled={loading}>
        {loading ? "Loading..." : "Reset Password"}
      </button>
    </div>
  );
};

export default ResetPassword;
