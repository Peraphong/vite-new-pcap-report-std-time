// ======================= Imports =======================
import { useState, useEffect } from 'react';
import Navbar from "../components/navbar/Navbar";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Swal from 'sweetalert2';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./styles/Standard_Time_Report_By_Product.sticky.css";




// ======================= Global Styles for Fixing Button Visibility =======================
// Add CSS to fix hidden button issues
const globalStyles = `
  .swal2-popup button {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .swal2-confirm {
    opacity: 1 !important;
    visibility: visible !important;
    background-color: #3085d6 !important;
    color: white !important;
    border: none !important;
    display: inline-block !important;
  }
  
  .swal2-confirm:hover {
    opacity: 0.9 !important;
    background-color: #2370c0 !important;
  }
  
  /* Hide Cancel and No buttons */
  .swal2-cancel,
  .swal2-deny {
    display: none !important;
  }
  
  /* Fix hidden buttons on the web */
  button[aria-label] {
    opacity: 1 !important;
    visibility: visible !important;
  }
`;

// เพิ่ม styles เข้าไปใน document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

// Add custom styles for SweetAlert2 popup (glassmorphism)
const swalGlassStyles = `
  .swal2-popup {
    background: linear-gradient(120deg,rgba(255,255,255,0.92) 60%,rgba(210,230,255,0.92) 100%) !important;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 2px 12px 0 rgba(0,0,0,0.07) !important;
    border-radius: 32px !important;
    border: 2.5px solid rgba(30, 136, 229, 0.13) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    padding-top: 18px !important;
    padding-bottom: 18px !important;
    transition: box-shadow 0.3s, border 0.3s;
  }
  .swal2-title {
    margin-bottom: 0.5em !important;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('swal-glass-style')) {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.id = 'swal-glass-style';
  styleSheet.innerText = swalGlassStyles;
  document.head.appendChild(styleSheet);
}

// ======================= Styled Components =======================
const CircleButton = styled(IconButton)(({ btntype }) => ({
  borderRadius: "50%",
  width: 42,
  height: 42,
  margin: 5,
  boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.3) !important",
  background: 
    btntype === "search"
      ? "#42a5f5 !important"
      : btntype === "clear"
      ? "#ef5350 !important"
      : btntype === "excel"
      ? "#43a047 !important"
      : "#29b6f6 !important",
  display: "flex !important",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s",
  opacity: "1 !important",
  visibility: "visible !important",
  border: "2px solid rgba(255, 255, 255, 0.2) !important",
  "&:hover": {
    transform: "scale(1.12) !important",
    boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.4) !important",
    opacity: "1 !important",
  },
  "&:focus": {
    opacity: "1 !important",
    outline: "none !important",
  },
  "&:active": {
    transform: "scale(0.95) !important",
    opacity: "1 !important",
  },
}));

// Move allUnitsMock outside the component to avoid being a dependency
const allUnitsMock = [
  "BLK", "CFM", "CVC", "ELT", "FIN", "INT", "LAM", "MAS", "MOT", "OTH", "PTH", "QA", "SFT", "W/H"
];

// ======================= Main Component =======================
export default function StandardTimeReportByProduct() {
  // ---------- State ----------
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [filters, setFilters] = useState({
    factory: "ALL",
    unit: "ALL",
    groupProcess: "ALL",
    process: "ALL",
    productFrom: "ALL",
    productTo: "ALL",
    stdType: "ALL",
  });
  const [lists, setLists] = useState({
    factoryList: [{ value: "ALL", label: "ALL" }],
    unitList: [{ value: "ALL", label: "ALL" }],
    groupProcessList: [{ value: "ALL", label: "ALL" }],
    processList: [{ value: "ALL", label: "ALL" }],
    productFromList: [{ value: "ALL", label: "ALL" }],
    productToList: [{ value: "ALL", label: "ALL" }],
  });
  const [searchError, setSearchError] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Change default value to 20
  const [total, setTotal] = useState(0);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // ---------- Handlers ----------
  const handleNavbarToggle = (openStatus) => setIsNavbarOpen(openStatus);

  // Use a single function to change all filter fields
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all search fields
  const handleRefresh = () => {
    setFilters({
      factory: "ALL",
      unit: "ALL",
      groupProcess: "ALL",
      process: "ALL",
      productFrom: "ALL",
      productTo: "ALL",
      stdType: "ALL",
    });
  };

  // Reset all search fields and clear table
  const handleClearAll = () => {
    setFilters({
      factory: "ALL",
      unit: "ALL",
      groupProcess: "ALL",
      process: "ALL",
      productFrom: "ALL",
      productTo: "ALL",
      stdType: "ALL",
    });
    setTableData([]);
    setTotal(0);
  };

  // ---------- Search Handler ----------
  const handleSearch = async (goToPage = 1, goToPageSize = pageSize) => {
    const pageNum = Number(goToPage) || 1;
    const size = Number(goToPageSize) || 20;
    setPage(pageNum);
    setPageSize(size);
    const allAreAll = Object.entries(filters).every(([key, val]) => {
      if (key === 'stdType') return true;
      return val === 'ALL';
    });
    if (allAreAll) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select at least one Factory',
        confirmButtonText: 'OK'
      });
      return;
    }
    setSearchError("");
    setLoading(true);
    try {
      const params = {
        factory: filters.factory === 'ALL' ? '' : filters.factory,
        unit: filters.unit === 'ALL' ? '' : filters.unit,
        group: filters.groupProcess === 'ALL' ? '' : filters.groupProcess,
        process: filters.process === 'ALL' ? '' : filters.process,
        product_from: filters.productFrom === 'ALL' ? '' : filters.productFrom,
        product_to: filters.productTo === 'ALL' ? '' : filters.productTo,
        std_type: filters.stdType === 'ALL' ? '' : filters.stdType,
        page: pageNum,
        pageSize: size
      };
      const res = await axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-std-time-by-product-report-new", { params });
      setTableData(Array.isArray(res.data.rows) ? res.data.rows : []);
      setTotal(res.data.total || (Array.isArray(res.data.rows) ? res.data.rows.length : 0));
    } catch (err) {
      setTableData([]);
      Swal.fire({
        icon: 'error',
        title: 'An error occurred while fetching data',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatETA = (sec) => {
    if (sec <= 0) return 'Summarizing...';
    if (sec < 60) return `About ${sec} seconds left`;
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `About ${min} minute${min > 1 ? 's' : ''}${s > 0 ? ' ' + s + ' seconds' : ''} left`;
  };
  // --- handleExportExcel: export Excel ถ้าไม่เกิน 120,000 rows ---
  const handleExportExcel = async () => {
    // Load 10,000 records per page until all pages are loaded (no maximum limit)
    const params = {
      factory: filters.factory === 'ALL' ? '' : filters.factory,
      unit: filters.unit === 'ALL' ? '' : filters.unit,
      group: filters.groupProcess === 'ALL' ? '' : filters.groupProcess,
      process: filters.process === 'ALL' ? '' : filters.process,
      product_from: filters.productFrom === 'ALL' ? '' : filters.productFrom,
      product_to: filters.productTo === 'ALL' ? '' : filters.productTo,
      std_type: filters.stdType === 'ALL' ? '' : filters.stdType,
      page: 1,
      pageSize: 10000 // 10,000 ต่อ page
    };
    let allRows = [];
    let totalRows = 0;
    let maxPage = 1;
    try {
      Swal.fire({
        title: '<span style="font-size:2rem;font-weight:700;color:#1976d2;letter-spacing:1px;">Exporting...</span>',
        html: `<div style="margin:20px 0;color:#1976d2;">Loading data...</div>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => { Swal.showLoading(); }
      });
      // Load first page
      const res = await axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-std-time-by-product-report-new", { params });
      const rows = Array.isArray(res.data.rows) ? res.data.rows : [];
      totalRows = res.data.total || rows.length;
      allRows = rows;
      maxPage = Math.ceil(totalRows / params.pageSize);
      // Load data page by page
      for (let p = 2; p <= maxPage; p++) {
        const resPage = await axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-std-time-by-product-report-new", { params: { ...params, page: p } });
        const rowsPage = Array.isArray(resPage.data.rows) ? resPage.data.rows : [];
        allRows = allRows.concat(rowsPage);
        if (rowsPage.length === 0) break;
      }
      Swal.close();
      if (allRows.length === 0) {
        Swal.fire({ icon: 'info', title: 'No data to export', confirmButtonText: 'OK' });
        return;
      }
      // Export Excel
      await createExcelFile(allRows, "Standard_Time_Report.xlsx");
      Swal.fire({
        icon: 'success',
        title: 'Export successful!',
        text: `Exported ${allRows.length.toLocaleString()} rows`,
        confirmButtonText: 'OK'
      });
      return;
    } catch (err) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Export failed', text: 'An error occurred while exporting data', confirmButtonText: 'OK' });
    }
  };

  // --- Export CSV ถ้าเกิน 120,000 rows พร้อม progress bar ---
  const handleExportCSV = async () => {
    const PAGE_SIZE = 20000; // โหลดทีละ 20000 rows
    const BATCH_SIZE = 3; // โหลดพร้อมกัน 3 หน้า
    const ANIMATE_DURATION = 20000; // ms, ระยะเวลาให้เลขวิ่งถึงเป้าหมายแต่ละ batch
    const params = {
      factory: filters.factory === 'ALL' ? '' : filters.factory,
      unit: filters.unit === 'ALL' ? '' : filters.unit,
      group: filters.groupProcess === 'ALL' ? '' : filters.groupProcess,
      process: filters.process === 'ALL' ? '' : filters.process,
      product_from: filters.productFrom === 'ALL' ? '' : filters.productFrom,
      product_to: filters.productTo === 'ALL' ? '' : filters.productTo,
      std_type: filters.stdType === 'ALL' ? '' : filters.stdType,
      page: 1,
      pageSize: PAGE_SIZE
    };
    let allRows = [];
    let totalRows = 0;
    let maxPage = 1;
    let cancelled = false;
    let abortController = new AbortController();
    // สำหรับ animation แบบสมูท
    let animFrame = null;
    let animRow = 0;
    let animPercent = 0;
    let animTargetRow = 0;
    let animTargetPercent = 0;
    let animStartRow = 0;
    let animStartPercent = 0;
    let animStartTime = 0;
    let animDuration = ANIMATE_DURATION;
    function animateTo(targetRow, targetPercent, duration = ANIMATE_DURATION) {
      animStartRow = animRow;
      animStartPercent = animPercent;
      animTargetRow = targetRow;
      animTargetPercent = targetPercent;
      animStartTime = performance.now();
      animDuration = duration;
      if (animFrame) cancelAnimationFrame(animFrame);
      function step(now) {
        if (cancelled) return;
        const elapsed = Math.min(1, (now - animStartTime) / animDuration);
        // ease out cubic
        const t = 1 - Math.pow(1 - elapsed, 3);
        animRow = Math.round(animStartRow + (animTargetRow - animStartRow) * t);
        animPercent = animStartPercent + (animTargetPercent - animStartPercent) * t;
        
        // ตรวจสอบ element ก่อนการใช้งาน
        const rowCountEl = document.getElementById('swal-csv-rowcount-text');
        const progressInnerEl = document.getElementById('swal-csv-progress-inner');
        const progressTextEl = document.getElementById('swal-csv-progress-text');
        
        if (rowCountEl) rowCountEl.innerText = `Loaded ${animRow.toLocaleString()} / ${totalRows.toLocaleString()} rows`;
        if (progressInnerEl) progressInnerEl.style.width = Math.round(animPercent) + '%';
        if (progressTextEl) progressTextEl.innerText = `Progress: ${Math.round(animPercent)}%`;
        
        if (elapsed < 1 && (animRow !== animTargetRow || Math.abs(animPercent - animTargetPercent) > 0.5)) {
          animFrame = requestAnimationFrame(step);
        } else {
          animRow = animTargetRow;
          animPercent = animTargetPercent;
          if (rowCountEl) rowCountEl.innerText = `Loaded ${animRow.toLocaleString()} / ${totalRows.toLocaleString()} rows`;
          if (progressInnerEl) progressInnerEl.style.width = Math.round(animPercent) + '%';
          if (progressTextEl) progressTextEl.innerText = `Progress: ${Math.round(animPercent)}%`;
        }
      }
      animFrame = requestAnimationFrame(step);
    }
    try {
      Swal.fire({
        title: '',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:0 8px 8px 8px;">
            <div style="font-size:2.6rem;font-weight:900;color:#1565c0;letter-spacing:1.5px;text-shadow:0 2px 12px #b3b3e6,0 1px 0 #fff;margin-bottom:10px;text-align:center;width:100%;">EXPORTING CSV</div>
            <div style="display:flex;justify-content:center;align-items:center;width:100%;margin-bottom:18px;">
              <svg width="90" height="90" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 16px #b3c6f7);">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#e3e7f7" stroke-width="8"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1976d2" stroke-width="8" stroke-linecap="round" stroke-dasharray="100 100" stroke-dashoffset="60">
                  <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div id="swal-csv-progress-bar" style="width:92%;max-width:360px;background:rgba(30,136,229,0.10);backdrop-filter:blur(4px);border-radius:22px;height:36px;overflow:hidden;box-shadow:0 4px 24px #b3b3e6 inset,0 1.5px 8px #b3c6f7;margin-bottom:14px;border:2px solid #b3c6f7;position:relative;">
              <div id="swal-csv-progress-inner" style="height:100%;width:0%;background:linear-gradient(90deg,#1976d2 0%,#42a5f5 100%);transition:width 0.4s;border-radius:22px;position:absolute;left:0;top:0;"></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;gap:2px;">
              <div id="swal-csv-progress-text" style="font-size:2rem;color:#1976d2;font-weight:900;text-shadow:0 1px 0 #fff,0 2px 8px #b3c6f7;text-align:center;width:100%;letter-spacing:1.2px;font-family:'Segoe UI',Roboto,'Sarabun',sans-serif;">&nbsp;</div>
              <div id="swal-csv-rowcount-text" style="font-size:1.35rem;color:#1976d2;font-weight:700;text-align:center;width:100%;letter-spacing:0.5px;font-family:'Segoe UI',Roboto,'Sarabun',sans-serif;">&nbsp;</div>
              <div id="swal-csv-eta-text" style="font-size:1.22rem;color:#388e3c;font-weight:800;margin-top:6px;text-align:center;width:100%;letter-spacing:0.5px;text-shadow:0 1px 0 #fff;font-family:'Segoe UI',Roboto,'Sarabun',sans-serif;">&nbsp;</div>
            </div>
            <button id="swal-csv-cancel-btn" style="margin-top:32px;padding:14px 56px;font-size:1.35rem;font-weight:900;color:#fff;background:linear-gradient(90deg,#ef5350 0%,#e57373 100%);border:none;border-radius:16px;box-shadow:0 4px 16px #e57373,0 1.5px 8px #fff;cursor:pointer;transition:background 0.2s,transform 0.1s;outline:none;letter-spacing:1.2px;font-family:'Segoe UI',Roboto,'Sarabun',sans-serif;">Cancel</button>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById('swal-csv-cancel-btn').onclick = () => {
            cancelled = true;
            abortController.abort();
            if (animFrame) cancelAnimationFrame(animFrame);
            Swal.close();
            Swal.fire({ icon: 'info', title: 'Export Cancelled', text: 'The export has been cancelled.', confirmButtonText: 'OK' });
          };
        }
      });
      // Load first page (เพื่อดูจำนวนทั้งหมด)
      const t0 = Date.now();
      const res = await axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-std-time-by-product-report-new", { params, signal: abortController.signal });
      if (cancelled) return;
      const rows = Array.isArray(res.data.rows) ? res.data.rows : [];
      totalRows = res.data.total || rows.length;
      allRows = rows;
      maxPage = Math.ceil(totalRows / PAGE_SIZE);
      let loadedRows = rows.length;
      let finishedPages = 1;
      let percent = Math.min(100, Math.round((loadedRows / totalRows) * 100));
      animRow = 0; animPercent = 0;
      animateTo(loadedRows, percent, ANIMATE_DURATION);
      const etaEl = document.getElementById('swal-csv-eta-text');
      if (etaEl) etaEl.innerText = '';
      // Prepare page list
      let pageList = [];
      for (let p = 2; p <= maxPage; p++) pageList.push(p);
      // Track time for ETA
      let pageTimes = [Date.now() - t0];
      // Batch loop (ทีละ 3 หน้า)
      for (let i = 0; i < pageList.length; i += BATCH_SIZE) {
        if (cancelled) { if (animFrame) cancelAnimationFrame(animFrame); return; }
        const batchPages = pageList.slice(i, i + BATCH_SIZE);
        const batchStart = Date.now();
        const batchRequests = batchPages.map(p =>
          axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-std-time-by-product-report-new", { params: { ...params, page: p }, signal: abortController.signal })
            .then(resPage => ({ rows: Array.isArray(resPage.data.rows) ? resPage.data.rows : [], page: p, time: Date.now() }))
            .catch(() => ({ rows: [], page: p, time: Date.now() }))
        );
        const batchResults = await Promise.all(batchRequests);
        if (cancelled) { if (animFrame) cancelAnimationFrame(animFrame); return; }
        // Sort by page for correct order
        batchResults.sort((a, b) => a.page - b.page);
        batchResults.forEach(result => {
          allRows = allRows.concat(result.rows);
          loadedRows += result.rows.length;
          finishedPages++;
          percent = Math.min(100, Math.round((loadedRows / totalRows) * 100));
        });
        const batchTime = Date.now() - batchStart;
        animateTo(loadedRows, percent, batchTime);
        // ETA
        pageTimes.push(Date.now() - batchStart);
        const avgTime = pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length;
        const remainPages = maxPage - finishedPages;
        const etaSec = Math.round((avgTime * remainPages) / 1000);
        const min = Math.floor(etaSec / 60);
        const sec = etaSec % 60;
        let etaText = '';
        if (remainPages > 0) {
          etaText = `TIME : ${min}m ${sec}s`;
        } else {
          etaText = 'Almost done...';
        }
        const etaTextEl = document.getElementById('swal-csv-eta-text');
        if (etaTextEl) etaTextEl.innerText = etaText;
      }
      if (animFrame) cancelAnimationFrame(animFrame);
      animateTo(totalRows, 100, 600);
      setTimeout(() => Swal.close(), 400);
      if (allRows.length === 0) {
        Swal.fire({ icon: 'info', title: 'No data to export', confirmButtonText: 'OK' });
        return;
      }
      // Export CSV
      await createCSVFile(allRows, "Standard_Time_Report.csv");
      Swal.fire({
        icon: 'success',
        title: 'Export successful!',
        text: `Exported ${allRows.length.toLocaleString()} rows (CSV)` + (totalRows ? ` / Total: ${totalRows.toLocaleString()} rows` : ''),
        confirmButtonText: 'OK'
      });
      // Show Thai complete message after export
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Export completed',
          confirmButtonText: 'OK'
        });
      }, 500);
      return;
    } catch (err) {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (cancelled) return;
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Export failed', text: 'An error occurred while exporting CSV', confirmButtonText: 'OK' });
    }
  };

  // --- สร้างไฟล์ CSV ---
  const createCSVFile = async (rows, filename) => {
    const headers = [
      "Product Name", "Seq", "Process", "Factory", "Unit", "Wc", "Formula Group", "Sht.Width", "Sht.Len", "Sht./Lot", "Pcs/Sht", "Pcs/Lot", "Min./Lot", "Sec/Sht.", "Sec/Pcs.", "UPH", "Create By", "Create Date", "Update By", "Update Date", "Prd Forecast", "Prd Wip", "Prd Stdtime", "Remark"
    ];
    const keys = [
      "prd_name", "ro_seq", "proc_disp", "factory_desc", "fac_unit_desc", "wc", "grp_name", "ro_sht_width", "ro_sht_length", "ro_sht_lot", "ro_pcs_sht", "pcs_lot", "min_lot", "sec_sheet", "sec_pcs", "uph", "create_by", "create_date", "update_by", "update_date", "prd_forecast", "prd_wip", "prd_stdtime", "remark"
    ];
    let csv = '';
    csv += headers.join(',') + '\r\n';
    for (const row of rows) {
      const line = keys.map(key => {
        let value = row[key];
        if (
          typeof value === 'undefined' ||
          value === null ||
          Number.isNaN(value) ||
          (typeof value === 'string' && value.trim().toLowerCase() === 'nan')
        ) value = '-';
        if (typeof value === 'string') value = '"' + value.replace(/"/g, '""').replace(/\r?\n|\r/g, ' ') + '"';
        return value;
      }).join(',');
      csv += line + '\r\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // --- สร้างไฟล์ Excel ---
  const createExcelFile = async (rows, filename) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    const headers = [
      "Product Name", "Seq", "Process", "Factory", "Unit", "Wc", "Formula Group", "Sht.Width", "Sht.Len", "Sht./Lot", "Pcs/Sht", "Pcs/Lot", "Min./Lot", "Sec/Sht.", "Sec/Pcs.", "UPH", "Create By", "Create Date", "Update By", "Update Date", "Prd Forecast", "Prd Wip", "Prd Stdtime", "Remark"
    ];
    const keys = [
      "prd_name", "ro_seq", "proc_disp", "factory_desc", "fac_unit_desc", "wc", "grp_name", "ro_sht_width", "ro_sht_length", "ro_sht_lot", "ro_pcs_sht", "pcs_lot", "min_lot", "sec_sheet", "sec_pcs", "uph", "create_by", "create_date", "update_by", "update_date", "prd_forecast", "prd_wip", "prd_stdtime", "remark"
    ];
    worksheet.addRow(headers);
    rows.forEach(row => {
      worksheet.addRow(keys.map(key => row[key] ?? ''));
    });
    worksheet.columns.forEach(col => {
      col.width = 16;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  };

  // === Smart Export Handler - export CSV ทุกกรณี ===
  const handleSmartExport = async () => {
    try {
      await handleExportCSV();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'An error occurred', text: 'Unable to export CSV', confirmButtonText: 'OK' });
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    axios.get("http://10.17.100.115:3001/api/smart_pcap/filter-factory-list-std-time")
      .then(res => {
        if (Array.isArray(res.data)) {
          const factories = res.data.map(f => ({
            value: f.factory_code || f.factory_desc || f.id || f.name,
            label: f.factory_desc || f.name || f.factory_code || f.id
          }));
          setLists((prev) => ({ ...prev, factoryList: [{ value: "ALL", label: "ALL" }, ...factories] }));
        }
      })
      .catch(() => setLists((prev) => ({ ...prev, factoryList: [{ value: "ALL", label: "ALL" }] })));
  }, []);

  useEffect(() => {
    if (!filters.factory || filters.factory === "ALL") {
      const units = allUnitsMock.map(u => ({ value: u, label: u }));
      const newList = [{ value: "ALL", label: "ALL" }, ...units];
      setLists((prev) => ({ ...prev, unitList: newList }));
      if (!newList.some(item => item.value === filters.unit)) {
        setFilters((prev) => ({ ...prev, unit: "ALL" }));
      }
      return;
    }
    
    axios.get(`http://10.17.100.115:3001/api/smart_pcap/filter-unit-list-std-time?factory=${filters.factory}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        const units = arr.map(u => ({
          value: u.fac_unit_desc,
          label: u.fac_unit_desc
        }));
        const newList = [{ value: "ALL", label: "ALL" }, ...units];
        setLists((prev) => ({ ...prev, unitList: newList }));
        if (!newList.some(item => item.value === filters.unit)) {
          setFilters((prev) => ({ ...prev, unit: "ALL" }));
        }
      })
      .catch(() => {
        setLists((prev) => ({ ...prev, unitList: [{ value: "ALL", label: "ALL" }] }));
        setFilters((prev) => ({ ...prev, unit: "ALL" }));
      });
  }, [filters.factory, filters.unit]);

  useEffect(() => {
    const apiFactory = (!filters.factory || filters.factory === "ALL") ? "ALL" : filters.factory;
    const apiUnit = (!filters.unit || filters.unit === "ALL") ? "ALL" : filters.unit;
    axios.get(`http://10.17.100.115:3001/api/smart_pcap/filter-group-list-std-time?factory=${apiFactory}&unit=${apiUnit}`)
      .then(res => {
        let arr = Array.isArray(res.data) ? res.data : [];
        if (arr.length === 0) {
          axios.get(`http://10.17.100.115:3001/api/smart_pcap/filter-group-list-std-time`)
            .then(res2 => {
              arr = Array.isArray(res2.data) ? res2.data : [];
              const uniqueGroups = Array.from(new Set(arr.map(g => g.grp_name)))
                .map(name => ({ value: name, label: name }));
              const newList = [{ value: "ALL", label: "ALL" }, ...uniqueGroups];
              setLists((prev) => ({ ...prev, groupProcessList: newList }));
              if (!newList.some(item => item.value === filters.groupProcess)) {
                setFilters((prev) => ({ ...prev, groupProcess: "ALL" }));
              }
            })
            .catch(() => {
              setLists((prev) => ({ ...prev, groupProcessList: [{ value: "ALL", label: "ALL" }] }));
              setFilters((prev) => ({ ...prev, groupProcess: "ALL" }));
            });
          return;
        }
        const uniqueGroups = Array.from(new Set(arr.map(g => g.grp_name)))
          .map(name => ({ value: name, label: name }));
        const newList = [{ value: "ALL", label: "ALL" }, ...uniqueGroups];
        setLists((prev) => ({ ...prev, groupProcessList: newList }));
        if (!newList.some(item => item.value === filters.groupProcess)) {
          setFilters((prev) => ({ ...prev, groupProcess: "ALL" }));
        }
      })
      .catch(() => {
        setLists((prev) => ({ ...prev, groupProcessList: [{ value: "ALL", label: "ALL" }] }));
        setFilters((prev) => ({ ...prev, groupProcess: "ALL" }));
      });
  }, [filters.factory, filters.unit, filters.groupProcess]);

  useEffect(() => {
    const apiFactory = (!filters.factory || filters.factory === "ALL") ? "ALL" : filters.factory;
    const apiUnit = (!filters.unit || filters.unit === "ALL") ? "ALL" : filters.unit;
    const apiGroup = (!filters.groupProcess || filters.groupProcess === "ALL") ? "ALL" : filters.groupProcess;
    axios.get(`http://10.17.100.115:3001/api/smart_pcap/filter-process-list-std-time?factory=${apiFactory}&unit=${apiUnit}&group=${apiGroup}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        const uniqueProcess = Array.from(new Set(arr.map(p => p.proc_disp || p.process_name || p.process || p.name)))
          .filter(Boolean)
          .map(name => ({ value: name, label: name }));
        const newList = [{ value: "ALL", label: "ALL" }, ...uniqueProcess];
        setLists((prev) => ({ ...prev, processList: newList }));
        if (!newList.some(item => item.value === filters.process)) {
          setFilters((prev) => ({ ...prev, process: "ALL" }));
        }
      })
      .catch(() => {
        setLists((prev) => ({ ...prev, processList: [{ value: "ALL", label: "ALL" }] }));
        setFilters((prev) => ({ ...prev, process: "ALL" }));
      });
  }, [filters.factory, filters.unit, filters.groupProcess, filters.process]);

  useEffect(() => {
    const apiFactory = (!filters.factory || filters.factory === "ALL") ? "ALL" : filters.factory;
    const apiUnit = (!filters.unit || filters.unit === "ALL") ? "ALL" : filters.unit;
    const apiGroup = (!filters.groupProcess || filters.groupProcess === "ALL") ? "ALL" : filters.groupProcess;
    const apiProcess = (!filters.process || filters.process === "ALL") ? "ALL" : filters.process;
    axios.get(
      `http://10.17.100.115:3001/api/smart_pcap/filter-product-list-std-time?factory=${apiFactory}&unit=${apiUnit}&group=${apiGroup}&proc_disp=${apiProcess}`
    )
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        const uniqueProducts = Array.from(new Set(
          arr.map(p =>
            p.product_from ||
            p.prd_from ||
            p.product ||
            p.name ||
            p.product_code ||
            p.product_name ||
            p.prd_name ||
            p.ro_prd_name
          )
        ))
          .filter(Boolean)
          .map(name => ({ value: name, label: name }));
        const newList = [{ value: "ALL", label: "ALL" }, ...uniqueProducts];
        setLists((prev) => ({ ...prev, productFromList: newList, productToList: newList }));
        if (!newList.some(item => item.value === filters.productFrom)) {
          setFilters((prev) => ({ ...prev, productFrom: "ALL" }));
        }
        if (!newList.some(item => item.value === filters.productTo)) {
          setFilters((prev) => ({ ...prev, productTo: "ALL" }));
        }
      })
      .catch(() => {
        setLists((prev) => ({ ...prev, productFromList: [{ value: "ALL", label: "ALL" }], productToList: [{ value: "ALL", label: "ALL" }] }));
        setFilters((prev) => ({ ...prev, productFrom: "ALL", productTo: "ALL" }));
      });
  }, [filters.factory, filters.unit, filters.groupProcess, filters.process, filters.productFrom, filters.productTo]);

  // ======================= Render =======================
  return (
    <>
      {/* Navbar */}
      <Navbar onToggle={handleNavbarToggle} />
      {/* Main Container */}
      <Box marginLeft={isNavbarOpen ? 0 : 0} marginTop={10} sx={{ width: '100vw', maxWidth: '100vw', minWidth: '100vw', padding: 0 }}>
        <div
          style={{
            background: "#fff",
            minHeight: "650px",
            width: '100vw',
            borderRadius: 16,
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.07)",
            overflow: "hidden",
            padding: 0,
            margin: 0,
            position: 'relative',
            left: 0,
            right: 0,
          }}
        >
          {/* Header Bar Section (light blue, covers everything) */}
          <div
            style={
              {
                width: "100%",
                height: 150,
                background: "linear-gradient(90deg,rgba(255, 255, 255, 0.5) 0%,rgba(255, 255, 255, 0.65) 100%)", // light blue-white gradient
                borderRadius: "16px 16px 0 0",
                padding: "20px 24px 0px 24px",
                boxShadow: "0 4px 16px 0 rgba(33,150,243,0.10)",
                marginBottom: 0,
                border: "1.5px solid #d0e2ff",
                position: "relative",
                fontFamily: 'Sarabun, sans-serif',
                color: "#1a237e"
              }
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 34,
                width: '100%',
                justifyContent: 'space-between', // left-right alignment
              }}
            >
              {/* --- Left Fields Group --- */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 26,
                  rowGap: 20,
                  minWidth: 600,
                  justifyContent: 'flex-end', // move grid to the right
                  width: '100%',
                  marginLeft: '29%', // push to the right
                  maxWidth: 900,
                }}
              >
                {/* Row 1 */}
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <Autocomplete
                    size="small"
                    options={lists.factoryList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.factoryList.find(item => item.value === filters.factory) || null}
                    onChange={(_, newValue) => handleFilterChange('factory', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Factory" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <Autocomplete
                    size="small"
                    options={lists.unitList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.unitList.find(item => item.value === filters.unit) || null}
                    onChange={(_, newValue) => handleFilterChange('unit', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Unit" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <Autocomplete
                    size="small"
                    options={lists.groupProcessList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.groupProcessList.find(item => item.value === filters.groupProcess) || null}
                    onChange={(_, newValue) => handleFilterChange('groupProcess', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Group Process" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
                {/* Row 2 */}
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <Autocomplete
                    size="small"
                    options={lists.processList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.processList.find(item => item.value === filters.process) || null}
                    onChange={(_, newValue) => handleFilterChange('process', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Process" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <Autocomplete
                    size="small"
                    options={lists.productFromList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.productFromList.find(item => item.value === filters.productFrom) || null}
                    onChange={(_, newValue) => handleFilterChange('productFrom', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Product From" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Autocomplete
                    size="small"
                    options={lists.productToList}
                    getOptionLabel={option => option.label || ""}
                    value={lists.productToList.find(item => item.value === filters.productTo) || null}
                    onChange={(_, newValue) => handleFilterChange('productTo', newValue ? newValue.value : "ALL")}
                    renderInput={(params) => <TextField {...params} label="Product To" />}
                    disableClearable
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    ListboxProps={{ style: { maxHeight: 300 } }}
                  />
                </FormControl>
              </div>

              {/* --- Right Buttons & Radio --- */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 0, marginRight: 0, minWidth: 320, justifyContent: 'flex-end', width: '100%' }}>
                {/* Radio Group (left) */}
                <div
                  style={{
                    borderRadius: 8,
                    padding: "16px",
                    marginTop: 0,
                    minWidth: 220,
                    maxWidth: 260,
                    background: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <FormControl component="fieldset" sx={{ mt: -2.2 }}>
                    <FormLabel
                      component="legend"
                      sx={{
                        fontSize: 14,
                        color: "#1976d2",
                        fontWeight: 700,
                        mb: -0.1,
                        letterSpacing: 0.5,
                      }}
                    >
                      Standard time
                    </FormLabel>
                    <RadioGroup
                      value={filters.stdType}
                      onChange={(e) => handleFilterChange('stdType', e.target.value)}
                      sx={{
                        fontSize: 14,
                        mt: -0.5,
                        mb: 4,
                        gap: 0,
                      }}
                    >
                      <FormControlLabel
                        value="ALL"
                        control={<Radio size="small" />}
                        label="Show ALL"
                        sx={{
                          mb: -1,
                          mt: 0,
                          py: 0,
                          "& .MuiFormControlLabel-label": {
                            fontWeight: 500,
                            color: "#333",
                          },
                        }}
                      />
                      <FormControlLabel
                        value="HAVE_STD"
                        control={<Radio size="small" />}
                        label="Show P/D have STD"
                        sx={{
                          mb: -1,
                          mt: 0,
                          py: 0,
                          "& .MuiFormControlLabel-label": {
                            fontWeight: 500,
                            color: "#333",
                          },
                        }}
                      />
                      <FormControlLabel
                        value="NO_STD"
                        control={<Radio size="small" />}
                        label="Show P/D No STD"
                        sx={{
                          mb: -1,
                          mt: 0,
                          py: 0,
                          "& .MuiFormControlLabel-label": {
                            fontWeight: 500,
                            color: "#333",
                          },
                        }}
                      />
                    </RadioGroup>
                  </FormControl>
                </div>

                {/* Button Grid (right, align to top, now rightmost) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridTemplateRows: "repeat(2, 1fr)",
                    gap: 5,
                    background: "rgba(232,245,233,0.0)",
                    borderRadius: 18,
                    padding: 1,
                    boxShadow: "none",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginTop: 0,
                    marginLeft: 0,
                    minWidth: 160,
                  }}
                >
                  <CircleButton btntype="search" aria-label="search" onClick={handleSearch}>
                    <img src="/search.png" alt="search" width={36} height={36} style={{maxWidth:36,maxHeight:36}} />
                  </CircleButton>
                  <CircleButton btntype="clear" aria-label="clear" onClick={handleClearAll}>
                    <img src="/clear1.png" alt="clear" width={36} height={36} style={{maxWidth:36,maxHeight:36}} />
                  </CircleButton>
                  <CircleButton btntype="excel" aria-label="excel" onClick={handleSmartExport}>
                    <img src="/excel.png" alt="excel" width={36} height={36} style={{maxWidth:36,maxHeight:36}} />
                  </CircleButton>
                  <CircleButton btntype="refresh" aria-label="refresh" onClick={handleRefresh}>
                    <img src="/ref.png" alt="refresh" width={36} height={36} style={{maxWidth:36,maxHeight:36}} />
                  </CircleButton>
                </div>
              </div>
            </div>
          </div>
          {/* ========== Table or Other Content Section ========== */}
          {/* แสดงช่วง Product ที่เลือก */}
          <div style={{
            margin: '12px 0 4px 0',
            fontWeight: 600,
            fontSize: 18,
            marginLeft :95,
            color: ' #1976d2',
            textAlign: 'left',
            paddingLeft: 12
          }}>
            PRODUCT FROM: {filters.productFrom !== 'ALL' ? filters.productFrom : '-'} &nbsp; TO &nbsp; PRODUCT TO: {filters.productTo !== 'ALL' ? filters.productTo : '-'}
          </div>
          {loading && (
            <div style={{textAlign:'center',margin:'20px',fontSize:'20px',color:' #1976d2'}}>Loading data...</div>
          )}
          {!loading && (
            <div style={{
              position: 'relative',
              marginLeft: '80px',
              width: '93.8%',
              maxWidth: '100vw',
              minHeight: '350px',
              height: 'calc(100vh - 370px)', // reduce height by 100px
              background: '#fff',
              border: '1.5px solid #e0e0e0',
              borderRadius: '12px',
              boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.07)',
              overflowX: 'auto',
              overflowY: 'auto',
              padding: 0,
              marginTop: '0px',
              zIndex: 10,
            }}>
              <table className="w-full border-collapse min-w-max" style={{ borderColor: '#e0e0e0' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr className="bg-[#1976d2] text-white font-semibold text-base border border-[#e0e0e0]">
                    <th className="border border-[#e0e0e0] p-2 sticky-col-header" style={{ position: 'sticky', left: 0, width: 140, minWidth: 140, maxWidth: 140 ,zIndex: 1000, borderLeft: '1.5px solid #e0e0e0', borderRight: '1.5px solid #e0e0e0', background: '#1976d2', color: '#fff' }}>Product Name</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 10, borderRight: '1.5px solid #e0e0e0' }}>Seq</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Process</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Factory</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Unit</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Wc</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Formula Group</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Sht.Width</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Sht.Len</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Sht./Lot</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Pcs/Sht</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Pcs/Lot</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Min./Lot</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Sec/Sht.</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Sec/Pcs.</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>UPH</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Create By</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Create Date</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Update By</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Update Date</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Prd Forecast</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Prd Wip</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Prd Stdtime</th>
                    <th className="border border-[#e0e0e0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3, borderRight: '1.5px solid #e0e0e0' }}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr><td colSpan={24} style={{textAlign:'center',color:'#888',fontSize:25}}>NO DATA</td></tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-[#e0e0e0] p-2 sticky-col-left" style={{ position: 'sticky', left: 0, width: 140, minWidth: 140, maxWidth: 140, borderLeft: '1.5px solid #e0e0e0', borderRight: '1.5px solid #e0e0e0', background: '#fff' }}>{row.prd_name || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.ro_seq) || row.ro_seq === null || row.ro_seq === undefined || row.ro_seq === '' ? '-' : row.ro_seq}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.proc_disp || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.factory_desc || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.fac_unit_desc || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.wc) || row.wc === null || row.wc === undefined || row.wc === '' ? '-' : row.wc}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.grp_name || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.ro_sht_width) || row.ro_sht_width === null || row.ro_sht_width === undefined || row.ro_sht_width === '' ? '-' : row.ro_sht_width}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.ro_sht_length) || row.ro_sht_length === null || row.ro_sht_length === undefined || row.ro_sht_length === '' ? '-' : row.ro_sht_length}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.ro_sht_lot) || row.ro_sht_lot === null || row.ro_sht_lot === undefined || row.ro_sht_lot === '' ? '-' : row.ro_sht_lot}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.ro_pcs_sht) || row.ro_pcs_sht === null || row.ro_pcs_sht === undefined || row.ro_pcs_sht === '' ? '-' : row.ro_pcs_sht}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.pcs_lot) || row.pcs_lot === null || row.pcs_lot === undefined || row.pcs_lot === '' ? '-' : row.pcs_lot}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.min_lot) || row.min_lot === null || row.min_lot === undefined || row.min_lot === '' ? '-' : row.min_lot}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.sec_sheet) || row.sec_sheet === null || row.sec_sheet === undefined || row.sec_sheet === '' ? '-' : row.sec_sheet}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.sec_pcs) || row.sec_pcs === null || row.sec_pcs === undefined || row.sec_pcs === '' ? '-' : row.sec_pcs}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{isNaN(row.uph) || row.uph === null || row.uph === undefined || row.uph === '' ? '-' : row.uph}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.create_by || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.create_date || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.update_by || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.update_date || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.prd_forecast || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.prd_wip || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.prd_stdtime || '-'}</td>
                        <td className="border border-[#e0e0e0] p-2" style={{ borderRight: '1.5px solid #e0e0e0' }}>{row.remark || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0', fontSize: '18px', fontWeight: 500 }}>
            <button 
              onClick={() => page > 1 && handleSearch(Number(page) - 1, pageSize)} 
              disabled={page === 1} 
              style={{
                marginRight: 12,
                padding: '6px 18px',
                background: page === 1 ? '#e0e0e0' : '#1976d2',
                color: page === 1 ? '#888' : '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                cursor: page ===  1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
              }}
            >Prev</button>
            <span style={{marginRight: 12}}>Page {Number(page) || 1} / {Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1}</span>
            {/* --- Jump to Page Input --- */}
            <input
              type="number"
              min={1}
              max={Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1}
              value={jumpPageInput || ''}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setJumpPageInput(val);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const maxPage = Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1;
                  let targetPage = Number(jumpPageInput);
                  if (targetPage >= 1 && targetPage <= maxPage) {
                    handleSearch(targetPage, pageSize);
                  }
                }
              }}
              placeholder="Page#"
              style={{
                width: 70,
                marginRight: 6,
                padding: '6px 8px',
                fontSize: 16,
                border: '2px solid #1976d2',
                borderRadius: 6,
                background: '#f5faff',
                color: '#1976d2',
                outline: 'none',
                boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
              }}
            />
            <button
              onClick={() => {
                const maxPage = Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1;
                let targetPage = Number(jumpPageInput);
                if (targetPage >= 1 && targetPage <= maxPage) {
                  handleSearch(targetPage, pageSize);
                }
              }}
              style={{
                marginRight: 12,
                padding: '6px 14px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
              }}
            >Go</button>
            <button 
              onClick={() => (page * pageSize < total) && handleSearch(Number(page) + 1, pageSize)} 
              disabled={page * pageSize >= total} 
              style={{
                marginLeft: 0,
                marginRight: 18,
                padding: '6px 18px',
                background: page * pageSize >= total ? '#e0e0e0' : '#1976d2',
                color: page * pageSize >= total ? '#888' : '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                cursor: page * pageSize >= total ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
              }}
            >Next</button>
            <span style={{marginRight: 18}}>Total: {Number.isFinite(total) ? Number(total) : 0} records</span>
            <span style={{marginLeft:16, display: 'flex', alignItems: 'center', gap: 6}}>
              Rows per page:
              <select 
                value={pageSize} 
                onChange={e => { handleSearch(1, Number(e.target.value)); }} 
                style={{
                  marginLeft: 4,
                  padding: '6px 12px',
                  fontSize: 16,
                  fontWeight: 600,
                  border: '2px solid #1976d2',
                  borderRadius: 6,
                  background: '#f5faff',
                  color: '#1976d2',
                  outline: 'none',
                  boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
                }}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </span>
          </div>
        </div>
      </Box>
    </>
  );
}