import React, { useState } from "react";
import { Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginLogo from "../assets/Fujikura-Logo.png";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Swal from "sweetalert2";
import axios from "axios";
import "./styles/Login.css";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const userDatabase = `http://10.17.100.115:3001/api/smart_pcap/filter-user-login-smart-pcap?user_login=${userLogin}`;

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);

    axios
      .get(userDatabase)
      .then((response) => {
        const data = response.data;
        if (
          data[0]?.user_login === userLogin &&
          data[0]?.user_password === password &&
          data[0]?.system_no === 10
        ) {
          localStorage.setItem("userToken", JSON.stringify(data[0]));
          Swal.fire({
            icon: "success",
            title: "Login Success",
            text: "Welcome to SUS Plate Management",
          });
          navigate("/home");
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Please check your username or password or permission",
          });
        }
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "User does not exist",
          text: "Please check your username or password or permission",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src={LoginLogo} alt="Fujikura Logo" className="Fujikura-Logo" />
        {/* <div className="login-title">NEW PCAP SYSTEM REPORT</div> */}
        <div className="login-subtitle"> NEW PCAP SYSTEM REPORT</div>
        <form onSubmit={handleLogin}>
          <TextField
            placeholder="Username"
            variant="outlined"
            margin="normal"
            value={userLogin}
            onChange={(e) => setUserLogin(e.target.value)}
            autoComplete="username"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#0d47a1" }} />
                </InputAdornment>
              ),
              sx: {
                color: "#0d47a1",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0d47a1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1976d2",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#42a5f5",
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: "#0d47a1",
                "&.Mui-focused": {
                  color: "#42a5f5",
                },
              },
            }}
          />
          <TextField
            placeholder="Password"
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#0d47a1" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ color: "#0d47a1" }} />
                    ) : (
                      <Visibility sx={{ color: "#0d47a1" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: "#0d47a1",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0d47a1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1976d2",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#42a5f5",
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: "#0d47a1",
                "&.Mui-focused": {
                  color: "#42a5f5",
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 1 }}
            disabled={loading}
            className="login-btn"
          >
            Login <LockOpenOutlinedIcon sx={{ ml: 1 }} />
          </Button>
        </form>
      </div>
      <svg
        className="login-wave"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#d0eaff"
          fillOpacity="1"
          d="M0,224 C360,320 1080,120 1440,224 L1440,320 L0,320 Z"
        />
        <path
          fill="#a6d8fa"
          fillOpacity="0.8"
          d="M0,256 C480,320 960,160 1440,256 L1440,320 L0,320 Z"
        />
        <path
          fill="#7cc3f7"
          fillOpacity="0.7"
          d="M0,288 C600,340 840,180 1440,288 L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}

export default Login;