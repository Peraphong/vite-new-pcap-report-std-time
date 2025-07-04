import { useState, useEffect } from "react";
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

  // Table
  const [tableData, setTableData] = useState([]);
  
  //table refresh
  const handleRefreshTable = () => { setTableData([]); };

  // Dialog
  const [dialog, setDialog] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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

  // -------------------- Handler --------------------
  const handleNavbarToggle = (openStatus) => setIsNavbarOpen(openStatus);

  const handleClearSearch = () => {
    setSelectedProduct(null);
    setProductInput("");
    setSelectedProcess(null);
    setProcessInput("");
    setTableData([]);
  };

  const handleCloseDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const handleSearch = async () => {
    if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      await Swal.fire({
        icon: 'warning',
        title: 'Please Select Data',
        text: 'Please select Product or Process at least 1 option',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // 2. เลือก Process อย่างเดียว
    if (!selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      try {
        const res = await axios.get(
          `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure?proc_disp=${encodeURIComponent(
            selectedProcess.proc_disp
          )}&prd_name=ALL PRODUCT`
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTableData(
            res.data.map((row) => ({
              factory: row.factory_desc || "",
              unit: row.unit_desc || "",
              process: selectedProcess.proc_disp || "",
              product: row.prd_name || "",
              item: row.prd_item || "",
              sec_per_pcs: row.sec_pcs ?? "",
              remark: row.similar_type || "",
            }))
          );
        } else {
          setTableData([
            {
              factory: "",
              unit: "",
              process: selectedProcess.proc_disp,
              product: "",
              item: "",
              sec_per_pcs: "",
              remark: "ไม่มีข้อมูลจากระบบ",
            },
          ]);
        }
      } catch {
        setTableData([
          {
            factory: "",
            unit: "",
            process: selectedProcess.proc_disp,
            product: "",
            item: "",
            sec_per_pcs: "",
            remark: "ไม่มีข้อมูลจากระบบ",
          },
        ]);
      }
      return;
    }

    // 3. เลือก Product อย่างเดียว
    if (selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      const prdName = selectedProduct.prd_name;
      try {
        const res = await axios.get(
          `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure?prd_name=${encodeURIComponent(
            prdName
          )}&proc_disp=ALL%20PROCESS`
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTableData(
            res.data.map((row) => ({
              factory: row.factory_desc || "",
              unit: row.unit_desc || "",
              process: row.proc_disp || "",
              product: row.prd_name || prdName,
              item: row.prd_item || "",
              sec_per_pcs: row.sec_pcs ?? "",
              remark: row.similar_type || "",
            }))
          );
        } else {
          setTableData([
            {
              factory: "",
              unit: "",
              process: "",
              product: prdName,
              item: "",
              sec_per_pcs: "",
              remark: "ไม่มีข้อมูลจากระบบ",
            },
          ]);
        }
      } catch {
        setTableData([
          {
            factory: "",
            unit: "",
            process: "",
            product: prdName,
            item: "",
            sec_per_pcs: "",
            remark: "ไม่มีข้อมูลจากระบบ",
          },
        ]);
      }
      return;
    }

    // 4. เลือก Product + Process
    if (selectedProduct?.prd_name && selectedProcess?.proc_disp) {
      const prdName = selectedProduct.prd_name;
      const procDisp = selectedProcess.proc_disp;
      try {
        const res = await axios.get(
          `http://10.17.100.115:3001/api/smart_pcap/filter-data-similar-structure?prd_name=${encodeURIComponent(
            prdName
          )}&proc_disp=${encodeURIComponent(procDisp)}`
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTableData(
            res.data.map((row) => ({
              factory: row.factory_desc || row.factory || "",
              unit: row.unit_desc || row.unit || "",
              process: row.proc_disp || row.process || procDisp,
              product: row.prd_name || row.product || prdName,
              item: row.prd_item || row.item || "",
              sec_per_pcs: row.sec_pcs ?? row.sec_per_pcs ?? "",
              remark: row.similar_type || row.remark || "",
            }))
          );
        } else {
          setTableData([
            {
              factory: "",
              unit: "",
              process: procDisp,
              product: prdName,
              item: "",
              sec_per_pcs: "",
              remark: "ไม่มีข้อมูลจากระบบ",
            },
          ]);
        }
      } catch {
        setTableData([
          {
            factory: "",
            unit: "",
            process: procDisp,
            product: prdName,
            item: "",
            sec_per_pcs: "",
            remark: "ไม่มีข้อมูลจากระบบ",
          },
        ]);
      }
      return;
    }
  };

  const handleExportExcel = async () => {
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

    // Header style
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

    // Data
    if (!tableData || tableData.length === 0) {
      worksheet.addRow(["", "", "", "", "", "", "NO DATA"]);
    } else {
      tableData.forEach((row) => {
        worksheet.addRow([
          row.factory,
          row.unit,
          row.process,
          row.product,
          row.item,
          row.sec_per_pcs,
          row.remark,
        ]);
      });
    }

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
  };

  // -------------------- Render --------------------
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
            overflow: "hidden",
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
            marginBottom: 10,
            zIndex: 1,
          }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: '#1976d2',
              marginBottom: 4,
              textShadow: '0 2px 12px #b3d8ff',
              fontFamily: 'Segoe UI, Poppins, sans-serif',
            }}>
              Standard Time Similar Structure
            </h1>
            <div style={{
              fontSize: 20,
              color: '#4a6fa1',
              fontWeight: 400,
              marginBottom: 8,
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
              gap: 28,
              marginBottom: -30,
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
              >
                <img
                  src="/excel.png"
                  alt="Excel"
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
              </Button>
            </div>
          </div>

          {/* Table Section */}
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
    </>
  );
}
