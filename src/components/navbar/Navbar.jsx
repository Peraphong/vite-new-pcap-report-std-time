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
} from "@mui/material";

import AccountMenu from "./AccountMenu";
//*---------------------------------------------------------------
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// สร้าง mixin สำหรับสไตล์ของ Drawer เมื่อถูกปิด
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
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
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navbar({ onToggle }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
    onToggle(true); // Notify parent component
  };

  const handleDrawerClose = () => {
    setOpen(false);
    onToggle(false); // Notify parent component
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
            width={30}
            style={{
              backgroundColor: "rgb(252, 252, 252)",
              border: "1.5px solid  #fff",
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
            width={30}
            style={{
               backgroundColor: "rgb(252, 252, 252)",
              border: "1.5px solid  #fff",
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
            src="/analysis.png"
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
        setSelectedMenu("stdtimeGraphs");
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

          {/* //*Menu list ****************************************************** */}
          {/* smartSus_monitoring_update_table */}
          {/* <div
            className={`${
              getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"
            }`}
          > */}
          {/* <List open={open}>
              <ListItem
                onClick={() => setMenuName("Monitoring update data on Table")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartSus_monitoring_update_table"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border:
                      selectedMenu === "mon" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor:
                      selectedMenu === "mon" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                    marginTop: -0.6, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/update.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monitor Table"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* //*Similar ****************************************************** */}
          <div
            className={`${
              getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"
            }`}
          ></div>
          <List open={open}>
            <ListItem
              onClick={() => {
                setMenuName("Standard Time Similar Structure");
                setSelectedMenu("stdtime");
              }}
              disablePadding
              sx={{ display: "block", color: "black" }}
              component={Link}
              to="/standard_time_similar_structure"
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  border:
                    selectedMenu === "stdtime" ? "2px solid #1976d2" : "none",
                  backgroundColor:
                    selectedMenu === "stdtime" ? "#E3F2FD" : "transparent",
                  borderRadius: "8px",
                  marginBottom: -1,
                  display: "flex",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 1.3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/StandardTimeSimilarStructure.png"
                    alt=""
                    width={30}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Standard Time Table"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* //*Report By Product ****************************************************** */}
          <div
            className={`${
              getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"
            }`}
          ></div>
          <List open={open}>
            <ListItem
              onClick={() => {
                setMenuName("Standard Time Report By Product.");
                setSelectedMenu("stdtimeReport");
              }}
              component={Link}
              to="/Standard_Time_Report_By_Product"
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  minWidth: 58,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  border:
                    selectedMenu === "stdtimeReport"
                      ? "2px solid #1976d2"
                      : "none",
                  Width: 10000,

                  backgroundColor:
                    selectedMenu === "stdtimeReport"
                      ? "#E3F2FD"
                      : "transparent",
                  borderRadius: "8px",
                  marginBottom: -1,
                  display: "flex",
                  ml: -1.7, // Adjust margin-left to align with other items
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 1 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/StandardTimeReportByProduct.png"
                    alt=""
                    width={30}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Standard Time Report By Product"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Various Types of Graphs */}
          <List open={open}>
            <ListItem
              onClick={() => {
                setMenuName("Standard Time Various Types of Graphs");
                setSelectedMenu("stdtimeGraphs");
              }}
              disablePadding
              sx={{ display: "block", color: "black" }}
              component={Link}
              to="/standard_time_various_types_of_graphs"
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  border:
                    selectedMenu === "stdtimeGraphs"
                      ? "2px solid #1976d2"
                      : "none",
                  backgroundColor:
                    selectedMenu === "stdtimeGraphs"
                      ? "#E3F2FD"
                      : "transparent",
                  borderRadius: "8px",
                  marginBottom: -1,
                  display: "flex",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <img src="/analysis.png" alt="" width={30} />
                </ListItemIcon>
                <ListItemText
                  primary="Standard Time Various Graphs"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </>
  );
}
