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
  const [menuName, setMenuName] = React.useState("Smart Waste Management");
  const [menuIcon, setMenuIcon] = React.useState(
    <img src="" alt="" width={30} />
    // <img src="/dashboard1.png" alt="" width={30} />
  );

  React.useEffect(() => {
    switch (location.pathname) {
      case "/standard_time_similar_structure":
        setMenuName("Standard Time Similar Structure");
        setMenuIcon(<img src="/purchase-order.png" alt="" width={30} />);
        setSelectedMenu("stdtime");
        break;
      case "/Standard_Time_Report_By_Product":
        setMenuName("Standard Time Report By Product.");
        setMenuIcon(<img src="/map.png" alt="" width={30} />);
        setSelectedMenu("stdtimeReport");
        break;
      case "/smartsus_sus_delivery_order":
        setMenuName("SUS Delivery Order Management");
        setMenuIcon(<img src="/sus-delivery.png" alt="" width={30} />);
        setSelectedMenu("pln");
        break;
      case "/smartsus_sus_delivery_order_new":
        setMenuName("SUS Delivery Order Management (NEW VERSION)");
        setMenuIcon(<img src="/sus-delivery.png" alt="" width={30} />);
        setSelectedMenu("pln_new");
        break;
      case "/smartsus_upload_stock_sus_final":
        setMenuName("Stock SUS plate (Final)");
        setMenuIcon(<img src="/stock-fin.png" alt="" width={30} />);
        setSelectedMenu("fin");
        break;

      // case "/smartsus_summary_sus_purchaser":
      //   setMenuName("Summary SUS Plate by Item Material (Purchaser)");
      //   setMenuIcon(<img src="/purchase-order.png" alt="" width={30} />);
      //   break;
      case "/smartsus_summary_sus_purchaser_new":
        setMenuName("Summary SUS Plate by Item Material (Purchaser)");
        setMenuIcon(<img src="/purchase-order.png" alt="" width={30} />);
        setSelectedMenu("pur");
        break;
      case "/smartSus_upload_sus_vendor_confirm":
        setMenuName("Data plan from vendor confirm");
        setMenuIcon(<img src="/supplier.png" alt="" width={30} />);
        setSelectedMenu("ven");
        break;
      case "/smartSus_details_wip":
        setMenuName("Product WIP");
        setMenuIcon(<img src="/wip.png" alt="" width={30} />);
        setSelectedMenu("wip");
        break;
      case "/smartSus_monitoring_update_table":
        setMenuName("Monitoring update data on Table");
        setMenuIcon(<img src="/update.png" alt="" width={30} />);
        setSelectedMenu("mon");
        break;
      case "/smartsus_master_use_mat_fin":
        setMenuName("Master data mapping use MAT [FIN]");
        setMenuIcon(<img src="/fin.png" alt="" width={30} />);
        setSelectedMenu("mFin");
        break;
      default:
        setMenuName("SUS Plate Management");
        setMenuIcon(<img src="/sus-plate.png" alt="" width={30} />);
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
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <img src="/purchase-order.png" alt="" width={30} />
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
                  <img src="/map.png" alt="" width={30} />
                </ListItemIcon>
                <ListItemText
                  primary="Standard Time Table"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* smartsus_master_use_mat_fin
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("Master data mapping use MAT [FIN]")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_master_use_mat_fin"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border: selectedMenu === "mFin" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "mFin" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
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
                    <img src="/fin.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Master FIN"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartsus_sus_delivery_order */}
          {/* <div className={`${getUserRoleNo === 2 || getUserRoleNo === 2 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("SUS Delivery Order Management")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_sus_delivery_order"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/sus-delivery.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="SUS Delivery order"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartsus_sus_delivery_order_new
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 2 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("SUS Delivery Order Management (NEW VERSION)")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_sus_delivery_order_new"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border: selectedMenu === "pln_new" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "pln_new" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
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
                    <img src="/sus-delivery.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="SUS Delivery (PLN)"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartsus_upload_stock_sus_final
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 2 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("Stock SUS plate (Final)")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_upload_stock_sus_final"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border: selectedMenu === "fin" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "fin" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
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
                    <img src="/stock-fin.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Stock SUS FIN"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartsus_summary_sus_purchaser */}
          {/* <div className={`${getUserRoleNo === 3 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("Summary SUS Plate by Item Material (Purchaser)")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_summary_sus_purchaser"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/purchase-order.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Summary Report (PUR)"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartsus_summary_sus_purchaser_new
          <div className={`${getUserRoleNo === 3 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("Summary SUS Plate by Item Material (Purchaser)")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartsus_summary_sus_purchaser_new"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border: selectedMenu === "pur" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "pur" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
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
                    <img src="/purchase-order.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Summary MAT (PUR)"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* smartSus_upload_sus_vendor_confirm
          <div className={`${getUserRoleNo === 3 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("Data plan from vendor confirm")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/smartSus_upload_sus_vendor_confirm"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    border: selectedMenu === "ven" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "ven" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
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
                    <img src="/supplier.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Upload VD. Confirm"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}
        </Drawer>
      </Box>
    </>
  );
}
