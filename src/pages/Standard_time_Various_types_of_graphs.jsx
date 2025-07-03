
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
          background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)',
        }}
      >
        <Box
          sx={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 5,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
            padding: { xs: 2, md: 6 },
            width: '100vw',
            maxWidth: '100vw',
            margin: '0 auto',
            minHeight: 800,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
            marginTop: 24,
          }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 800,
              color: '#1976d2',
              letterSpacing: 1,
              marginBottom: 8,
              textShadow: '0 2px 8px #e3f0ff',
            }}>
              Standard Time Report
            </h1>
            <span style={{
              color: '#555',
              fontSize: 18,
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              รวมกราฟแสดงผลข้อมูล Standard Time หลายรูปแบบ
            </span>
          </div>
          {/* Search Section */}
          <div style={{
            background: 'linear-gradient(90deg, #e3f0ff 0%, #f9f9f9 100%)',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 32,
            marginBottom: 40, 
            maxWidth: 2000,
            
            marginTop: 0,
            marginRight: 'auto',
            // marginBottom: 40,
            marginLeft: 'auto',
            boxShadow: '0 4px 24px rgba(25,118,210,0.08)',
            display: 'flex',
            flexDirection: 'column',
            // alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Product Name" style={{ padding: '12px 16px 12px 40px', borderRadius: 10, border: '1.5px solid #bdbdbd', minWidth: 200, background: '#fff', color: '#222', fontSize: 16, boxShadow: '0 2px 8px #e3f0ff' }} />
                <span style={{ position: 'absolute', left: 12, top: 12, color: '#1976d2' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#1976d2" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path></svg>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Process" style={{ padding: '12px 16px 12px 40px', borderRadius: 10, border: '1.5px solid #bdbdbd', minWidth: 200, background: '#fff', color: '#222', fontSize: 16, boxShadow: '0 2px 8px #e3f0ff' }} />
                <span style={{ position: 'absolute', left: 12, top: 12, color: '#43a047' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#43a047" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path></svg>
                </span>
              </div>
              <select style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #bdbdbd', minWidth: 160, background: '#fff', color: '#1976d2', fontSize: 16, fontWeight: 600, boxShadow: '0 2px 8px #e3f0ff' }}>
                <option>All Factory</option>
                <option>Factory 1</option>
                <option>Factory 2</option>
              </select>
              <button style={{
                background: 'linear-gradient(90deg, #1976d2 60%,rgb(76, 187, 231) 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 2px 12px rgba(25,118,210,0.15)', transition: 'background 0.2s',
              }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99a1 1 0 0 0 1.41-1.41l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"></path></svg>
                Search
              </button>
            </div>
          </div>
          {/* Graphs Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              justifyItems: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: 1800,
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Bar Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 420, background: 'rgba(25,118,210,0.07)', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(25,118,210,0.10)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '1.5px solid #1976d2', overflow: 'hidden' }}>
              <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: 22, marginBottom: 12, letterSpacing: 0.5 }}>Bar Chart</h3>
              <span style={{ color: '#555', fontSize: 15, marginBottom: 18, display: 'block' }}>แสดงข้อมูลในรูปแบบแท่ง</span>
              {barData && <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            {/* Line Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 420, background: 'rgba(67,160,71,0.07)', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(67,160,71,0.10)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '1.5px solid #43a047', overflow: 'hidden' }}>
              <h3 style={{ color: '#43a047', fontWeight: 700, fontSize: 22, marginBottom: 12, letterSpacing: 0.5 }}>Line Chart</h3>
              <span style={{ color: '#555', fontSize: 15, marginBottom: 18, display: 'block' }}>แสดงข้อมูลในรูปแบบเส้น</span>
              {lineData && <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            {/* Pie Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 420, background: 'rgba(255,160,0,0.07)', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(255,160,0,0.10)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '1.5px solid #ffa000', overflow: 'hidden' }}>
              <h3 style={{ color: '#ffa000', fontWeight: 700, fontSize: 22, marginBottom: 12, letterSpacing: 0.5 }}>Pie Chart</h3>
              <span style={{ color: '#555', fontSize: 15, marginBottom: 18, display: 'block' }}>แสดงข้อมูลในรูปแบบวงกลม</span>
              {pieData && <Pie data={pieData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            {/* Doughnut Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 420, background: 'rgba(123,31,162,0.07)', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(123,31,162,0.10)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '1.5px solid #7b1fa2', overflow: 'hidden' }}>
              <h3 style={{ color: '#7b1fa2', fontWeight: 700, fontSize: 22, marginBottom: 12, letterSpacing: 0.5 }}>Doughnut Chart</h3>
              <span style={{ color: '#555', fontSize: 15, marginBottom: 18, display: 'block' }}>แสดงข้อมูลในรูปแบบโดนัท</span>
              {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
          </div>
        </Box>
      </Box>
    </>
  );
}
