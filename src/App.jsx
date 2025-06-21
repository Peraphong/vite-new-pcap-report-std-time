import * as React from "react"; // นำเข้าโมดูลทั้งหมดที่ต้องการจาก React, ให้เราสามารถใช้งานฟีเจอร์ต่างๆ ของ React
import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/auth/ProtectedRoutes";

import Login from "./pages/Login";
import Navbar from "./components/navbar/Navbar";
// import SmartSus_sus_delivery_order from "./pages/SmartSus_sus_delivery_order";
// import SmartSus_sus_delivery_order_new from "./pages/SmartSus_sus_delivery_order_new";

import StandardTimeSimilarStructure from './pages/Standard_time_Similar_structure';
import StandardTimeReportByProduct from "./pages/Standard_Time_Report_By_Product";

export default function App() {
  
  return (
    
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/home" element={<Navbar />} />
              {/* <Route path="/smartsus_sus_delivery_order" element={<SmartSus_sus_delivery_order />}/> */}
              {/* <Route path="/smartsus_sus_delivery_order_new" element={<SmartSus_sus_delivery_order_new />}/> */}
              <Route path="/standard_time_similar_structure" element={<StandardTimeSimilarStructure />} />
         
              <Route path="/Standard_Time_Report_By_Product" element={<StandardTimeReportByProduct />} />
            </Route>
        </Routes>
  );
}
