import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar/Navbar";
import Box from "@mui/material/Box";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InfoIcon from "@mui/icons-material/Info";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import Swal from 'sweetalert2';

export default function StandardTimeSimilarStructure() {
  // --- ดึงข้อมูล user และเตรียมค่าต่าง ๆ แบบปลอดภัย ---
  let userName = '';
  let userSurname = '';
  let ShortSurname = '';
  let update_by = '';
  let userEmpID = '';
  let userUpperName = '';
  let UpperUpdate_By = '';
  try {
    const userString = localStorage.getItem("userToken");
    if (userString) {
      const userObject = JSON.parse(userString);
      userName = userObject?.user_name || '';
      userSurname = userObject?.user_surname || '';
      ShortSurname = userSurname?.charAt(0) || '';
      update_by = userName + '.' + ShortSurname;
      userEmpID = userObject?.emp_id || '';
      userUpperName = userName?.toUpperCase() || '';
      userObject.update_by = update_by;
      UpperUpdate_By = userObject?.update_by?.toUpperCase() || '';
      // log สำหรับ debug
      console.log({ userName, userSurname, ShortSurname, update_by, userEmpID, userUpperName, UpperUpdate_By });
    }
  } catch (e) {
    // ถ้า error จะได้ string ว่างทั้งหมด
  }

  // ฟังก์ชัน MOCK สำหรับส่งข้อมูลทั้งหมดไปยัง API (ยังไม่เชื่อมต่อ API จริง)
  const handleSendTableData = async () => {
    // Check if tableData is empty or total is 0
    if (!tableData || tableData.length === 0 || total === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Table Selected',
        text: 'No table data selected. Please select data before updating.',
        confirmButtonColor: '#1976d2'
      });
      return;
    }
    const result = await Swal.fire({
      title: 'Confirm Update?',
      text: `Do you want to update all data (${total.toLocaleString()} records) to the system?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#e53935',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      // LOG เฉพาะ field ที่ต้องการตรวจสอบ
      const logData = tableData.map(row => ({
        prd_item: row.prd_item || row.item || '',
        proc_id: row.proc_id || '',
        sec_pcs: row.sec_pcs ?? row.sec_per_pcs ?? '',
        create_by: row.create_by || '',
        update_by: row.update_by || '',
        similar_type: row.similar_type || row.remark || '',
      }));
      console.log(`[MOCK] Sending data. Total: ${total} records`, logData);
      setDialog({
        open: true,
        message: `Preparing to send ${total.toLocaleString()} records to the API (mock only, not connected to real API).`,
        severity: "info",
      });
    }
  };
  // Modern gradient background for the whole page
  const pageBg = {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  };
  // -------------------- State --------------------
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  // Product
  const [productInput, setProductInput] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOpen, setProductOpen] = useState(false);

  // Process
  const [processInput, setProcessInput] = useState("");
  const [processOptions, setProcessOptions] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processOpen, setProcessOpen] = useState(false);

  // Table & Pagination
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [loading, setLoading] = useState(false);
  //table refresh: reset only input fields (Product/Process) but keep table and pagination
  const handleRefreshTable = () => {
    setSelectedProduct(null);
    setProductInput("");
    setSelectedProcess(null);
    setProcessInput("");
  };

  // Dialog
  const [dialog, setDialog] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Export status state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ percent: 0, loaded: 0, total: 0, done: false, error: false });
  const [exportCancelToken, setExportCancelToken] = useState(null);
  // --- Export progress bar: sync with real progress, use Swal for all notifications ---
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(0);
  const progressTimer = useRef(null);

  // -------------------- Effect --------------------
  useEffect(() => {
    let cancel;
    setProductLoading(true);
    axios
      .get(
        `http://10.17.100.115:3001/api/smart_pcap/filter-data-product-list-similar?search=${
          productInput || ""
        }`,
        { cancelToken: new axios.CancelToken((c) => (cancel = c)) }
      )
      .then((res) => setProductOptions(res.data || []))
      .catch(() => setProductOptions([]))
      .finally(() => setProductLoading(false));
    return () => cancel && cancel();
  }, [productOpen, productInput]);

  useEffect(() => {
    let prdName = selectedProduct?.prd_name || "";
    setProcessLoading(true);
    axios
      .get(
        `http://10.17.100.115:3001/api/smart_pcap/filter-data-process-list-similar?prd_name=${encodeURIComponent(
          prdName || "ALL PRODUCT"
        )}`
      )
      .then((res) => setProcessOptions(res.data || []))
      .catch(() => setProcessOptions([]))
      .finally(() => setProcessLoading(false));
    setSelectedProcess(null);
    setProcessInput("");
  }, [selectedProduct]);

  useEffect(() => {
    let prdName = selectedProduct?.prd_name || "";
    if (processInput) {
      setProcessLoading(true);
      axios
        .get(
          `http://10.17.100.115:3001/api/smart_pcap/filter-data-process-list-similar?prd_name=${encodeURIComponent(
            prdName || "ALL PRODUCT"
          )}&search=${encodeURIComponent(processInput)}`
        )
        .then((res) => setProcessOptions(res.data || []))
        .catch(() => setProcessOptions([]))
        .finally(() => setProcessLoading(false));
    }
  }, [processInput, selectedProduct]);

  // Progress bar: animate smoothly but always catch up to real percent, and only reach 100% when done
  useEffect(() => {
    if (exporting) {
      setProgressPercent(0);
      if (progressTimer.current) clearInterval(progressTimer.current);
      progressTimer.current = setInterval(() => {
        setProgressPercent(prev => {
          if (exportProgress.done) return 100;
          if (prev < exportProgress.percent) {
            // Smoothly catch up to real percent
            return Math.min(exportProgress.percent, prev + 2);
          }
          // If stuck, nudge forward slowly but never reach 100 until done
          if (prev < 99) return prev + 1;
          return prev;
        });
      }, 60);
    } else {
      setProgressPercent(0);
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [exporting, exportProgress]);

  // -------------------- Handler --------------------
  const handleNavbarToggle = (openStatus) => setIsNavbarOpen(openStatus);

  const handleClearSearch = () => {
    setSelectedProduct(null);
    setProductInput("");
    setSelectedProcess(null);
    setProcessInput("");
    setTableData([]);
    setTotal(0);
    setPage(1);
    setPageSize(20);
    setJumpPageInput("");
    setLoading(false);
    // Reset export state if needed
    setExporting(false);
    setExportProgress({ percent: 0, loaded: 0, total: 0, done: false, error: false });
    setExportCancelToken(null);
    setProgressPercent(0);
    setProgressLoaded(0);
  };

  const handleCloseDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  // Pagination-aware search
  const handleSearch = async (goToPage = page, goToPageSize = pageSize) => {
    setLoading(true);
    const currentPage = Number(goToPage) || 1;
    const currentPageSize = Number(goToPageSize) || 20;
    setPage(currentPage);
    setPageSize(currentPageSize);
    let url = `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure`;
    let params = {};
    // --- UI: Show ALL PRODUCT/ALL PROCESS in input fields if not selected ---
    if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      params = { prd_name: 'ALL PRODUCT', proc_disp: 'ALL PROCESS', page: currentPage, pageSize: currentPageSize };
      setProductInput('ALL PRODUCT');
      setProcessInput('ALL PROCESS');
    } else if (!selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      params = { prd_name: 'ALL PRODUCT', proc_disp: selectedProcess.proc_disp, page: currentPage, pageSize: currentPageSize };
      setProductInput('ALL PRODUCT');
    } else if (selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      params = { prd_name: selectedProduct.prd_name, proc_disp: 'ALL PROCESS', page: currentPage, pageSize: currentPageSize };
      setProcessInput('ALL PROCESS');
    } else if (selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      params = { prd_name: selectedProduct.prd_name, proc_disp: selectedProcess.proc_disp, page: currentPage, pageSize: currentPageSize };
    }
    try {
      const res = await axios.get(url, { params });
      // API ควรส่ง { rows: [...], total: ... }
      if (res.data && Array.isArray(res.data.rows)) {
        setTableData(res.data.rows.map((row) => ({
          factory: row.factory_desc || row.factory || "",
          unit: row.unit_desc || row.unit || "",
          process: row.proc_disp || row.process || params.proc_disp || "",
          product: row.prd_name || row.product || params.prd_name || "",
          item: row.prd_item || row.item || "",
          sec_per_pcs: row.sec_pcs ?? row.sec_per_pcs ?? "",
          remark: row.similar_type || row.remark || "",
        })));
        setTotal(res.data.total || res.data.rows.length || 0);
      } else if (Array.isArray(res.data) && res.data.length > 0) {
        setTableData(res.data.map((row) => ({
          factory: row.factory_desc || row.factory || "",
          unit: row.unit_desc || row.unit || "",
          process: row.proc_disp || row.process || params.proc_disp || "",
          product: row.prd_name || row.product || params.prd_name || "",
          item: row.prd_item || row.item || "",
          sec_per_pcs: row.sec_pcs ?? row.sec_per_pcs ?? "",
          remark: row.similar_type || row.remark || "",
        })));
        setTotal(res.data.length);
      } else {
        setTableData([
          {
            factory: "",
            unit: "",
            process: params.proc_disp || "",
            product: params.prd_name || "",
            item: "",
            sec_per_pcs: "",
            remark: "No data from the system.",
          },
        ]);
        setTotal(0);
      }
    } catch {
      setTableData([
        {
          factory: "",
          unit: "",
          process: params.proc_disp || "",
          product: params.prd_name || "",
          item: "",
          sec_per_pcs: "",
          remark: "No data from the system.",
        },
      ]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Export all pages to Excel with status dialog and cancel
  const handleExportExcel = async () => {
    // Check if tableData is empty or total is 0
    if (!tableData || tableData.length === 0 || total === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Table Selected',
        text: 'No table data selected. Please select data before exporting.',
        confirmButtonColor: '#1976d2'
      });
      return;
    }
    let cancelTokenSource = axios.CancelToken.source();
    setExportCancelToken(cancelTokenSource);
    // 1. Get total count first (ก่อน setExporting)
    let url = `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure`;
    let paramsBase = {};
    if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      paramsBase = { prd_name: 'ALL PRODUCT', proc_disp: 'ALL PROCESS' };
    } else if (!selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      paramsBase = { prd_name: 'ALL PRODUCT', proc_disp: selectedProcess.proc_disp };
    } else if (selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      paramsBase = { prd_name: selectedProduct.prd_name, proc_disp: 'ALL PROCESS' };
    } else if (selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      paramsBase = { prd_name: selectedProduct.prd_name, proc_disp: selectedProcess.proc_disp };
    }
    let totalRows = 0;
    try {
      const res = await axios.get(url, { params: { ...paramsBase, page: 1, pageSize: 1 }, cancelToken: cancelTokenSource.token });
      if (res.data && typeof res.data.total === 'number') {
        totalRows = res.data.total;
      } else if (Array.isArray(res.data.rows)) {
        totalRows = res.data.rows.length;
      } else if (Array.isArray(res.data)) {
        totalRows = res.data.length;
      }
    } catch (err) {
      setExportProgress({ percent: 0, loaded: 0, total: 0, done: true, error: true });
      setExporting(false);
      setExportCancelToken(null);
      await Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred while fetching data.', confirmButtonColor: '#1976d2' });
      return;
    }
    // 2. Set progress state ก่อนเริ่ม export
    setExportProgress({ percent: 0, loaded: 0, total: totalRows, done: false, error: false });
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // Header
      const headers = [
        "Factory",
        "Unit",
        "Process",
        "Product",
        "Item",
        "Sec/Pcs",
        "Remark",
      ];
      worksheet.addRow(headers);
      headers.forEach((header, idx) => {
        const cell = worksheet.getRow(1).getCell(idx + 1);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0057B7" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      if (!totalRows || totalRows === 0) {
        worksheet.addRow(["", "", "", "", "", "", "NO DATA"]);
        await Swal.fire({ icon: 'info', title: 'No Data', text: 'No data available for export.', confirmButtonColor: '#1976d2' });
      } else {
        // 3. Fetch in chunks
        const chunkSize = 20000;
        let loaded = 0;
        let allRows = [];
        for (let pageIdx = 1; allRows.length < totalRows; pageIdx++) {
          if (exportCancelToken && exportCancelToken.token.reason) {
            setExportProgress({ percent: 0, loaded: allRows.length, total: totalRows, done: true, error: true, cancelled: true });
            setExporting(false);
            setExportCancelToken(null);
            await Swal.fire({ icon: 'warning', title: 'Export Cancelled', text: 'Export has been cancelled.', confirmButtonColor: '#1976d2' });
            return;
          }
          let params = { ...paramsBase, page: pageIdx, pageSize: chunkSize };
          let rows = [];
          try {
            const res = await axios.get(url, { params, cancelToken: cancelTokenSource.token });
            if (res.data && Array.isArray(res.data.rows)) {
              rows = res.data.rows;
            } else if (Array.isArray(res.data) && res.data.length > 0) {
              rows = res.data;
            }
          } catch (err) {
            if (axios.isCancel(err)) {
              setExportProgress({ percent: 0, loaded: allRows.length, total: totalRows, done: true, error: true, cancelled: true });
              setExporting(false);
              setExportCancelToken(null);
              await Swal.fire({ icon: 'warning', title: 'Export Cancelled', text: 'Export has been cancelled.', confirmButtonColor: '#1976d2' });
            } else {
              setExportProgress({ percent: 100, loaded: allRows.length, total: totalRows, done: true, error: true });
              setExporting(false);
              setExportCancelToken(null);
              await Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred while fetching data.', confirmButtonColor: '#1976d2' });
            }
            return;
          }
          if (!rows || rows.length === 0) break;
          // Write each row to worksheet as soon as it's loaded
          rows.forEach((row) => {
            worksheet.addRow([
              row.factory_desc || row.factory || "",
              row.unit_desc || row.unit || "",
              row.proc_disp || row.process || paramsBase.proc_disp || "",
              row.prd_name || row.product || paramsBase.prd_name || "",
              row.prd_item || row.item || "",
              row.sec_pcs ?? row.sec_per_pcs ?? "",
              row.similar_type || row.remark || "",
            ]);
          });
          allRows = allRows.concat(rows);
          // --- FIX: progress 100% เฉพาะเมื่อครบจริง ---
          let percent = Math.floor((allRows.length / totalRows) * 100);
          if (allRows.length < totalRows) {
            percent = Math.min(percent, 99);
          } else {
            percent = 100;
          }
          setExportProgress({
            percent,
            loaded: allRows.length,
            total: totalRows,
            done: allRows.length === totalRows,
            error: false
          });
          setProgressLoaded(allRows.length);
          await new Promise((resolve) => setTimeout(resolve, 10)); // allow UI update
        }
        // Success Swal after download
        // Data style
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.font = { size: 13 };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });
        worksheet.getColumn(7).width = 95;
        worksheet.getColumn(7).alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.columns.forEach((column, idx) => {
          if (idx !== 6) column.width = 18;
        });
        // Download
        const buf = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buf]), "StandardTimeSimilarStructure.xlsx");
        // ปิด dialog exporting ทันทีหลังโหลดเสร็จ
        setExportProgress({ percent: 100, loaded: totalRows, total: totalRows, done: true, error: false });
        setExporting(false);
        setExportCancelToken(null);
        await Swal.fire({ icon: 'success', title: 'Export Completed', text: 'Excel file saved successfully.', confirmButtonColor: '#1976d2' });
      }
    } catch {
      setExportProgress({ percent: 100, loaded: 0, total: 0, done: true, error: true });
      await Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred during export.', confirmButtonColor: '#1976d2' });
    }
    setExporting(false);
    setExportCancelToken(null);
  };

  const handleCancelExport = () => {
    if (exportCancelToken) {
      exportCancelToken.cancel('Export cancelled by user');
    }
  };

  // -------------------- Render --------------------
  // Pagination Controls UI
  const PaginationControls = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '18px 0 8px 0', fontSize: '16px', fontWeight: 500 }}>
      <button 
        onClick={() => page > 1 && handleSearch(page - 1, pageSize)} 
        disabled={page === 1} 
        style={{
          marginRight: 12,
          padding: '6px 18px',
          background: page === 1 ? '#e0e0e0' : '#1976d2',
          color: page === 1 ? '#888' : '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 15,
          cursor: page ===  1 ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
        }}
      >Prev</button>
      <span style={{marginRight: 12}}>Page {Number(page) || 1} / {Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1}</span>
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
        placeholder="Page"
        style={{
          width: 60,
          marginRight: 6,
          padding: '6px 8px',
          fontSize: 15,
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
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
        }}
      >Go</button>
      <button 
        onClick={() => (page * pageSize < total) && handleSearch(page + 1, pageSize)} 
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
          fontSize: 15,
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
            fontSize: 15,
            fontWeight: 600,
            border: '2px solid #1976d2',
            borderRadius: 6,
            background: '#f5faff',
            color: '#1976d2',
            outline: 'none',
            boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
          }}
        >
          {[20, 50, 100].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </span>
    </div>
  );
  return (
    <>
      <div style={pageBg}></div>
      <Navbar onToggle={handleNavbarToggle} />
      <Box marginLeft={isNavbarOpen ? "220px" : 4} marginTop={8}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 40,
            gap: "24px",
            background: "rgba(255,255,255,0.92)",
            minHeight: "700px",
            borderRadius: 28,
            boxShadow: "0 8px 32px 0 rgba(0,87,183,0.13)",
            maxWidth: "1700px",
            width: "96vw",
            margin: "0 auto",
            /* overflow: "hidden",  // Removed to allow sticky header to work */
            position: 'relative',
          }}
        >
          {/* Decorative floating shapes */}
          <div style={{
            position: 'absolute',
            top: -60,
            right: 40,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at 40% 60%,rgb(8, 170, 229) 0%, #1976d2 100%)',
            opacity: 0.18,
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(2px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -50,
            left: 60,
            width: 90,
            height: 90,
            background: 'radial-gradient(circle at 60% 40%, #ffb6b9 0%, #f7cac9 100%)',
            opacity: 0.13,
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(2px)'
          }} />
          {/* Title Section */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: -5,
            zIndex: 1,
          }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: '#1976d2',
              marginBottom: -3,
              textShadow: '0 2px 12px #b3d8ff',
              fontFamily: 'Segoe UI, Poppins, sans-serif',
            }}>
              Standard Time Similar Structure
            </h1>
            <div style={{
              fontSize: 20,
              color: '#4a6fa1',
              fontWeight: 400,
              marginBottom: -15,
              fontFamily: 'Segoe UI, Poppins, sans-serif',
            }}>
              Effortlessly compare and analyze standard times by product and process
            </div>
          </div>
          {/* Search Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8, // ลดช่องว่างระหว่าง Product/Process
              marginBottom: -50,
              width: "100%",
              maxWidth: 2200,
              margin: "0 auto",
              background: "linear-gradient(90deg, #e3f0ff 60%, #f7fafd 100%)",
              borderRadius: 18,
              boxShadow: "0 4px 18px 0 rgba(0,87,183,0.09)",
              padding: 28,
              zIndex: 1,
            }}
          >
            {/* Product Autocomplete */}
            <div style={{ minWidth: 270, flex: 1 }}>
              <Autocomplete
                open={productOpen}
                onOpen={() => setProductOpen(true)}
                onClose={() => setProductOpen(false)}
                freeSolo
                options={productOptions}
                loading={productLoading}
                value={selectedProduct}
                inputValue={productInput}
                onChange={(event, newValue) => {
                  setSelectedProduct(newValue);
                  setSelectedProcess(null);
                  setProcessInput("");
                }}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.prd_name || ""
                }
                isOptionEqualToValue={(option, value) =>
                  (option.prd_name || "") === (value.prd_name || "")
                }
                onInputChange={(event, newInputValue) =>
                  setProductInput(newInputValue)
                }
                renderOption={(props, option, { index }) => (
                  <li {...props} key={(option.prd_name || "") + index}>
                    {option.prd_name || ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product Name"
                    variant="outlined"
                    size="medium"
                    style={{ width: 270, background: '#fff', borderRadius: 8 }}
                  />
                )}
                style={{ width: "100%" }}
              />
            </div>
            {/* Process Autocomplete */}
            <div style={{ minWidth: 270, flex: 1 }}>
              <Autocomplete
                open={processOpen}
                onOpen={() => setProcessOpen(true)}
                onClose={() => setProcessOpen(false)}
                freeSolo
                options={processOptions}
                loading={processLoading}
                value={selectedProcess}
                inputValue={processInput}
                onChange={(event, newValue) => setSelectedProcess(newValue)}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.proc_disp || ""
                }
                isOptionEqualToValue={(option, value) =>
                  (option.proc_disp || "") === (value.proc_disp || "")
                }
                onInputChange={(event, newInputValue) =>
                  setProcessInput(newInputValue)
                }
                renderOption={(props, option, { index }) => (
                  <li {...props} key={(option.proc_disp || "") + index}>
                    {option.proc_disp || ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Process"
                    variant="outlined"
                    size="medium"
                    style={{ width: 270, background: '#fff', borderRadius: 8 }}
                  />
                )}
                style={{ width: "100%" }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                width: "100%",
                marginLeft: 0,
                zIndex: 1,
              }}
            >
              <Button
                className="action-btn"
                variant="contained"
                color="primary"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  boxShadow: '0 2px 8px #b3d8ff',
                  fontSize: 18,
                }}
                onClick={handleSearch}
                title="Search"
              >
                <SearchIcon style={{ fontSize: 28 }} />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="error"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  fontSize: 18,
                }}
                onClick={handleClearSearch}
                title="Clear"
              >
                <img
                  src="/clear1.png"
                  alt="Clear"
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="info"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  fontSize: 18,
                }}
                onClick={handleRefreshTable}
                title="Refresh"
              >
                <img
                  src="/ref.png"
                  alt="Refresh"
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="success"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  fontSize: 18,
                }}
                onClick={handleExportExcel}
                title="Export to Excel"
                disabled={exporting}
              >
                <img
                  src="/excel.png"
                  alt="Excel"
                  style={{
                    width: 26,
                    height: 26,
                    opacity: exporting ? 0.5 : 1
                  }}
                />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="secondary"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  fontSize: 18,
                }}
                onClick={handleSendTableData}
                title="Send Table Data"
              >
                <img
                  src="/update.png"
                  alt="Send"
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
              </Button>
            </div>
          </div>

          {/* Table Section + Pagination Controls Top Right */}
          <div
            style={{
              width: "100%",
              minWidth: "1200px",
              maxWidth: "1700px",
              overflowX: "auto",
              maxHeight: 520,
              overflowY: "auto",
              margin: "32px auto 0 auto",
              background: "rgba(255,255,255,0.98)",
              borderRadius: 18,
              boxShadow: "0 4px 18px 0 rgba(0,87,183,0.09)",
              zIndex: 1,
              position: 'relative',
            }}
          >
            {/* Pagination Controls Top Right */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.98)', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
              {PaginationControls}
            </div>
            <table className="custom-table beautiful-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, height: 28 }}>Factory</th>
                  <th style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, height: 28 }}>Unit</th>
                  <th style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, height: 28 }}>Process</th>
                  <th style={{ textAlign: 'center', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 4, paddingBottom: 4, height: 28 }}>Product</th>
                  <th style={{ textAlign: 'center', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 4, paddingBottom: 4, height: 28 }}>Item</th>
                  <th style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, height: 28 }}>Sec/Pcs</th>
                  <th style={{ textAlign: 'center', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 4, paddingBottom: 4, height: 28 }}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.factory}</td>
                      <td style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.unit}</td>
                      <td style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.process}</td>
                      <td style={{ textAlign: 'left', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.product}</td>
                      <td style={{ textAlign: 'left', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.item}</td>
                      <td style={{ fontSize: '14px', paddingLeft: 8, paddingRight: 8, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.sec_per_pcs}</td>
                      <td style={{ textAlign: 'left', fontSize: '14px', paddingLeft: 10, paddingRight: 6, paddingTop: 1, paddingBottom: 1, height: 28 }}>{row.remark}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", color: "#aaa" }}
                    >
                      No DATA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <style>{`
            .beautiful-table {
              border-collapse: separate;
              border-spacing: 0;
              width: 100%;
              min-width: 1200px;
              border: 2px solid #1976d2;
              box-shadow: 0 4px 18px 0 rgba(0,87,183,0.09);
              background: #fff;
              margin: 0 auto;
              border-radius: 18px;
              overflow: hidden;
              font-family: 'Segoe UI', 'Poppins', sans-serif;
            }
            .beautiful-table th, .beautiful-table td {
              border: 1.5px solid rgba(4, 4, 4, 0.47);
              padding: 12px 10px;
              text-align: center;
              font-size: 15px;
              white-space: nowrap;
              background-clip: padding-box;
              transition: background 0.18s;
            }
            .beautiful-table th {
              background: linear-gradient(90deg,rgb(11, 91, 171) 60%,rgb(11, 63, 159) 100%);
              color: #fff;
              font-weight: 700;
              font-size: 17px;
              letter-spacing: 0.7px;
              position: sticky;
              top: 0;
              z-index: 2;
              border-top: none;
              box-shadow: 0 2px 8px 0 rgba(0,87,183,0.07);
            }
            .beautiful-table tr {
              height: 44px;
              transition: background 0.18s;
            }
            .beautiful-table tbody tr:nth-child(even) {
              background: #f6fafd;
            }
            .beautiful-table tbody tr:hover {
              background: #e3f0ff;
            }
            .beautiful-table td {
              border-bottom: 1.5px solid #e0e7ef;
              font-size: 15px;
            }
            .beautiful-table tr:last-child td {
              border-bottom: none;
            }
            .action-btn {
              transition: box-shadow 0.18s, transform 0.18s, background 0.18s, border-color 0.18s;
              border-radius: 12px !important;
            }
            .action-btn:hover {
              box-shadow: 0 4px 16px rgba(0,87,183,0.13);
              transform: translateY(-2px) scale(1.10);
              background:rgb(99, 177, 250) !important;
              border-color: #1976d2 !important;
            }
            @media (max-width: 1300px) {
              .beautiful-table {
                min-width: 900px;
              }
            }
            @media (max-width: 1100px) {
              .beautiful-table {
                min-width: 700px;
              }
            }
          `}</style>
        </div>
      </Box>
      {/* Dialog Section */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { textAlign: "center", padding: 32, borderRadius: 18, background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' },
        }}
      >
        <DialogTitle>
          <InfoIcon style={{ fontSize: 54, color: "#1976d2" }} />
        </DialogTitle>
        <DialogContent>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 18, color: '#1976d2' }}>
            {dialog.message}
          </div>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            style={{ minWidth: 90, fontWeight: 600, fontSize: 18, borderRadius: 8 }}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>

      {/* Export Progress Dialog */}
      {exporting && (
        <Dialog open={true} maxWidth="xs" fullWidth PaperProps={{
          style: {
            background: '#fff',
            boxShadow: '0 8px 32px 0 rgba(76, 153, 235, 0.18)',
            borderRadius: 24,
            padding: 0,
            overflow: 'visible',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid #1976d2',
            minWidth: 380,
            maxWidth: 480,
            position: 'relative',
          }
        }}>
          <DialogTitle style={{
            textAlign: 'center',
            fontWeight: 800,
            color: '#1976d2',
            fontSize: 30,
            letterSpacing: 1.2,
            background: 'linear-gradient(90deg,rgb(0, 132, 255) 60%,rgb(11, 128, 238) 100%)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '28px 0 18px 0',
            marginBottom: 0,
            boxShadow: '0 2px 12px 0 rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: 1.2,
              color: 'rgb(255, 255, 255)',
            }}>EXPORTING EXCEL</span>
          </DialogTitle>
          <DialogContent style={{
            textAlign: 'center',
            padding: '32px 32px 24px 32px',
            background: 'transparent',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            position: 'relative',
          }}>
            <div style={{ margin: '18px 0 12px 0', width: '100%' }}>
              {/* Glassy progress bar */}
              <div style={{
                width: '100%',
                height: 22,
                background: 'rgba(230,240,255,0.7)',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 18,
                boxShadow: '0 2px 12px 0 #b3d8ff',
                border: '1.5px solid #1976d2',
                position: 'relative',
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1976d2 60%, #0baae5 100%)',
                  transition: 'width 0.25s cubic-bezier(.4,2,.6,1)',
                  borderRadius: 12,
                  boxShadow: '0 2px 12px 0 #b3d8ff',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }} />
                {/* Animated shimmer */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.18) 100%)',
                  animation: 'shimmer 1.2s infinite',
                  borderRadius: 12,
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2', marginBottom: 8, letterSpacing: 0.5 }}>
                Progress: <span style={{ color: '#0baae5' }}>{Math.min(100, Math.round(progressPercent))}%</span>
              </div>
              <div style={{ fontSize: 17, color: '#1976d2', marginBottom: 8, fontWeight: 500 }}>
                Loaded <span style={{ color: '#1976d2', fontWeight: 700 }}>{progressLoaded.toLocaleString()}</span> / <span style={{ color: '#1976d2', fontWeight: 700 }}>{exportProgress.total.toLocaleString()}</span> rows
              </div>
              {/* --- Add page/chunk info --- */}
              {exportProgress.total > 0 && (
                <div style={{ fontSize: 15, color: '#1976d2', marginBottom: 2, fontWeight: 500 }}>
                  Page <span style={{ color: '#1976d2', fontWeight: 700 }}>{Math.max(1, Math.ceil(progressLoaded / 20000))}</span> / <span style={{ color: '#1976d2', fontWeight: 700 }}>{Math.max(1, Math.ceil(exportProgress.total / 20000))}</span>
                </div>
              )}
            </div>
            {!exportProgress.done && (
              <Button variant="contained" color="error" style={{
                marginTop: 18,
                fontWeight: 800,
                fontSize: 20,
                borderRadius: 12,
                padding: '12px 38px',
                background: 'linear-gradient(90deg, #e53935 60%,rgb(214, 50, 56) 100%)',
                color: '#fff',
                boxShadow: '0 2px 12px 0 #e53935',
                letterSpacing: 1.1,
                textShadow: '0 1px 8px #e53935',
                border: 'none',
                transition: 'background 0.18s, box-shadow 0.18s',
              }} onClick={handleCancelExport}>
                CANCEL
              </Button>
            )}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: 200px 0; }
              }
            `}</style>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
