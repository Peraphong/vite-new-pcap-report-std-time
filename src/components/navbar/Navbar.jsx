import * as React from "react"; // นำเข้าโมดูลทั้งหมดที่ต้องการจาก React, ให้เราสามารถใช้งานฟีเจอร์ต่างๆ ของ React
import { styled, useTheme } from "@mui/material/styles"; // นำเข้าโมดูล "styled" และ "useTheme" จาก "@mui/material/styles" สำหรับการใช้งาน Styled Components และเข้าถึง Theme จาก Material-UI
import Box from "@mui/material/Box"; // นำเข้า Box จาก "@mui/material/Box" ซึ่งเป็นคอมโพเนนต์ที่ให้ความสะดวกในการจัดการ layout และ spacing
import MuiDrawer from "@mui/material/Drawer"; // นำเข้า Drawer จาก "@mui/material/Drawer" ซึ่งเป็นคอมโพเนนต์ที่เปิดเมนูแบบเลื่อนได้จากข้าง
import MuiAppBar from "@mui/material/AppBar"; // นำเข้า AppBar จาก "@mui/material/AppBar" ซึ่งเป็นคอมโพเนนต์สำหรับส่วนหัวของหน้าเว็บ
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Fuji from "/Fuji.png";
import { Link } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import StandardTimeSimilarStructure from "../../pages/Standard_time_Similar_structure";

//*mui icon ******************************************************
import ComputerIcon from "@mui/icons-material/Computer";
import CableIcon from "@mui/icons-material/Cable";
import StayPrimaryPortraitIcon from "@mui/icons-material/StayPrimaryPortrait";
import MemoryIcon from "@mui/icons-material/Memory";
import DomainIcon from "@mui/icons-material/Domain";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import AccountMenu from "./AccountMenu";
//*---------------------------------------------------------------
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create(["width", "background-color", "box-shadow"], {
    easing: theme.transitions.easing.easeInOut,
    duration: 500,
  }),
  overflowX: "hidden",
  willChange: "width, background-color, box-shadow",
});

// สร้าง mixin สำหรับสไตล์ของ Drawer เมื่อถูกปิด
const closedMixin = (theme) => ({
  transition: theme.transitions.create(["width", "background-color", "box-shadow"], {
    easing: theme.transitions.easing.easeInOut,
    duration: 500,
  }),
  overflowX: "hidden",
  willChange: "width, background-color, box-shadow",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      transition: theme.transitions.create(["width", "background-color", "box-shadow"], {
        easing: theme.transitions.easing.easeInOut,
        duration: 500,
      }),
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      transition: theme.transitions.create(["width", "background-color", "box-shadow"], {
        easing: theme.transitions.easing.easeInOut,
        duration: 500,
      }),
    },
  }),
}));

export default function Navbar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const showBrandText = open;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  //bind value user from localstorage
  const userString = localStorage.getItem("userToken");
  const userObject = JSON.parse(userString);
  const userName = userObject?.user_name;
  const userSurname = userObject?.user_surname;
  // const userRole = userObject?.role_type;

  const userGuest = localStorage.getItem("guestToken");
  const userGuestObject = JSON.parse(userGuest);
  const userGuestName = userGuestObject?.user_login;
  // const userGuestRole = userGuestObject?.role_type;

  //*Menu name ******************************************************
  const [selectedMenu, setSelectedMenu] = React.useState("");
  const [menuName, setMenuName] = React.useState("SMART WASTE MANAGEMENT");

  const [menuIcon, setMenuIcon] = React.useState(
    <img src="" alt="" width={30} />
    // <img src="/dashboard1.png" alt="" width={30} />
  );

  React.useEffect(() => {
    switch (location.pathname) {
      case "/standard_time_similar_structure":
        setMenuName("STANDARD TIME SIMILAR STRUCTURE");
        setMenuIcon(
          <img
            src="/StandardTimeSimilarStructure.png"
            alt=""
            width={35}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.83) ",
              border: "0.5px solid  #fff",
              borderRadius: "80%",
              padding: "0px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        );
        setSelectedMenu("stdtime");
        break;
      case "/Standard_Time_Report_By_Product":
        setMenuName("STANDARD TIME REPORT BY PRODUCT");
        setMenuIcon(
          <img
            src="/StandardTimeReportByProduct.png"
            alt=""
            width={35}
            style={{
               backgroundColor: "rgba(255, 255, 255, 0.85)",
              border: "0.5px solid  #fff",
              borderRadius: "80%",
              padding: "0px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        );
        setSelectedMenu("stdtimeReport");
        break;
      case "/standard_time_various_types_of_graphs":
        setMenuName("Standard Time Various Types of Graphs");
        setMenuIcon(
          <img
            src="/Chart.png"
            alt=""
            width={30}
            style={{
              border: "1.5px solid  #fff",
              borderRadius: "80%",
              padding: "0px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        );
        setSelectedMenu("stdtimeGraphs");
        break;
      case "/home":
        setMenuName("SMART STANDARD TIME MANAGEMENT");
        setMenuIcon(
          <img
            src="/home.png"
            alt=""
            width={30}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        );
        setSelectedMenu("home");
        break;
    }
  }, [location.pathname]);

  const getUserDataString = localStorage.getItem("userToken"); // Retrieve the string
  const getUserData = JSON.parse(getUserDataString); // Parse the string to an object
  const getUserRoleNo = getUserData.role_no; // Access the property
  // console.log(getUserRoleNo); // Output the value

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* HEADER MUI APPBAR */}

        <AppBar position="fixed" open={open}>
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between" }} // Add this
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {" "}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 5,
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  gap: 2,
                }}
              >
                {menuIcon}
                {menuName}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="p" sx={{ mr: 1, fontWeight: "Bold" }}>
                {userName && userSurname
                  ? `${userName} ${userSurname}`
                  : userGuestName}
              </Typography>

              <AccountMenu />

              {/* If you have other elements, you can continue adding them here */}
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <Link to="/home">
              <img
                src={Fuji}
                alt="คำอธิบายภาพ"
                style={{
                  width: 180, // กำหนดความกว้างของภาพให้เต็มขนาดของพื้นที่ที่รองรับ
                  height: 45, // กำหนดความสูงของภาพให้ปรับแต่งตามอัตราส่วนต้นฉบับ
                }}
              />
            </Link>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />

          {/* //*Similar ****************************************************** */}
          <div
            className={`${
              getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"
            }`}
          ></div>
          <List sx={{ width: '100%', mt: 2, p: 0 }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedMenu === "stdtime"}
                onClick={() => {
                  setMenuName("STANDARD TIME SIMILAR STRUCTURE");
                  setSelectedMenu("stdtime");
                }}
                component={Link}
                to="/standard_time_similar_structure"
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  px: 1.7,
                  py: 1.2,
                  boxShadow: selectedMenu === "stdtime" ? '0 2px 12px rgba(25,118,210,0.10)' : 'none',
                  background: selectedMenu === "stdtime" ? 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)' : 'transparent',
                  color: selectedMenu === "stdtime" ? '#1976d2' : '#1976d2',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  overflow: 'hidden',
                  transition: 'width 0.3s cubic-bezier(.4,0,.2,1), background 0.2s',
                  width: '100%',
                  maxWidth: 220,
                  '&:hover': {
                    background: 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)',
                    maxWidth: 340,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/StandardTimeSimilarStructure.png" alt="" width={26} style={{ verticalAlign: 'middle' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Tooltip title="Standard Time Table" placement="right" arrow enterDelay={300}>
                      <span style={{
                        fontSize: 16,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                      }}>
                        Standard Time Table
                      </span>
                    </Tooltip>
                  }
                  sx={{ ml: 0.5 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedMenu === "stdtimeReport"}
                onClick={() => {
                  setMenuName("STANDARD TIME REPORT BY PRODUCT");
                  setSelectedMenu("stdtimeReport");
                }}
                component={Link}
                to="/Standard_Time_Report_By_Product"
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  px: 1.7,
                  py: 1.2,
                  boxShadow: selectedMenu === "stdtimeReport" ? '0 2px 12px rgba(25,118,210,0.10)' : 'none',
                  background: selectedMenu === "stdtimeReport" ? 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)' : 'transparent',
                  color: selectedMenu === "stdtimeReport" ? '#1976d2' : '#1976d2',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  overflow: 'hidden',
                  transition: 'width 0.3s cubic-bezier(.4,0,.2,1), background 0.2s',
                  width: '100%',
                  maxWidth: 220,
                  '&:hover': {
                    background: 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)',
                    maxWidth: 340,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/StandardTimeReportByProduct.png" alt="" width={26} style={{ verticalAlign: 'middle' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Tooltip title="Standard Time Report By Product" placement="right" arrow enterDelay={300}>
                      <span style={{
                        fontSize: 16,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                      }}>
                        Standard Time Report By Product
                      </span>
                    </Tooltip>
                  }
                  sx={{ ml: 0.5 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedMenu === "stdtimeGraphs"}
                onClick={() => {
                  setMenuName("Standard Time Various Types of Graphs");
                  setSelectedMenu("stdtimeGraphs");
                }}
                component={Link}
                to="/standard_time_various_types_of_graphs"
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  px: 1.7,
                  py: 1.2,
                  boxShadow: selectedMenu === "stdtimeGraphs" ? '0 2px 12px rgba(25,118,210,0.10)' : 'none',
                  background: selectedMenu === "stdtimeGraphs" ? 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)' : 'transparent',
                  color: selectedMenu === "stdtimeGraphs" ? '#1976d2' : '#1976d2',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  overflow: 'hidden',
                  transition: 'width 0.3s cubic-bezier(.4,0,.2,1), background 0.2s',
                  width: '100%',
                  maxWidth: 220,
                  '&:hover': {
                    background: 'linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%)',
                    maxWidth: 340,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/Chart.png" alt="" width={26} style={{ verticalAlign: 'middle' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Tooltip title="Standard Time Various Graphs" placement="right" arrow enterDelay={300}>
                      <span style={{
                        fontSize: 16,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                      }}>
                        Standard Time Various Graphs
                      </span>
                    </Tooltip>
                  }
                  sx={{ ml: 0.5 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', py: 2, px: 2, textAlign: 'center', bgcolor: 'transparent' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Divider sx={{ width: '100%', mb: 1, borderColor: '#bfbcbcff', borderBottomWidth: 0.5, opacity: 1.80 }} />
              <img src={Fuji} alt="Fuji Logo" style={{ width: 60, marginBottom: 10 }} />
              <Box
                sx={{
                  height: showBrandText ? 32 : 0,
                  overflow: 'hidden',
                  transition: 'height 0.8s cubic-bezier(.25,0,.25,1)',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: 0.2,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: 180,
                    margin: '0 auto',
                    display: 'block',
                    textAlign: 'center',
                    opacity: showBrandText ? 1 : 0,
                    transition: 'opacity 0.8s cubic-bezier(.25,0,.25,1)',
                  }}
                >
                  Fujikura Electronic Components (Thailand) Ltd.
                </Typography>
              </Box>
            </Box>
          </Box>

        </Drawer>
      </Box>
    </>
  );
}
