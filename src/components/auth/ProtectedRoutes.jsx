import { Outlet, Navigate } from "react-router-dom";

const useAuth = () => {
  // Retrieve user_login from localStorage
  const userLogin = localStorage.getItem("userToken");
  // Retrieve guest from localStorage
  const guestLogin = localStorage.getItem("guestToken");

  // Return true if userLogin exists, false otherwise
  return !!userLogin || !!guestLogin;
};

function ProtectedRoutes() {
  let isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoutes;
