
import Navbar from "../components/navbar/Navbar";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

export default function StandardTimeVariousTypesOfGraphs() {
  // สุ่มข้อมูลตัวอย่าง
  // ใช้ null เป็นค่าเริ่มต้นเพื่อหลีกเลี่ยงการ render กราฟก่อนข้อมูลพร้อม
  const [barData, setBarData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [doughnutData, setDoughnutData] = useState(null);
  



  useEffect(() => {
    const labels = ["A", "B", "C", "D", "E", "F"];
    const randomArr = () => labels.map(() => Math.floor(Math.random() * 100) + 10);

    setBarData({
      labels,
      datasets: [
        {
          label: "Bar Example",
          data: randomArr(),
          backgroundColor: "#1976d2",
        },
      ],
    });
    setLineData({
      labels,
      datasets: [
        {
          label: "Line Example",
          data: randomArr(),
          borderColor: "#43a047",
          backgroundColor: "rgba(246, 252, 247, 0.2)",
          tension: 0.4,
        },
      ],
    });
    setPieData({
      labels,
      datasets: [
        {
          label: "Pie Example",
          data: randomArr(),
          backgroundColor: [
            "#1976d2",
            "#43a047",
            "#ffa000",
            "#d32f2f",
            "#7b1fa2",
            "#0288d1",
          ],
        },
      ],
    });
    setDoughnutData({
      labels,
      datasets: [
        {
          label: "Doughnut Example",
          data: randomArr(),
          backgroundColor: [
            "#1976d2",
            "#43a047",
            "#ffa000",
            "#d32f2f",
            "#7b1fa2",
            "#0288d1",
          ],
        },
      ],
    });
  }, []);

  return (
    <>
      <Navbar onToggle={() => {}} />
      <Box
        sx={{
          marginLeft: { xs: 0, md: '220px' },
          marginTop: 0,
          padding: { xs: 0, md: 0 },
          minHeight: '100vh',
          background: 'radial-gradient(circle at 60% 10%, #e3f0ff 0%, #f9f9f9 100%)',
          position: 'relative',
        }}
      >
        {/* Glassmorphism background effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          background: 'radial-gradient(circle at 80% 20%, #b3e5fc 0%, rgba(255,255,255,0.2) 80%)',
          pointerEvents: 'none',
        }} />
        <Box
          sx={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 8,
            boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.18)',
            padding: { xs: 2, md: 8 },
            width: '100vw',
            maxWidth: '100vw',
            margin: '0 auto',
            minHeight: 900,
            overflow: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          
          {/* Header Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 40,
            marginTop: 32,
            position: 'relative',
          }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#1976d2',
              letterSpacing: 2,
              marginBottom: 10,
              textShadow: '0 4px 24pxrgb(0, 0, 0), 0 2px 8px #e3f0ff',
              fontFamily: 'Sarabun, Segoe UI, sans-serif',
              background: 'linear-gradient(90deg,rgb(50, 47, 226) 0%,rgb(135, 165, 248) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Standard Time Report
            </h1>
            <span style={{
              color: '#555',
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 10,
              letterSpacing: 1,
              textShadow: '0 2px 8px #e3f0ff',
              fontFamily: 'Sarabun, Segoe UI, sans-serif',
            }}>
              รวมกราฟแสดงผลข้อมูล Standard Time หลายรูปแบบ
            </span>
            <div style={{
              position: 'absolute',
              right: 40,
              top: 0,
              opacity: 0.12,
              fontSize: 120,
              fontWeight: 900,
              color: '#1976d2',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>PCAP</div>
          </div>
          {/* Search Section */}
          <div style={{
            background: 'linear-gradient(90deg, #e3f0ff 0%, #f9f9f9 100%)',
            border: '1.5px solid #b3e5fc',
            borderRadius: 24,
            padding: 36,
            marginBottom: 48, 
            maxWidth: 1800,
            marginTop: 0,
            marginRight: 'auto',
            marginLeft: 'auto',
            boxShadow: '0 8px 32px rgba(25,118,210,0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Product Name" style={{ padding: '16px 20px 16px 48px', borderRadius: 14, border: '2px solid #b3e5fc', minWidth: 240, background: '#fff', color: '#222', fontSize: 18, boxShadow: '0 2px 12px #e3f0ff', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }} />
                <span style={{ position: 'absolute', left: 16, top: 18, color: '#1976d2' }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#1976d2" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path></svg>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Process" style={{ padding: '16px 20px 16px 48px', borderRadius: 14, border: '2px solid #b3e5fc', minWidth: 240, background: '#fff', color: '#222', fontSize: 18, boxShadow: '0 2px 12px #e3f0ff', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }} />
                <span style={{ position: 'absolute', left: 16, top: 18, color: '#43a047' }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#43a047" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path></svg>
                </span>
              </div>
              <select style={{ padding: '16px 20px', borderRadius: 14, border: '2px solid #b3e5fc', minWidth: 180, background: '#fff', color: '#1976d2', fontSize: 18, fontWeight: 700, boxShadow: '0 2px 12px #e3f0ff', outline: 'none', transition: 'border 0.2s' }}>
                <option>All Factory</option>
                <option>Factory 1</option>
                <option>Factory 2</option>
              </select>
              <button style={{
                background: 'linear-gradient(90deg,rgb(39, 137, 235) 60%,rgb(141, 191, 240) 100%)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 44px', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgb(255, 255, 255)', transition: 'background 0.2s', letterSpacing: 1,
              }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99a1 1 0 0 0 1.41-1.41l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"></path></svg>
                Search
              </button>
            </div>
          </div>
          {/* Graphs Section */}
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              justifyItems: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: 1800,
              margin: '0 auto',
              boxSizing: 'border-box',
              marginBottom: 32,
            }}
          >

            {/* Bar Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(25,118,210,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(25,118,210,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #1976d2', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ color: '#1976d2', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1, textShadow: '0 2px 8px #e3f0ff' }}>Bar Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบแท่ง</span>
              {barData && <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>

            {/* Line Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(67,160,71,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(67,160,71,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #43a047', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ color: '#43a047', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1, textShadow: '0 2px 8px #e3f0ff' }}>Line Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบเส้น</span>
              {lineData && <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>

            {/* Pie Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(255,160,0,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(255,160,0,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #ffa000', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ color: '#ffa000', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1, textShadow: '0 2px 8px #e3f0ff' }}>Pie Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบวงกลม</span>
              {pieData && <Pie data={pieData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>

            {/* Doughnut Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(123,31,162,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(123,31,162,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #7b1fa2', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ color: '#7b1fa2', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1, textShadow: '0 2px 8px #e3f0ff' }}>Doughnut Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบโดนัท</span>
              {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>

          </div>
        </Box>
      </Box>
    </>
  );
}
