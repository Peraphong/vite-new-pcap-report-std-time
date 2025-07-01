
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
          marginTop: 10,
          padding: { xs: 1, md: 3 },
          minHeight: 'calc(100vh - 64px)',
          background: '#f4f6fa',
        }}
      >
        <Box
          sx={{
            background: '#fff',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(243, 238, 238, 0.07)',
            padding: { xs: 2, md: 4 },
            width: '100vw',
            maxWidth: '100vw',
            margin: '32px 0 0 0',
            minHeight: 700,
            overflow: 'auto',
          }}
        >
          {/* <h2 style={{ marginBottom: 24, color: '#0057b7', fontWeight: 700 }}>
            Standard Time: Various Types of Graphs
          </h2> */}

          {/* ตัวอย่างหน้าค้นหา */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            maxWidth: 1200,
            margin: '0 auto 32px auto',
            boxShadow: '0 1px 6px rgba(247, 237, 237, 0.07)'
          }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <input type="text" placeholder="Product Name" style={{ padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', minWidth: 180, background: '#fff', color: '#222' }} />
              <input type="text" placeholder="Process" style={{ padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', minWidth: 180, background: '#fff', color: '#222' }} />
              <select style={{ padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', minWidth: 120, background: '#fff', color: '#222' }}>
                <option>All Factory</option>
                <option>Factory 1</option>
                <option>Factory 2</option>
              </select>
              <button style={{
                background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 1px 4px rgba(25,118,210,0.10)'
              }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99a1 1 0 0 0 1.41-1.41l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"></path></svg>
                Search
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
              justifyItems: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '100vw',
              margin: '0',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: '98%', maxWidth: 900, height: 400, background: '#f9f9f9', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(25,118,210,0.07)', boxSizing: 'border-box' }}>
              {barData && <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            <div style={{ width: '98%', maxWidth: 900, height: 400, background: '#f9f9f9', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(67,160,71,0.07)', boxSizing: 'border-box' }}>
              {lineData && <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            <div style={{ width: '98%', maxWidth: 900, height: 400, background: '#f9f9f9', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(255,160,0,0.07)', boxSizing: 'border-box' }}>
              {pieData && <Pie data={pieData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
            <div style={{ width: '98%', maxWidth: 900, height: 400, background: '#f9f9f9', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(123,31,162,0.07)', boxSizing: 'border-box' }}>
              {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />}
            </div>
          </div>
        </Box>
      </Box>
    </>
  );
}
