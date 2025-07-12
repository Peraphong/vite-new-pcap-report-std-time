
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Navbar from "../components/navbar/Navbar";
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
import { FaChartBar, FaChartLine, FaChartPie, FaDotCircle } from "react-icons/fa";
import { MdFactory } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import { HiOutlineDocumentReport } from "react-icons/hi";

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
  // Mock data for summary cards
  const [summary, setSummary] = useState({
    projects: 12,
    processes: 8,
    avgTime: 54,
    factories: 3,
  });

  // Chart data states
  const [barData, setBarData] = useState();
  const [lineData, setLineData] = useState();
  const [pieData, setPieData] = useState();
  const [doughnutData, setDoughnutData] = useState();

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
          borderRadius: 6,
          borderSkipped: false,
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
          backgroundColor: "rgba(67,160,71,0.08)",
          tension: 0.45,
          pointBackgroundColor: "#43a047",
          pointBorderColor: "#fff",
          pointRadius: 5,
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
          borderColor: "#fff",
          borderWidth: 2,
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
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    });
  }, []);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          marginLeft: { xs: 0, md: '220px' },
          marginTop: 0,
          padding: { xs: 0, md: 0 },
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #e3f0ff 0%, #f9f9f9 100%)',
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
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 16,
            boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.13)',
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
            marginBottom: 32,
            marginTop: 32,
            position: 'relative',
          }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#1976d2',
              letterSpacing: 2,
              marginBottom: 10,
              fontFamily: 'Sarabun, Segoe UI, sans-serif',
              background: 'linear-gradient(90deg,rgb(0, 0, 0) 0%,rgb(123, 157, 249) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              <HiOutlineDocumentReport style={{ fontSize: 54, marginRight: 12, verticalAlign: 'middle' }} /> Standard Time Report
            </h1>
            <span style={{
              color: '#555',
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 10,
              letterSpacing: 1,
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
          {/* Summary Cards Section */}
          <div style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 36,
            flexWrap: 'wrap',
          }}>
            <div style={{ background: 'linear-gradient(90deg,#e3f0ff 0%,#b3e5fc 100%)', borderRadius: 18, boxShadow: '0 4px 16px #e3f0ff', padding: '24px 38px', minWidth: 220, display: 'flex', alignItems: 'center', gap: 18 }}>
              <HiOutlineDocumentReport style={{ fontSize: 38, color: '#1976d2' }} />
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1976d2', marginBottom: 2 }}>{summary.projects}</div>
                <div style={{ fontSize: 18, color: '#555', fontWeight: 500 }}>Projects</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(90deg,#f9f9f9 0%,#e3f0ff 100%)', borderRadius: 18, boxShadow: '0 4px 16px #e3f0ff', padding: '24px 38px', minWidth: 220, display: 'flex', alignItems: 'center', gap: 18 }}>
              <BsFillPeopleFill style={{ fontSize: 38, color: '#43a047' }} />
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#43a047', marginBottom: 2 }}>{summary.processes}</div>
                <div style={{ fontSize: 18, color: '#555', fontWeight: 500 }}>Processes</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(90deg,#e3f0ff 0%,#f9f9f9 100%)', borderRadius: 18, boxShadow: '0 4px 16px #e3f0ff', padding: '24px 38px', minWidth: 220, display: 'flex', alignItems: 'center', gap: 18 }}>
              <FaChartLine style={{ fontSize: 38, color: '#ffa000' }} />
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffa000', marginBottom: 2 }}>{summary.avgTime} min</div>
                <div style={{ fontSize: 18, color: '#555', fontWeight: 500 }}>Avg. Standard Time</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(90deg,#e3f0ff 0%,#b3e5fc 100%)', borderRadius: 18, boxShadow: '0 4px 16px #e3f0ff', padding: '24px 38px', minWidth: 220, display: 'flex', alignItems: 'center', gap: 18 }}>
              <MdFactory style={{ fontSize: 38, color: '#7b1fa2' }} />
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#7b1fa2', marginBottom: 2 }}>{summary.factories}</div>
                <div style={{ fontSize: 18, color: '#555', fontWeight: 500 }}>Factories</div>
              </div>
            </div>
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
                  <FaChartBar style={{ fontSize: 22 }} />
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Process" style={{ padding: '16px 20px 16px 48px', borderRadius: 14, border: '2px solid #b3e5fc', minWidth: 240, background: '#fff', color: '#222', fontSize: 18, boxShadow: '0 2px 12px #e3f0ff', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }} />
                <span style={{ position: 'absolute', left: 16, top: 18, color: '#43a047' }}>
                  <FaChartLine style={{ fontSize: 22 }} />
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
          {/* Divider */}
          <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg,#e3f0ff 0%,#b3e5fc 100%)', margin: '32px 0 36px 0', borderRadius: 2, opacity: 0.7 }} />
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
              <FaChartBar style={{ color: '#1976d2', fontSize: 32, marginBottom: 8 }} />
              <h3 style={{ color: '#1976d2', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1 }}>Bar Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบแท่ง</span>
              {barData && <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true, backgroundColor: '#1976d2', titleColor: '#fff', bodyColor: '#fff' } }, animation: { duration: 1200 } }} />}
            </div>
            {/* Line Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(67,160,71,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(67,160,71,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #43a047', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FaChartLine style={{ color: '#43a047', fontSize: 32, marginBottom: 8 }} />
              <h3 style={{ color: '#43a047', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1 }}>Line Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบเส้น</span>
              {lineData && <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true, backgroundColor: '#43a047', titleColor: '#fff', bodyColor: '#fff' } }, animation: { duration: 1200 } }} />}
            </div>
            {/* Pie Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(255,160,0,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(255,160,0,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #ffa000', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FaChartPie style={{ color: '#ffa000', fontSize: 32, marginBottom: 8 }} />
              <h3 style={{ color: '#ffa000', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1 }}>Pie Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบวงกลม</span>
              {pieData && <Pie data={pieData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true, backgroundColor: '#ffa000', titleColor: '#fff', bodyColor: '#fff' } }, animation: { duration: 1200 } }} />}
            </div>
            {/* Doughnut Graph */}
            <div style={{ position: 'relative', width: '98%', maxWidth: 900, height: 440, background: 'rgba(123,31,162,0.09)', borderRadius: 32, padding: 44, boxShadow: '0 8px 32px rgba(123,31,162,0.13)', boxSizing: 'border-box', transition: 'box-shadow 0.2s', border: '2.5px solid #7b1fa2', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FaDotCircle style={{ color: '#7b1fa2', fontSize: 32, marginBottom: 8 }} />
              <h3 style={{ color: '#7b1fa2', fontWeight: 900, fontSize: 26, marginBottom: 16, letterSpacing: 1 }}>Doughnut Chart</h3>
              <span style={{ color: '#555', fontSize: 17, marginBottom: 22, display: 'block', fontWeight: 500 }}>แสดงข้อมูลในรูปแบบโดนัท</span>
              {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true, backgroundColor: '#7b1fa2', titleColor: '#fff', bodyColor: '#fff' } }, animation: { duration: 1200 } }} />}
            </div>
          </div>
        </Box>
      </Box>
    </>
  );
}
