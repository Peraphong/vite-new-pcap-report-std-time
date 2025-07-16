import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';

const menuItems = [
  {
    title: 'Standard Time Similar Structure',
    description: 'Compare and analyze standard times by product and process.',
    path: '/standard_time_similar_structure',
    icon: '/StandardTimeSimilarStructure.png',
  },
  {
    title: 'Standard Time Report By Product',
    description: 'View standard time reports by product.',
    path: '/Standard_Time_Report_By_Product',
    icon: '/StandardTimeReportByProduct.png',
  },
  {
    title: 'Various Types of Graphs',
    description: 'Explore various types of graphs.',
    path: '/standard_time_various_types_of_graphs',
    icon: '/Chart.png',
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-bg">
      <div className="home-banner-glass">
        <h1 className="home-title-gradient">SMART STANDARD TIME MANAGEMENT</h1>
        <p className="home-banner-desc">A standard time management system for every production process in your organization.<br/>Select a menu below to get started.</p>
      </div>
      <div className="home-menu-grid">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className="home-menu-card-glass"
            onClick={() => navigate(item.path)}
            style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
          >
            <div className="home-menu-icon-wrap">
              <img src={item.icon} alt={item.title} className="home-menu-icon-large" />
            </div>
            <div className="home-menu-info">
              <div className="home-menu-title-gradient">{item.title}</div>
              <div className="home-menu-desc">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
