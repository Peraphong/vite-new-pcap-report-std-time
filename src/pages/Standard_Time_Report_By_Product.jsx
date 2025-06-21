// ======================= Imports =======================
import { useState, useEffect } from "react";
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./styles/Standard_Time_Report_By_Product.sticky.css";

// ======================= Styled Components =======================
const CircleButton = styled(IconButton)(({ btntype }) => ({
  borderRadius: "50%",
  width: 35, // ขยายขนาดปุ่ม
  height: 35, // ขยายขนาดปุ่ม
  margin: 5,
  boxShadow: "0 2px 12px 0 rgba(255, 255, 255, 0.1)",
  background: 
    btntype === "search"
      ? "#42a5f5"
      : btntype === "clear"
      ? "#ef5350"
      : btntype === "excel"
      ? "#43a047"
      : "#29b6f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s",
  "&:hover": {
    transform: "scale(1.18)",
    boxShadow: "0 6px 24px 0 rgba(255, 255, 255, 0.18)",
    opacity: 0.93,
  },
}));

// ย้าย allUnitsMock ออกนอก component เพื่อไม่ให้เป็น dependency
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
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [loading, setLoading] = useState(false);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // เปลี่ยนค่า default เป็น 20
  const [total, setTotal] = useState(0);

  // ---------- Handlers ----------
  const handleNavbarToggle = (openStatus) => setIsNavbarOpen(openStatus);

  // ใช้ฟังก์ชันเดียวสำหรับเปลี่ยน filter ทุกช่อง
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // รีเซ็ตค่าทุกช่องค้นหา
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

  // รีเซ็ตค่าทุกช่องค้นหาและล้างตาราง
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
      setDialogMsg("กรุณาเลือก Factory อย่างน้อย 1 ค่า");
      setOpenDialog(true);
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
      setDialogMsg("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Export table to Excel (with header color, exceljs)
  const handleExportExcel = async () => {
    if (!tableData || tableData.length === 0) return;
    const headers = [
      "Product Name", "Seq", "Process", "Factory", "Unit", "Wc", "Formula Group", "Sht.Width", "Sht.Len", "Sht./Lot", "Pcs/Sht", "Pcs/Lot", "Min./Lot", "Sec/Sht.", "Sec/Pcs.", "UPH", "Create By", "Create Date", "Update By", "Update Date", "Prd Forecast", "Prd Wip", "Prd Stdtime", "Remark"
    ];
    const keys = [
      "prd_name", "ro_seq", "proc_disp", "factory_desc", "fac_unit_desc", "wc", "grp_name", "ro_sht_width", "ro_sht_length", "ro_sht_lot", "ro_pcs_sht", "pcs_lot", "min_lot", "sec_sheet", "sec_pcs", "uph", "create_by", "create_date", "update_by", "update_date", "prd_forecast", "prd_wip", "prd_stdtime", "remark"
    ];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");
    // Add header row
    worksheet.addRow(headers);
    // Add data rows
    tableData.forEach(row => {
      worksheet.addRow(keys.map(k => row[k] ?? ""));
    });
    // Style header row
    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB7E1FC' } // ฟ้าอ่อน
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    // Auto width columns
    headers.forEach((h, idx) => {
      let maxLen = h.length;
      tableData.forEach(row => {
        const val = row[keys[idx]] ? String(row[keys[idx]]) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      worksheet.getColumn(idx + 1).width = Math.max(10, Math.min(maxLen + 2, 30));
    });
    // Export
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Standard_Time_Report.xlsx");
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
  }, [filters.factory]);

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
  }, [filters.factory, filters.unit]);

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
  }, [filters.factory, filters.unit, filters.groupProcess]);

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
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            overflow: "hidden",
            padding: 0,
            margin: 0,
            position: 'relative',
            left: 0,
            right: 0,
          }}
        >
          {/* Header Bar Section (ฟ้าอ่อน ครอบทุกอย่าง) */}
          <div
            style={
              {
                width: "100%",
                height: 150,
                background: "linear-gradient(90deg,rgba(255, 255, 255, 0.5) 0%,rgba(255, 255, 255, 0.65) 100%)", // ไล่สีฟ้าอ่อน-ขาว
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
                justifyContent: 'space-between', // ปรับให้ซ้าย-ขวา
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
                  justifyContent: 'flex-end', // ขยับ grid ไปขวา
                  width: '100%',
                  marginLeft: '29%', // ช่วยดันไปขวา
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
                  <InputLabel>Process</InputLabel>
                  <Select
                    value={filters.process}
                    label="Process"
                    onChange={(e) => handleFilterChange('process', e.target.value)}
                  >
                    {lists.processList.map((item, idx) => (
                      <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                    ))}
                  </Select>
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
                    gap: 18,
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
                  <CircleButton btntype="excel" aria-label="excel" onClick={handleExportExcel}>
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
            color: '#1976d2',
            textAlign: 'left',
            paddingLeft: 12
          }}>
            Product From: {filters.productFrom !== 'ALL' ? filters.productFrom : '-'} &nbsp; ถึง &nbsp; Product To: {filters.productTo !== 'ALL' ? filters.productTo : '-'}
          </div>
          {loading && (
            <div style={{textAlign:'center',margin:'20px',fontSize:'20px',color:'#1976d2'}}>กำลังโหลดข้อมูล...</div>
          )}
          {!loading && (
            <div style={{
              position: 'relative',
              marginLeft: '80px',
              width: '93.8%', // ปรับจาก calc(100vw - 88px) เป็น 100%
              maxWidth: '100vw', // ป้องกันล้นขอบ
              minHeight: '350px',
              height: 'calc(100vh - 270px)', // ให้กล่องตารางสูงเกือบสุดหน้าจอ (ปรับค่าตามต้องการ)
              background: '#fff',
              border: '2px solid #a48cf0',
              borderRadius: '10px',
              boxShadow: '0 2px 12px 0 rgba(164,140,240,0.08)',
              overflowX: 'auto', // ให้ scroll แนวนอน
              overflowY: 'auto',
              padding: 0,
              marginTop: '0px', // ขยับลงให้พ้น navbar
              zIndex: 10,
            }}>
              <table className="w-full border-collapse min-w-max">
                <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr className="bg-[#1976d2] text-white font-semibold text-base border border-[#a48cf0]">
                    <th className="border border-[#a48cf0] p-2 sticky-col-header" style={{ position: 'sticky', left: 0, width: 140, minWidth: 140, maxWidth: 140 ,zIndex: 1000}}>Product Name</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 10 }}>Seq</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Process</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Factory</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Unit</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Wc</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Formula Group</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Sht.Width</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Sht.Len</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Sht./Lot</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Pcs/Sht</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Pcs/Lot</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Min./Lot</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Sec/Sht.</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Sec/Pcs.</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>UPH</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Create By</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Create Date</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Update By</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Update Date</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Prd Forecast</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Prd Wip</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Prd Stdtime</th>
                    <th className="border border-[#a48cf0] p-2" style={{ position: 'sticky', top: 0, background: '#1976d2', color: '#fff', zIndex: 3 }}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr><td colSpan={24} style={{textAlign:'center',color:'#888',fontSize:25}}>ไม่พบข้อมูล</td></tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-[#a48cf0] p-2 sticky-col-left" style={{ position: 'sticky', left: 0, width: 140, minWidth: 140, maxWidth: 140 }}>{row.prd_name || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.ro_seq) || row.ro_seq === null || row.ro_seq === undefined || row.ro_seq === '' ? '-' : row.ro_seq}</td>
                        <td className="border border-[#a48cf0] p-2">{row.proc_disp || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.factory_desc || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.fac_unit_desc || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.wc) || row.wc === null || row.wc === undefined || row.wc === '' ? '-' : row.wc}</td>
                        <td className="border border-[#a48cf0] p-2">{row.grp_name || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.ro_sht_width) || row.ro_sht_width === null || row.ro_sht_width === undefined || row.ro_sht_width === '' ? '-' : row.ro_sht_width}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.ro_sht_length) || row.ro_sht_length === null || row.ro_sht_length === undefined || row.ro_sht_length === '' ? '-' : row.ro_sht_length}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.ro_sht_lot) || row.ro_sht_lot === null || row.ro_sht_lot === undefined || row.ro_sht_lot === '' ? '-' : row.ro_sht_lot}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.ro_pcs_sht) || row.ro_pcs_sht === null || row.ro_pcs_sht === undefined || row.ro_pcs_sht === '' ? '-' : row.ro_pcs_sht}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.pcs_lot) || row.pcs_lot === null || row.pcs_lot === undefined || row.pcs_lot === '' ? '-' : row.pcs_lot}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.min_lot) || row.min_lot === null || row.min_lot === undefined || row.min_lot === '' ? '-' : row.min_lot}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.sec_sheet) || row.sec_sheet === null || row.sec_sheet === undefined || row.sec_sheet === '' ? '-' : row.sec_sheet}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.sec_pcs) || row.sec_pcs === null || row.sec_pcs === undefined || row.sec_pcs === '' ? '-' : row.sec_pcs}</td>
                        <td className="border border-[#a48cf0] p-2">{isNaN(row.uph) || row.uph === null || row.uph === undefined || row.uph === '' ? '-' : row.uph}</td>
                        <td className="border border-[#a48cf0] p-2">{row.create_by || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.create_date || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.update_by || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.update_date || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.prd_forecast || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.prd_wip || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.prd_stdtime || '-'}</td>
                        <td className="border border-[#a48cf0] p-2">{row.remark || '-'}</td>
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
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px 0 rgba(25,118,210,0.08)'
              }}
            >Prev</button>
            <span style={{marginRight: 12}}>Page {Number(page) || 1} / {Number.isFinite(total) && total > 0 ? Math.ceil(Number(total) / Number(pageSize)) : 1}</span>
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

      {/* แจ้งเตือน Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{display:'flex',alignItems:'center',gap:1}}>
          <InfoOutlinedIcon color="info" /> แจ้งเตือน
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{fontSize:20,fontWeight:500}}>{dialogMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} autoFocus variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}