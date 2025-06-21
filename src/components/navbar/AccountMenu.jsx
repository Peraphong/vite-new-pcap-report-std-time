import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export default function AccountMenu() {
  const userString = localStorage.getItem("userToken");
  const userObject = JSON.parse(userString);
  const userName = userObject?.user_name;
  const userRole = userObject?.role_type;

  const userGuest = localStorage.getItem("guestToken");
  const userGuestObject = JSON.parse(userGuest);
  const userGuestRole = userGuestObject?.role_type;

  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform the logout action here, e.g., clearing authentication tokens, redirecting to a login page, etc.
        Swal.fire("Logged out!", "You have been logged out.", "success");
        navigate("/login");
        // console.log("User logged out");
        localStorage.removeItem("user");
        localStorage.clear();
      }
    });
  };

  //*Display user role*//
  const handleRole = () => {
    Swal.fire({
      icon: "info",
      title: `Your role is : ${userRole ? userRole : userGuestRole}`,
    });
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Account">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              alt={userName ? `${userName}` : ""}
              // src="/broken-image.jpg"
            />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          style: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            marginTop: "1.5rem",
            "& .MuiAvatarRoot": {
              width: 32,
              height: 32,
              marginLeft: "-0.5rem",
              marginRight: "1rem",
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              backgroundColor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        // PaperProps={{
        //   disablePadding: true,
        //   style: {
        //     overflow: "visible",
        //     filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
        //     mt: 1.5,
        //     "& .MuiAvatar-root": {
        //       width: 32,
        //       height: 32,
        //       ml: -0.5,
        //       mr: 1,
        //     },
        //     "&:before": {
        //       content: '""',
        //       display: "block",
        //       position: "absolute",
        //       top: 0,
        //       right: 14,
        //       width: 10,
        //       height: 10,
        //       bgcolor: "background.paper",
        //       transform: "translateY(-50%) rotate(45deg)",
        //       zIndex: 0,
        //     },
        //   },
        // }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleRole}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {userRole ? userRole : userGuestRole}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            handleLogout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
