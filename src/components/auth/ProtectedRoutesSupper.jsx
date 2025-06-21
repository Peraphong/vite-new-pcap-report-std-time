import { Outlet, Navigate } from "react-router-dom";
import Swal from "sweetalert2";

const useAuth = () => {
  const userRole = localStorage.getItem("userToken");

  return !!userRole;
};

function ProtectedRoutesSupper() {
  let isAuth = useAuth();
  if (!isAuth) {
    Swal.fire({
      icon: "warning",
      title: "Your role is not permitted",
      text: "Please contact your administrator",
    });
    return <Navigate to="/home" />;
  }
  return <Outlet />;
}

export default ProtectedRoutesSupper;
