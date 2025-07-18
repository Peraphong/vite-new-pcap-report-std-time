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
  // ดึง user info แค่รอบเดียว ไม่ log ทุก render
  const userInfoRef = useRef(null);
  if (userInfoRef.current === null) {
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
        // log สำหรับ debug (แค่รอบเดียว)
        console.log({ userName, userSurname, ShortSurname, update_by, userEmpID, userUpperName, UpperUpdate_By });
        userInfoRef.current = { userName, userSurname, ShortSurname, update_by, userEmpID, userUpperName, UpperUpdate_By };
      }
    } catch (e) {
      // ถ้า error จะได้ string ว่างทั้งหมด
      userInfoRef.current = {};
    }
  } else {
    // ใช้ค่าจาก ref
    ({ userName, userSurname, ShortSurname, update_by, userEmpID, userUpperName, UpperUpdate_By } = userInfoRef.current);
  }

  // --- Loading percent state for overlay (only for sand to data) ---
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingLoaded, setLoadingLoaded] = useState(0);
  const [loadingSandToData, setLoadingSandToData] = useState(false);
  // State สำหรับ disable ปุ่ม sand table data
  const [sandButtonDisabled, setSandButtonDisabled] = useState(false);
  // Ref for canceling Sand to Data loading
  const sandToDataCancelRef = useRef(false);
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
  // สำหรับ animation progress bar แบบ chunk
  const [progressTarget, setProgressTarget] = useState(0); // เป้าหมาย %
  const [progressAnimDuration, setProgressAnimDuration] = useState(0); // ms
  const progressAnimStart = useRef(Date.now());
  const progressAnimFrom = useRef(0);
  const progressAnimTimer = useRef(null);

  // Ref for export cancel token
  const exportCancelTokenRef = useRef(null);

  // -------------------- Effect --------------------

  // Animate progress bar: วิ่งจากค่าเดิมไปเป้าหมายใหม่ในเวลาที่กำหนด
  useEffect(() => {
    if (!exporting) {
      setProgressPercent(0);
      setProgressTarget(0);
      setProgressAnimDuration(0);
      if (progressAnimTimer.current) clearInterval(progressAnimTimer.current);
      return;
    }
    if (progressPercent === progressTarget) return;
    if (progressAnimDuration <= 0) {
      setProgressPercent(progressTarget);
      return;
    }
    if (progressAnimTimer.current) clearInterval(progressAnimTimer.current);
    const start = Date.now();
    const from = progressPercent;
    const to = progressTarget;
    const duration = progressAnimDuration;
    progressAnimStart.current = start;
    progressAnimFrom.current = from;
    progressAnimTimer.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - start;
      if (elapsed >= duration) {
        setProgressPercent(to);
        clearInterval(progressAnimTimer.current);
        return;
      }
      const percent = from + (to - from) * (elapsed / duration);
      setProgressPercent(percent);
    }, 16);
    return () => { if (progressAnimTimer.current) clearInterval(progressAnimTimer.current); };
    // eslint-disable-next-line
  }, [progressTarget, progressAnimDuration, exporting]);

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

  // เมื่อ exportProgress เปลี่ยน (เช่น โหลด chunk ใหม่) ให้ set progressTarget และ duration
  const lastChunkTime = useRef(Date.now());
  useEffect(() => {
    if (!exporting) return;
    // อย่า animate ถ้าเสร็จแล้ว
    if (exportProgress.done) {
      setProgressTarget(100);
      setProgressAnimDuration(400);
      setProgressLoaded(exportProgress.loaded);
      return;
    }
    // คำนวณ % เป้าหมายใหม่
    const percent = exportProgress.total > 0 ? (exportProgress.loaded / exportProgress.total) * 100 : 0;
    // คำนวณเวลาที่ใช้โหลด chunk นี้จริง (ms)
    const now = Date.now();
    let duration = now - lastChunkTime.current;
    // จำกัด min/max duration เพื่อความ smooth
    if (duration < 300) duration = 300;
    if (duration > 2000) duration = 2000;
    setProgressTarget(percent);
    setProgressAnimDuration(duration);
    setProgressLoaded(exportProgress.loaded);
    lastChunkTime.current = now;
  }, [exportProgress.loaded, exportProgress.total, exportProgress.done, exporting]);


  // ฟังก์ชัน MOCK สำหรับส่งข้อมูลทั้งหมดไปยัง API (ยังไม่เชื่อมต่อ API จริง)
  const handleSendTableData = async () => {
    // Disable ปุ่มทันทีที่เริ่ม process
    setSandButtonDisabled(true);
    // Check if user selected all product and all process
    const isAllProduct = !selectedProduct || selectedProduct === 'All Product' || selectedProduct.prd_name === 'All Product';
    const isAllProcess = !selectedProcess || selectedProcess === 'All Process' || selectedProcess.proc_disp === 'All Process';
    // Check if tableData is empty or total is 0
    if (!total || total === 0) {
      await Swal.fire({
        icon: 'info',
        title: '<div style="font-size:24px;font-weight:700;color:#1976d2;">Please select table data</div>',
        html: `<div style='font-size:18px;color:#333;margin-top:8px;'>You must select at least one record before updating.</div>`,
        confirmButtonText: '<span style="font-size:18px;font-weight:600;padding:4px 18px;">OK</span>',
        customClass: {
          popup: 'swal2-dialog',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
          confirmButton: 'swal2-confirm',
        },
        background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
        width: 420,
        padding: '32px 18px 24px 18px',
        buttonsStyling: false,
        showClass: {
          popup: 'swal2-show'
        },
        hideClass: {
          popup: 'swal2-hide'
        }
      });
      setSandButtonDisabled(false);
      return;
    }
    // --- Immediate Swal with progress and Cancel only ---
    let cancelled = false;
    sandToDataCancelRef.current = false;
    let progressText = '';
    await Swal.fire({
      title: '<div style="font-size:28px;font-weight:700;color:#1976d2;">Checking data<br>Please wait</div>',
      html: `<div id="swal-progress-text" style='font-size:18px;color:#333;margin-top:8px;'>Preparing data</div>
        <div style='margin:12px 0 0 0;'><img src="/public/data-cloud.gif" alt="Loading" style="width:90px;height:90px;object-fit:contain;display:block;margin:0 auto 8px auto;" /></div>
        <div style='margin-top:10px;'><button id="swal-cancel-btn" style="font-size:16px;padding:6px 24px;background:#e53935;color:#fff;border:none;border-radius:6px;cursor:pointer;">Cancel</button></div>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
      width: 420,
      padding: '32px 18px 24px 18px',
      customClass: {
        popup: 'swal2-dialog',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
      },
      didOpen: async () => {
        // Add cancel event
        const cancelBtn = document.getElementById('swal-cancel-btn');
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            cancelled = true;
            sandToDataCancelRef.current = true;
            Swal.close();
          };
        }
        // --- fetch all data ---
        let url = `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure`;
        let params = {};
        if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
          params = { prd_name: 'ALL PRODUCT', proc_disp: 'ALL PROCESS' };
        } else if (!selectedProduct?.prd_name && selectedProcess?.proc_disp) {
          params = { prd_name: 'ALL PRODUCT', proc_disp: selectedProcess.proc_disp };
        } else if (selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
          params = { prd_name: selectedProduct.prd_name, proc_disp: 'ALL PROCESS' };
        } else if (selectedProduct?.prd_name && selectedProcess?.proc_disp) {
          params = { prd_name: selectedProduct.prd_name, proc_disp: selectedProcess.proc_disp };
        }
        // 1. ดึงจำนวนทั้งหมดก่อน
        let totalRows = 0;
        try {
          const res = await axios.get(url, { params: { ...params, page: 1, pageSize: 1 } });
          if (res.data && typeof res.data.total === 'number') {
            totalRows = res.data.total;
          } else if (Array.isArray(res.data.rows)) {
            totalRows = res.data.rows.length;
          } else if (Array.isArray(res.data)) {
            totalRows = res.data.length;
          }
        } catch (err) {
          document.getElementById('swal-progress-text').innerHTML = 'Cannot fetch all data from server.';
          setTimeout(() => Swal.close(), 1200);
          setSandButtonDisabled(false);
          return;
        }
        if (!totalRows || totalRows === 0) {
          document.getElementById('swal-progress-text').innerHTML = 'No data to process.';
          setTimeout(() => Swal.close(), 1200);
          setSandButtonDisabled(false);
          return;
        }
        // 2. ดึงข้อมูลทุกหน้า (chunk) + update progress
        let allRows = [];
        const chunkSize = 20000;
        let loadedCount = 0;
        for (let pageIdx = 1; allRows.length < totalRows; pageIdx++) {
          if (cancelled) break;
          try {
            const res = await axios.get(url, { params: { ...params, page: pageIdx, pageSize: chunkSize } });
            let rows = [];
            if (res.data && Array.isArray(res.data.rows)) {
              rows = res.data.rows;
            } else if (Array.isArray(res.data)) {
              rows = res.data;
            }
            if (rows.length === 0) break;
            allRows = allRows.concat(rows);
            loadedCount = allRows.length;
            // อัปเดต progress
            const progressText = document.getElementById('swal-progress-text');
            if (progressText) {
              progressText.innerHTML = `Loading data... <b>${loadedCount.toLocaleString()}</b> / <b>${totalRows.toLocaleString()}</b> records`;
            }
          } catch (err) {
            break;
          }
        }
        if (cancelled) {
          setSandButtonDisabled(false);
          return;
        }
        // ปิด Swal loading หลังโหลดข้อมูลครบ
        // Prepare data for API ให้ตรงกับ backend (ใช้ allRows จริง)
        const logData = allRows.map(row => ({
          prd_item: row.prd_item || row.item || '',
          proc_id: row.proc_id || '',
          secpcs: row.sec_pcs ?? row.stdtime_secpcs ?? row.sec_per_pcs ?? '',
          create_by: userEmpID || update_by || '',
          update_by: userEmpID || update_by || '',
          remark: row.remark || row.similar_type || '',
        }));

        // --- Grouping/Unique by key (prd_item, proc_id) ---
        const uniqueKeyMap = new Map();
        logData.forEach((row, idx) => {
          const key = `${row.prd_item}__${row.proc_id}`;
          if (!uniqueKeyMap.has(key)) {
            uniqueKeyMap.set(key, { ...row, _allIdx: [idx] });
          } else {
            uniqueKeyMap.get(key)._allIdx.push(idx);
          }
        });
        const uniqueLogData = Array.from(uniqueKeyMap.values());

        // --- Fast duplicate check: parallel batch + update Swal progress ---
        const batchSizeCheck = 1000;
        let checkResults = [];
        let checkedCount = 0;
        for (let i = 0; i < uniqueLogData.length; i += batchSizeCheck) {
          if (cancelled) break;
          const batch = uniqueLogData.slice(i, i + batchSizeCheck);
          if (i === 0) {
            window.__swalStartTime = Date.now();
          }
          let batchResults = new Array(batch.length);
          let finished = 0;
          // --- worker pool: limit concurrent requests ---
          const maxConcurrent = 20;
          let inFlight = 0;
          let nextIdx = 0;
          await new Promise((resolve) => {
            function launchNext() {
              if (cancelled) return resolve();
              while (inFlight < maxConcurrent && nextIdx < batch.length) {
                const j = nextIdx++;
                inFlight++;
                (async () => {
                  if (cancelled) { inFlight--; return; }
                  const record = batch[j];
                  const { prd_item, proc_id, secpcs, remark } = record;
                  let result;
                  try {
                    const filterUrlPair = `http://10.17.100.115:3005/api/smart_pcap_ora/filter-count-std-time-fix?prd_item=${prd_item}&proc_id=${proc_id}`;
                    const response = await axios.get(filterUrlPair);
                    const data = response.data;
                    if (data && data.length > 0 && data[0]) {
                      const stdtimeSecpcs = data[0].stdtime_secpcs;
                      const stdtimeRemark = data[0].remark ?? data[0].similar_type ?? '';
                      // Compare both secpcs and remark
                      const isSecpcsDifferent = (isNaN(Number(secpcs)) || isNaN(Number(stdtimeSecpcs)))
                        ? (secpcs !== stdtimeSecpcs)
                        : (Math.abs(Number(secpcs) - Number(stdtimeSecpcs)) > 1e-8);
                      const isRemarkDifferent = (remark ?? '') !== (stdtimeRemark ?? '');
                      if (isSecpcsDifferent || isRemarkDifferent) {
                        // Only update if either secpcs or remark is different
                        axios.get(`http://10.17.100.115:3005/api/smart_pcap_ora/update-sec-pcs-remark-std-fix?secpcs=${secpcs}&remark=${remark}&prd_item=${prd_item}&proc_id=${proc_id}`);
                      }
                      result = { type: 'duplicate', prd_item, proc_id, secpcs };
                    } else {
                      result = { type: 'unique', record };
                    }
                  } catch (error) {
                    result = { type: 'unique', record };
                  }
                  batchResults[j] = result;
                  finished++;
                  checkedCount = Math.min(i + finished, uniqueLogData.length);
                  // อัปเดต progress พร้อมเวลา ทุกครั้งที่เช็คเสร็จ 1 ตัว (ขนาน)
                  const progressText = document.getElementById('swal-progress-text');
                  if (progressText) {
                    const now = Date.now();
                    const elapsed = window.__swalStartTime ? now - window.__swalStartTime : 0;
                    const avgMsPerRecord = checkedCount > 0 ? elapsed / checkedCount : 0;
                    const remaining = uniqueLogData.length - checkedCount;
                    const estMsLeft = Math.round(avgMsPerRecord * remaining);
                    const estMin = Math.floor(estMsLeft / 60000);
                    const estSec = Math.floor((estMsLeft % 60000) / 1000);
                    const estTimeStr = `${estMin}:${estSec.toString().padStart(2, '0')} min`;
                    progressText.innerHTML = `
                      <div style="text-align:center;">
                        <span>Checking for duplicate records... </span>
                        <span style="font-size:20px;font-weight:700;color:#1976d2;">
                          <b>${checkedCount.toLocaleString()}</b>
                        </span>
                        <span style="font-size:20px;font-weight:700;color:#333;"> / </span>
                        <span style="font-size:20px;font-weight:700;color:#1976d2;">
                          <b>${uniqueLogData.length.toLocaleString()}</b>
                        </span>
                        <span style="font-size:16px;color:#333;"> records</span>
                        <div style='font-size:15px;color:#1976d2;margin-top:2px;'>Estimated time left: ${estTimeStr}</div>
                      </div>
                    `;
                  }
                  inFlight--;
                  if (finished === batch.length) return resolve();
                  launchNext();
                })();
              }
            }
            launchNext();
          });
        checkResults = checkResults.concat(batchResults);
      }
      if (cancelled) {
        setSandButtonDisabled(false);
        return;
      }
      Swal.close();
      // --- Map duplicate result กลับไปยัง logData เดิม ---
      const duplicateKeySet = new Set(
        checkResults.filter(r => r.type === 'duplicate').map(r => `${r.prd_item}__${r.proc_id}`)
      );
      const duplicateList = [];
      const uniqueRecords = [];
      logData.forEach(row => {
        const key = `${row.prd_item}__${row.proc_id}`;
        if (duplicateKeySet.has(key)) {
          duplicateList.push(`${row.prd_item}, ${row.proc_id}, ${row.secpcs}`);
        } else {
          uniqueRecords.push(row);
        }
      });
      const duplicateCount = duplicateList.length;
      // แจ้งเตือนผลลัพธ์การเช็คซ้ำ
      if (duplicateCount > 0) {
        let displayList = duplicateList;
        let truncated = false;
        if (duplicateList.length > 4) {
          displayList = duplicateList.slice(0, 4);
          truncated = true;
        }
        await Swal.fire({
          icon: 'warning',
          title: `<div style='font-size:28px;font-weight:700;color:#333;'>Duplicate Data Found</div>`,
          html: `
            <div style='text-align:left;padding:8px 0 0 0;'>
              <div style='font-size:18px;color:#1976d2;font-weight:600;margin-bottom:10px;'>Found <b>${duplicateCount}</b> duplicate records.</div>
              <div style='font-size:16px;color:#333;margin-bottom:8px;'><b>Duplicate List:</b></div>
              <div style='max-height:120px;overflow:auto;background:#fafdff;border-radius:8px;border:1px solid #e3f0ff;padding:8px 12px;margin-bottom:18px;'>
                ${displayList.map(item => `<div style='font-size:15px;color:#e53935;padding:2px 0;'>${item}</div>`).join('')}
                ${truncated ? `<div style='font-size:15px;color:#e53935;padding:2px 0;'>...</div>` : ''}
              </div>
              <div style='font-size:16px;color:#333;margin-bottom:0;'>Only non-duplicate records will be sent (${uniqueRecords.length} records).</div>
            </div>
          `,
          confirmButtonText: '<span style="font-size:18px;font-weight:600;padding:4px 18px;">OK, Send Non-Duplicate</span>',
          showCancelButton: false,
          customClass: {
            popup: 'swal2-dialog',
            title: 'swal2-title',
            htmlContainer: 'swal2-html-container',
            confirmButton: 'swal2-confirm',
          },
          background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
          width: 480,
          padding: '32px 18px 24px 18px',
          buttonsStyling: false,
          showClass: { popup: 'swal2-show' },
          hideClass: { popup: 'swal2-hide' }
        });
      }
      // ส่งข้อมูลที่ไม่ซ้ำ (หรือทั้งหมดถ้าไม่มีซ้ำ)
      const toInsert = duplicateCount > 0 ? uniqueRecords : logData;
        if (toInsert.length > 0) {
          setLoadingSandToData(true);
          setLoadingPercent(0);
          setLoadingLoaded(0);
          const batchSize = 100;
          for (let i = 0; i < toInsert.length; i += batchSize) {
            if (sandToDataCancelRef.current) break;
            const batch = toInsert.slice(i, i + batchSize);
            await Promise.all(batch.map(async (rec) => {
              try {
                await axios.get('http://10.17.100.115:3005/api/smart_pcap_ora/insert-std-time-product-fix', { params: rec });
              } catch (error) {}
            }));
            setLoadingLoaded(Math.min(i + batch.length, toInsert.length));
            setLoadingPercent(Math.round((Math.min(i + batch.length, toInsert.length) / toInsert.length) * 100));
          }
          setLoadingSandToData(false);
          await Swal.fire({
            icon: 'success',
            title: 'Insert Completed',
            html: `<div style='font-size:18px;'>Successfully sent <b>${toInsert.length.toLocaleString()}</b> records.<br>Duplicate records were not inserted.</div>`,
            confirmButtonColor: '#1976d2'
          });
          setLoadingPercent(0);
          setLoadingLoaded(0);
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'No Data to Insert',
            html: `<div style='font-size:18px;'>No new records to insert.</div>`,
            confirmButtonColor: '#1976d2'
          });
        }
      }
    });
    setSandButtonDisabled(false);
    // ...existing code for after process...
  };
  // ...existing code...
  // Modern, beautiful background for the whole page
  const pageBg = {
    minHeight: '100vh',
    width: '100vw',
    background: `
      radial-gradient(ellipse at 80% 0%, #e3f0ff 0%, #fafdff 60%, #e3f0ff 100%),
      linear-gradient(120deg, #e3f0ff 0%, #fafdff 100%)
    `,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: 'hidden',
  };

  // -------------------- Handler (single definition zone) --------------------
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
    // setLoading(true); // Remove loading overlay for search
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
          proc_id: row.proc_id || '',
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
          proc_id: row.proc_id || '',
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
      // setLoading(false); // Remove loading overlay for search
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
    exportCancelTokenRef.current = axios.CancelToken.source();
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
      const res = await axios.get(url, { params: { ...paramsBase, page: 1, pageSize: 1 }, cancelToken: exportCancelTokenRef.current.token });
      // รองรับ response หลายรูปแบบ
      if (res.data && typeof res.data.total === 'number') {
        totalRows = res.data.total;
      } else if (Array.isArray(res.data.rows)) {
        totalRows = res.data.rows.length;
      } else if (Array.isArray(res.data.data)) {
        totalRows = res.data.data.length;
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
        // --- fetch all data ---
        let url = `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure`;
        let params = {};
        if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
          params = { prd_name: 'ALL PRODUCT', proc_disp: 'ALL PROCESS' };
        } else if (!selectedProduct?.prd_name && selectedProcess?.proc_disp) {
          params = { prd_name: 'ALL PRODUCT', proc_disp: selectedProcess.proc_disp };
        } else if (selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
          params = { prd_name: selectedProduct.prd_name, proc_disp: 'ALL PROCESS' };
        } else if (selectedProduct?.prd_name && selectedProcess?.proc_disp) {
          params = { prd_name: selectedProduct.prd_name, proc_disp: selectedProcess.proc_disp };
        }
        // 2. ดึงข้อมูลทุกหน้า (chunk) + update progress
        let allRows = [];
        const chunkSize = 20000;
        for (let pageIdx = 1; allRows.length < totalRows; pageIdx++) {
          // ไม่ต้องเช็ค exportCancelToken.token.reason ตรงนี้ เพราะ axios จะ throw catch ให้อยู่แล้ว
          try {
            const res = await axios.get(url, {
              params: { ...params, page: pageIdx, pageSize: chunkSize },
              cancelToken: exportCancelTokenRef.current.token
            });
            let rows = [];
            // รองรับ response หลายรูปแบบ
            if (res.data && Array.isArray(res.data.rows)) {
              rows = res.data.rows;
            } else if (Array.isArray(res.data.data)) {
              rows = res.data.data;
            } else if (Array.isArray(res.data)) {
              rows = res.data;
            }
            if (rows.length === 0) break;
            allRows = allRows.concat(rows);
            // อัปเดต progress bar ตามจำนวน row ที่โหลดจริง
            setExportProgress({
              percent: Math.round((allRows.length / totalRows) * 100),
              loaded: allRows.length,
              total: totalRows,
              done: false,
              error: false
            });
          } catch (err) {
            // ถ้าโดน cancel จะเข้า catch ทันที
            if (axios.isCancel(err)) {
              setExportProgress({ percent: 100, loaded: allRows.length, total: totalRows, done: true, error: true });
              setExporting(false);
              exportCancelTokenRef.current = null;
              await Swal.fire({ icon: 'info', title: 'Canceled', text: 'Export has been canceled.', confirmButtonColor: '#1976d2' });
              return;
            }
            break;
          }
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
        // ใส่ข้อมูลลง worksheet
        allRows.forEach(row => {
          worksheet.addRow([
            row.factory_desc || row.factory || "",
            row.unit_desc || row.unit || "",
            row.proc_disp || row.process || params.proc_disp || "",
            row.prd_name || row.product || params.prd_name || "",
            row.prd_item || row.item || "",
            row.sec_pcs ?? row.sec_per_pcs ?? "",
            row.similar_type || row.remark || "",
          ]);
        });
        // Download
        const buf = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buf]), "StandardTimeSimilarStructure.xlsx");
        // ปิด dialog exporting ทันทีหลังโหลดเสร็จ
        setExportProgress({ percent: 100, loaded: totalRows, total: totalRows, done: true, error: false });
        setExporting(false);
        exportCancelTokenRef.current = null;
        await Swal.fire({ icon: 'success', title: 'Export Completed', text: 'Excel file saved successfully.', confirmButtonColor: '#1976d2' });
      }
    } catch {
      setExportProgress({ percent: 100, loaded: 0, total: 0, done: true, error: true });
      await Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred during export.', confirmButtonColor: '#1976d2' });
    }
    setExporting(false);
    exportCancelTokenRef.current = null;
  };

  const handleCancelExport = () => {
    if (exportCancelTokenRef.current) {
      exportCancelTokenRef.current.cancel('Export cancelled by user');
    }
  };

  // -------------------- Render --------------------
  // ตัวอย่างการใช้งานปุ่ม sand table data:
  // <button onClick={handleSendTableData} disabled={sandButtonDisabled}>Sand Table Data</button>
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
      {/* Loading Overlay: show only when loadingSandToData is true */}
      {loadingSandToData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.55)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
            padding: 40,
            background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
            borderRadius: 32,
            boxShadow: '0 12px 48px 0 rgba(25,118,210,0.18)',
            border: '2px solid #1976d2',
            minWidth: 340,
            maxWidth: 420,
            transition: 'box-shadow 0.3s, border 0.3s',
          }}>
            {/* Modern animated loader */}
            <div style={{
              width: 74,
              height: 74,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute', left: 0, top: 0 }}>
                <circle cx="37" cy="37" r="32" fill="none" stroke="#1976d2" strokeWidth="7" strokeDasharray="60 60" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 37 37" to="360 37 37" dur="1.1s" repeatCount="indefinite" />
                </circle>
              </svg>
              <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute', left: 0, top: 0 }}>
                <circle cx="37" cy="37" r="24" fill="none" stroke="#0baae5" strokeWidth="5" strokeDasharray="38 38" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="360 37 37" to="0 37 37" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div style={{ fontSize: 28, color: '#1976d2', fontWeight: 900, marginBottom: 8, letterSpacing: 1.1, textShadow: '0 2px 12px #b3d8ff', fontFamily: 'Poppins, Segoe UI, sans-serif' }}>
              Loading... <span style={{ color: '#0baae5', fontWeight: 900 }}>{Math.min(100, Math.round(loadingPercent))}%</span>
            </div>
            <div style={{ fontSize: 18, color: '#1976d2', fontWeight: 600, marginBottom: 8, textShadow: '0 1px 8px #b3d8ff', fontFamily: 'Poppins, Segoe UI, sans-serif' }}>
              Loading all data, please wait...
            </div>
            <div style={{ fontSize: 17, color: '#1976d2', fontWeight: 700, textShadow: '0 1px 8px #b3d8ff', fontFamily: 'Poppins, Segoe UI, sans-serif' }}>
              Loaded <span style={{ color: '#0baae5', fontWeight: 900 }}>{loadingLoaded.toLocaleString()}</span> / <span style={{ color: '#0baae5', fontWeight: 900 }}>{total.toLocaleString()}</span> records
            </div>
            {/* Cancel Button */}
            <button
              onClick={async () => {
                sandToDataCancelRef.current = true;
                setLoadingSandToData(false);
                setLoadingPercent(0);
                setLoadingLoaded(0);
                if (typeof Swal !== 'undefined') {
                  await Swal.fire({
                    icon: 'info',
                    title: 'Canceled',
                    text: 'Loading has been canceled.',
                    confirmButtonColor: '#1976d2',
                    timer: 1800
                  });
                }
              }}
              style={{
                marginTop: 18,
                fontWeight: 900,
                fontSize: 20,
                borderRadius: 14,
                padding: '12px 38px',
                background: 'linear-gradient(90deg, #e53935 60%,rgb(214, 50, 56) 100%)',
                color: '#fff',
                boxShadow: '0 4px 18px 0 #e53935',
                letterSpacing: 1.1,
                textShadow: '0 2px 12px #e53935',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.22s, box-shadow 0.22s',
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      <Navbar onToggle={handleNavbarToggle} />
      <Box marginLeft={isNavbarOpen ? "220px" : 4} marginTop={8}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "12px 40px 40px 40px",
            gap: "24px",
            background: "rgba(255,255,255,0.92)",
            minHeight: "700px",
            borderRadius: 28,
            boxShadow: "0 10px 40px 0 rgba(0,0,0,0.13), 0 2px 12px 0 rgba(0,0,0,0.10)",
            maxWidth: "1700px",
            width: "96vw",
            margin: "0 auto",
            position: 'relative',
            border: '1.5px solid #e3eaf7',
            backdropFilter: 'blur(2.5px)',
            transition: 'box-shadow 0.22s',
          }}
        >
          {/* Minimal floating shapes for soft depth */}
          {/* Decorative floating shapes for extra depth (ปรับให้ดู modern, luxury, ไม่รก) */}
          <div style={{
            position: 'absolute',
            top: -60,
            right: 60,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at 100% 100%,rgba(55, 147, 245, 0.22) 0%, #e3f0ff 80%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(24px)',
            opacity: 0.32,
          }} />
          <div style={{
            position: 'absolute',
            top: 120,
            left: -60,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at 60% 40%, #e3f0ff 0%, #b3d8ff 80%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(32px)',
            opacity: 0.13,
          }} />
          <div style={{
            position: 'absolute',
            bottom: 120,
            right: -60,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at 40% 60%, #e3f0ff 0%, #0baae5 90%)',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(32px)',
            opacity: 0.10,
          }} />
          {/* Title Section */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            marginTop: 0,
            zIndex: 1,
          }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: 1.5,
              color: 'transparent',
              background: 'linear-gradient(90deg, #1976d2 30%, #0baae5 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 0,
              marginTop: 0,
              fontFamily: 'Poppins, Segoe UI, sans-serif',
              textShadow: '0 2px 12px rgba(25,118,210,0.08)',
              lineHeight: 1.18,
              transition: 'all 0.18s',
            }}>
              STANDARD TIME SIMILAR STRUCTURE
            </h1>
            <div style={{
              fontSize: 15,
              color: 'rgb(18, 18, 18)',
              fontWeight: 500,
              marginBottom: 0,
              marginTop: 6,
              fontFamily: 'Poppins, Segoe UI, sans-serif',
              letterSpacing: 0.2,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.07)',
              lineHeight: 1.22,
              transition: 'all 0.18s',
            }}>
              Effortlessly compare and analyze standard times by product and process
            </div>
          </div>
          {/* Search Section */}
          {/* Top search/filter bar with floating style */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginBottom: 0,
              width: "100%",
              maxWidth: 2200,
              margin: "0 auto",
              background: "linear-gradient(90deg, #e3f0ff 0%, #fafdff 100%)",
              borderRadius: 18,
              boxShadow: "0 4px 18px 0 rgba(25,118,210,0.10)",
              // border: "1.5px solid #b3d8ff",
              padding: '24px 28px',
              zIndex: 2,
              position: 'relative',
              top: 0,
              left: 0,
              transition: 'box-shadow 0.2s, background 0.2s',
            }}
          >
            {/* Product Autocomplete */}
            <div style={{ minWidth: 270, flex: 1, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}>
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
                    style={{ width: 270, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(25,118,210,0.07)', border: '1.5px solid #e3eaf7' }}
                    onFocus={() => {
                      setProductOpen(true);
                      // If ALL PRODUCT, trigger reload to show all options
                      if (!productInput || productInput === 'ALL PRODUCT') {
                        setProductInput('');
                      }
                    }}
                    onClick={() => {
                      setProductOpen(true);
                      if (!productInput || productInput === 'ALL PRODUCT') {
                        setProductInput('');
                      }
                    }}
                  />
                )}
                style={{ width: "100%" }}
              />
            </div>
            {/* Process Autocomplete */}
            <div style={{ minWidth: 270, flex: 1, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}>
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
                    style={{ width: 270, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(25,118,210,0.07)', border: '1.5px solid #e3eaf7' }}
                    onFocus={() => {
                      setProcessOpen(true);
                      // If ALL PROCESS, trigger reload to show all options
                      if (!processInput || processInput === 'ALL PROCESS') {
                        setProcessInput('');
                      }
                    }}
                    onClick={() => {
                      setProcessOpen(true);
                      if (!processInput || processInput === 'ALL PROCESS') {
                        setProcessInput('');
                      }
                    }}
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
                justifyContent: "flex-start", // เปลี่ยนจาก center เป็น flex-start เพื่อชิดซ้าย
                gap: 18,
                width: "100%",
                marginLeft: 90,
                zIndex: 1,
                background: 'rgba(255,255,255,0.92)',
                borderRadius: 12,
                boxShadow: '0 2px 8px 0 rgba(25,118,210,0.06)',
                padding: 8,
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

          {/* Sticky Pagination Controls above the table, outside scrollable area */}
          <div
            style={{
              width: '100%',
              maxWidth: 1700,
              minWidth: 1200,
              margin: '-30px auto 0 auto',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              background: 'rgba(255,255,255,0.98)',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              boxShadow: '0 2px 12px 0 rgba(0,87,183,0.07)',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '12px 24px 8px 24px',
            }}
          >
            {PaginationControls}
          </div>
          {/* Scrollable table container */}
          <div
            style={{
              width: "100%",
              minWidth: "1200px",
              maxWidth: "1700px",
              overflowX: "auto",
              maxHeight: 520,
              overflowY: "auto",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 8px 15px 0 rgba(0, 0, 0, 0.64), 0 2px 12px 0 rgba(0,0,0,0.10)",
              zIndex: 2,
              position: 'relative',
              border: '1.5px solid #e3eaf7',
              boxSizing: 'border-box',
              margin: 0,
              transition: 'box-shadow 0.22s',
            }}
          >
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
              background: transparent;
              margin: 0 auto;
              border-radius: 0 !important;
              overflow: visible;
              font-family: 'Segoe UI', 'Poppins', sans-serif;
              box-shadow: none;
            }
            .beautiful-table th, .beautiful-table td {
              border: 1.2px solid #e3eaf7;
              padding: 13px 12px;
              text-align: center;
              font-size: 15.5px;
              white-space: nowrap;
              background-clip: padding-box;
              transition: background 0.18s, box-shadow 0.18s;
              border-radius: 0 !important;
            }
            .beautiful-table th {
              background: #1976d2;
              color: #fff;
              font-weight: 700;
              font-size: 16.5px;
              letter-spacing: 0.7px;
              position: sticky;
              top: 0;
              z-index: 20;
              border-top: none;
              box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
              background-clip: padding-box;
              text-shadow: none;
            }
            .beautiful-table thead {
              position: sticky;
              top: 0;
              z-index: 19;
            }
            .beautiful-table tr {
              height: 44px;
              transition: background 0.18s, box-shadow 0.18s;
            }
            .beautiful-table tbody tr:nth-child(even) {
              background: #f7fafd;
            }
            .beautiful-table tbody tr:hover {
              background: #e3f0ff;
              box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
              z-index: 2;
              position: relative;
            }
            .beautiful-table td {
              border-bottom: 1.2px solid #e3eaf7;
              font-size: 15.5px;
              color: #1a2a3a;
              background: transparent;
              box-shadow: none;
            }
            .action-btn {
              border-radius: 16px !important;
              box-shadow: 0 2px 8px 0 rgba(25,118,210,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
              border: 1.5px solid #e3eaf7 !important;
              background: linear-gradient(120deg, #fafdff 60%, #e3f0ff 100%) !important;
              transition: box-shadow 0.22s, transform 0.18s, background 0.22s, border-color 0.18s;
              position: relative;
              overflow: hidden;
            }
            .action-btn:active {
              transform: scale(0.98);
              filter: brightness(0.98);
              box-shadow: 0 2px 8px 0 rgba(25,118,210,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .action-btn:hover {
              box-shadow: 0 6px 20px 0 rgba(25,118,210,0.16), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
              transform: translateY(-2px) scale(1.08);
              filter: brightness(1.06);
              border-color: #1976d2 !important;
              background: linear-gradient(120deg, #e3f0ff 60%, #fafdff 100%) !important;
            }
            /* ปุ่ม primary (ฟ้า) gradient เพิ่มความหรูหรา */
            .MuiButton-containedPrimary.action-btn {
              background: linear-gradient(120deg, #1976d2 60%, #0baae5 100%) !important;
              color: #fff !important;
              border: 1.5px solid #1976d2 !important;
              box-shadow: 0 4px 16px 0 rgba(25,118,210,0.13), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .MuiButton-containedPrimary.action-btn:hover {
              background: linear-gradient(120deg, #0baae5 60%, #1976d2 100%) !important;
              box-shadow: 0 8px 24px 0 rgba(25,118,210,0.18), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
              border-color: #0baae5 !important;
            }
            /* ปุ่ม outlined (แดง, เขียว, เทา) เพิ่มขอบและเงา */
            .MuiButton-outlined.action-btn {
              background: linear-gradient(120deg, #fafdff 60%, #e3f0ff 100%) !important;
              color: inherit;
              border-width: 1.5px !important;
              box-shadow: 0 2px 8px 0 rgba(25,118,210,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.06);
            }
            .MuiButton-outlined.action-btn:hover {
              background: linear-gradient(120deg, #e3f0ff 60%, #fafdff 100%) !important;
              box-shadow: 0 8px 24px 0 rgba(25,118,210,0.13), 0 2px 8px 0 rgba(0,0,0,0.09);
              border-color: #1976d2 !important;
            }
            /* ปุ่ม outlined สี error (แดง) */
            .MuiButton-outlinedError.action-btn {
              background: linear-gradient(120deg, #fff 60%, #ffeaea 100%) !important;
              color: #e53935 !important;
              border: 1.5px solid #e53935 !important;
              box-shadow: 0 4px 16px 0 rgba(229,57,53,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .MuiButton-outlinedError.action-btn:hover {
              background: linear-gradient(120deg, #ffeaea 60%, #fff 100%) !important;
              border-color: #e53935 !important;
              color: #b71c1c !important;
              box-shadow: 0 8px 24px 0 rgba(229,57,53,0.18), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
            }
            /* ปุ่ม outlined สี success (เขียว) */
            .MuiButton-outlinedSuccess.action-btn {
              background: linear-gradient(120deg, #f6fff7 60%, #e0ffe3 100%) !important;
              color: #2e7d32 !important;
              border: 1.5px solid #2e7d32 !important;
              box-shadow: 0 4px 16px 0 rgba(46,125,50,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .MuiButton-outlinedSuccess.action-btn:hover {
              background: linear-gradient(120deg, #e0ffe3 60%, #f6fff7 100%) !important;
              border-color: #2e7d32 !important;
              color: #1b5e20 !important;
              box-shadow: 0 8px 24px 0 rgba(46,125,50,0.18), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
            }
            /* ปุ่ม outlined สี info (ฟ้าอ่อน) */
            .MuiButton-outlinedInfo.action-btn {
              background: linear-gradient(120deg, #fafdff 60%, #e3f0ff 100%) !important;
              color: #0baae5 !important;
              border: 1.5px solid #0baae5 !important;
              box-shadow: 0 4px 16px 0 rgba(11,170,229,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .MuiButton-outlinedInfo.action-btn:hover {
              background: linear-gradient(120deg, #e3f0ff 60%, #fafdff 100%) !important;
              border-color: #0baae5 !important;
              color: #1976d2 !important;
              box-shadow: 0 8px 24px 0 rgba(11,170,229,0.18), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
            }
            /* ปุ่ม outlined สี secondary (ม่วงเทา) */
            .MuiButton-outlinedSecondary.action-btn {
              background: linear-gradient(120deg, #f7f3ff 60%, #e3eaff 100%) !important;
              color: #7c4dff !important;
              border: 1.5px solid #7c4dff !important;
              box-shadow: 0 4px 16px 0 rgba(124,77,255,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04) inset;
            }
            .MuiButton-outlinedSecondary.action-btn:hover {
              background: linear-gradient(120deg, #e3eaff 60%, #f7f3ff 100%) !important;
              border-color: #7c4dff !important;
              color: #512da8 !important;
              box-shadow: 0 8px 24px 0 rgba(124,77,255,0.18), 0 2px 8px 0 rgba(0,0,0,0.08) inset;
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
          {dialog.severity === 'question' && dialog.onConfirm ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  handleCloseDialog();
                  if (typeof dialog.onConfirm === 'function') await dialog.onConfirm();
                }}
                style={{ minWidth: 90, fontWeight: 600, fontSize: 18, borderRadius: 8 }}
              >
                {dialog.confirmLabel || 'Yes'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  handleCloseDialog();
                  if (typeof dialog.onCancel === 'function') dialog.onCancel();
                }}
                style={{ minWidth: 90, fontWeight: 600, fontSize: 18, borderRadius: 8 }}
              >
                {dialog.cancelLabel || 'Cancel'}
              </Button>
            </div>
          ) : (
            <Button
              variant="contained"
              onClick={handleCloseDialog}
              style={{ minWidth: 90, fontWeight: 600, fontSize: 18, borderRadius: 8 }}
            >
              OK
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Progress Dialog */}
      {exporting && (
        <Dialog open={true} maxWidth="xs" fullWidth PaperProps={{
          style: {
            background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
            boxShadow: '0 12px 48px 0 rgba(76, 153, 235, 0.22)',
            borderRadius: 32,
            padding: 0,
            overflow: 'visible',
            backdropFilter: 'blur(12px)',
            border: '2px solid #1976d2',
            minWidth: 400,
            maxWidth: 500,
            position: 'relative',
            transition: 'box-shadow 0.3s, border 0.3s',
          }
        }}>
          <DialogTitle style={{
            textAlign: 'center',
            fontWeight: 900,
            color: '#fff',
            fontSize: 34,
            letterSpacing: 1.5,
            background: 'linear-gradient(90deg,#1976d2 60%,#0baae5 100%)',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: '32px 0 20px 0',
            marginBottom: 0,
            boxShadow: '0 2px 16px 0 rgba(25,118,210,0.10)',
            textShadow: '0 2px 12px rgba(25,118,210,0.18)',
            fontFamily: 'Poppins, Segoe UI, sans-serif',
            transition: 'background 0.3s',
          }}>
            <span style={{
              fontWeight: 900,
              fontSize: 34,
              letterSpacing: 1.5,
              color: 'rgb(255, 255, 255)',
              textShadow: '0 2px 12px rgba(25,118,210,0.18)',
              fontFamily: 'Poppins, Segoe UI, sans-serif',
            }}>EXPORTING EXCEL</span>
          </DialogTitle>
          <DialogContent style={{
            textAlign: 'center',
            padding: '36px 36px 28px 36px',
            background: 'transparent',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            position: 'relative',
            boxShadow: '0 2px 16px 0 rgba(25,118,210,0.08)',
            fontFamily: 'Poppins, Segoe UI, sans-serif',
          }}>
            <div style={{ margin: '18px 0 12px 0', width: '100%' }}>
              {/* Cute animated GIF for download */}
              <img src="/download-folder.gif" alt="Downloading" style={{
                width: 90,
                height: 90,
                marginBottom: 16,
                borderRadius: 22,
                boxShadow: '0 4px 18px 0 #b3d8ff',
                background: 'linear-gradient(120deg, #e3f0ff 60%, #fafdff 100%)',
                objectFit: 'cover',
                display: 'inline-block',
                animation: 'bounce 1.4s infinite cubic-bezier(.4,1.6,.6,1)',
                border: '2.5px solid #1976d2',
                transition: 'box-shadow 0.3s, border 0.3s',
              }} />
              {/* Glassy progress bar with smooth gradient and shadow */}
              <div style={{
                width: '100%',
                height: 24,
                background: 'linear-gradient(90deg, #e3f0ff 0%, #b3d8ff 100%)',
                borderRadius: 14,
                overflow: 'hidden',
                marginBottom: 22,
                boxShadow: '0 4px 18px 0 #b3d8ff',
                border: '2px solid #1976d2',
                position: 'relative',
                transition: 'box-shadow 0.3s, border 0.3s',
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1976d2 60%, #0baae5 100%)',
                  transition: 'width 0.35s cubic-bezier(.4,1.6,.6,1)',
                  borderRadius: 14,
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
                  animation: 'shimmer 1.2s infinite linear',
                  borderRadius: 14,
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1976d2', marginBottom: 10, letterSpacing: 0.7, textShadow: '0 1px 8px #b3d8ff' }}>
                Progress: <span style={{ color: '#0baae5' }}>{Math.min(100, Math.round(progressPercent))}%</span>
              </div>
              <div style={{ fontSize: 18, color: '#1976d2', marginBottom: 10, fontWeight: 600, textShadow: '0 1px 8px #b3d8ff' }}>
                Loading by page: <span style={{ color: '#1976d2', fontWeight: 800 }}>{progressLoaded.toLocaleString()}</span> / <span style={{ color: '#1976d2', fontWeight: 800 }}>{exportProgress.total.toLocaleString()}</span> rows
              </div>
              {/* --- Add page/chunk info --- */}
              {exportProgress.total > 0 && (
                <div style={{ fontSize: 16, color: '#1976d2', marginBottom: 4, fontWeight: 700, textShadow: '0 1px 8px #b3d8ff' }}>
                  Page <span style={{ color: '#1976d2', fontWeight: 900 }}>{Math.max(1, Math.ceil(progressLoaded / 20000))}</span> / <span style={{ color: '#1976d2', fontWeight: 900 }}>{Math.max(1, Math.ceil(exportProgress.total / 20000))}</span>
                </div>
              )}
            </div>
            {!exportProgress.done && (
              <Button variant="contained" color="error" style={{
                marginTop: 22,
                fontWeight: 900,
                fontSize: 22,
                borderRadius: 14,
                padding: '14px 44px',
                background: 'linear-gradient(90deg, #e53935 60%,rgb(214, 50, 56) 100%)',
                color: '#fff',
                boxShadow: '0 4px 18px 0 #e53935',
                letterSpacing: 1.2,
                textShadow: '0 2px 12px #e53935',
                border: 'none',
                transition: 'background 0.22s, box-shadow 0.22s',
              }} onClick={handleCancelExport}>
                CANCEL
              </Button>
            )}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: 200px 0; }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-16px); }
              }
            `}</style>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
