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

export default function StandardTimeSimilarStructure() {
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
  };

  const handleCloseDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const handleSearch = async () => {
    if (!selectedProduct?.prd_name && !selectedProcess?.proc_disp) {
      setDialog({
        open: true,
        message: "กรุณาเลือก Product หรือ Process",
        severity: "warning",
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
      worksheet.addRow(["", "", "", "", "", "", "ไม่มีข้อมูล"]);
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
      <Navbar onToggle={handleNavbarToggle} />
      <Box marginLeft={isNavbarOpen ? "220px" : 4} marginTop={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 24,
            gap: "4px",
            background: "#fff",
            minHeight: "650px",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {/* Search Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "350px 350px 1fr",
              gap: "16px",
              marginBottom: 24,
              alignItems: "center",
              width: "840px",
              minWidth: "840px",
              maxWidth: "840px",
            }}
          >
            {/* Product Autocomplete */}
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
                  label="ค้นหา Product Name"
                  variant="outlined"
                  size="small"
                  style={{ width: 250 }}
                />
              )}
              style={{ width: "100%" }}
            />
            {/* Process Autocomplete */}
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
                  label="ค้นหา Process"
                  variant="outlined"
                  size="small"
                  style={{ width: 250, marginLeft: -80, marginRight: "auto" }}
                  InputLabelProps={{ style: { left: 0 } }}
                  inputProps={{
                    ...params.inputProps,
                    style: { textAlign: "left" },
                  }}
                />
              )}
              style={{ width: "100%" }}
            />

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20, // ระยะห่างแต่ละปุ่มเท่ากัน
                width: "100%",
                marginLeft: -100,
              }}
            >
              <Button
                className="action-btn"
                variant="contained"
                color="primary"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleSearch}
              >
                <SearchIcon style={{ fontSize: 24 }} />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="error"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleClearSearch}
                title="Clear"
              >
                <img
                  src="/clear1.png"
                  alt="Clear"
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="info"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleRefreshTable}
                title="Refresh"
              >
                <img
                  src="/ref.png"
                  alt="Refresh"
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
              </Button>
              <Button
                className="action-btn"
                variant="outlined"
                color="success"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleExportExcel}
              >
                <img
                  src="/excel.png"
                  alt="Excel"
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div
            style={{
              width: "1200px",
              minWidth: "1200px",
              maxWidth: "1200px",
              overflowX: "auto",
              maxHeight: 500,
              overflowY: "auto",
              margin: "0 auto",
            }}
          >
            <table className="custom-table">
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
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <style>{`
            .custom-table {
              border-collapse: collapse;
              width: 100%;
              min-width: 1100px;
              border: 1px solid #a259f7;
              box-shadow: 0 0 0 2px #a259f7;
              background: #fff;
              margin: 0 auto;
            }
            .custom-table th, .custom-table td {
              border: 2px solid #222;
              padding: 12px 8px;
              text-align: center;
              font-size: 16px;
              white-space: nowrap;
            }
            .custom-table th {
              background: #0057b7;
              color: #fff;
              font-weight: bold;
              font-size: 17px;
              letter-spacing: 1px;
              position: sticky;
              top: 0;
              z-index: 2;
            }
            .custom-table tr {
              height: 44px;
              transition: background 0.2s;
            }
            .custom-table tbody tr:hover {
              background: #f3f6fa;
            }
            .action-btn {
              transition: box-shadow 0.2s, transform 0.2s, background 0.2s, border-color 0.2s;
            }
            .action-btn:hover {
              box-shadow: 0 2px 8px rgba(0,87,183,0.10);
              transform: translateY(-1px) scale(1.08);
              background: #e6f0fa !important;
              border-color: #1976d2 !important;
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
          style: { textAlign: "center", padding: 24 },
        }}
      >
        <DialogTitle>
          <InfoIcon style={{ fontSize: 48, color: "#6ad1f7" }} />
        </DialogTitle>
        <DialogContent>
          <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>
            {dialog.message}
          </div>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            style={{ minWidth: 80 }}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
