import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DataTable from 'react-data-table-component';
import ExcelJS from 'exceljs';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';
import { nff_import } from '../BaseURL';
import axios from 'axios';
import { successMessage, loadingErrorMessage } from '../Message';
// import SearchDialog from './SearchDialog';

const NFFImport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
      },
    },
    header: {
      style: {
        fontSize: '1rem',
        color: '#1976d2',
        backgroundColor: '#ffffff',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontWeight: 'bold',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f5f5f5',
        borderBottom: '2px solid #e0e0e0',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#424242',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  const handleImport = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const buffer = e.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const formattedData = [];

      let currentMain = null;

      const getCellValue = (cell) => {
        if (!cell) return '';
        const value = cell.value;
        if (value?.richText) {
          return value.richText.map(rt => rt.text).join('');
        }
        return value || '';
      };

      worksheet.eachRow((row, rowNumber) => {

        const col1 = getCellValue(row.getCell(1));
        const col2 = getCellValue(row.getCell(2));
        const col3 = getCellValue(row.getCell('C'));
        const col4 = getCellValue(row.getCell('D'));
        const metro = getCellValue(row.getCell('F'));
        const municipal = getCellValue(row.getCell('G'));
        const district = getCellValue(row.getCell('H'));


        // If it's a main category
        if (col1 || col2) {

          currentMain = {
            code: col3,
            mainName: col4
          };

          // Add main
          formattedData.push({
            code: col3,
            mainName: col4,
            itemName: col4,
            metro: metro || '',
            municipal: municipal || '',
            district: district || '',
            isMain: true
          });

          // If main category has prices
          if (metro || municipal || district) {
            formattedData.push({
              code: col3,
              mainName: col4,
              itemName: col4,
              metro: metro,
              municipal: municipal,
              district: district,
              isMain: false
            });
          }
        }
        //  item
        else if (col4 && currentMain) {
          formattedData.push({
            code: currentMain.code,
            mainName: currentMain.mainName,
            itemName: col4,
            metro: metro,
            municipal: municipal,
            district: district,
            isMain: false
          });
        }
      });

      setData(formattedData);

    };

    reader.readAsArrayBuffer(file);
  };

  const columns = [
    {
      name: 'Code',
      selector: row => row.code,
      sortable: true,
      width: '120px',
      cell: row => (
        <div style={{
          fontWeight: row.isMain ? 'bold' : 'normal',
          color: row.isMain ? '#1976d2' : 'inherit',
          padding: '8px 0'
        }}>
          {row.code}
        </div>
      )
    },
    {
      name: 'Main Name',
      selector: row => row.mainName,
      sortable: true,
      width: '200px',
      cell: row => (
        <div style={{
          fontWeight: row.isMain ? 'bold' : 'normal',
          color: row.isMain ? '#1976d2' : 'inherit',
          padding: '8px 0'
        }}>
          {row.mainName}
        </div>
      )
    },
    {
      name: 'Item Name',
      selector: row => row.itemName,
      sortable: true,
      grow: 2,
      cell: row => (
        <div style={{
          padding: '8px 0'
        }}>
          {row.itemName}
        </div>
      )
    },
    {
      name: 'Metro',
      selector: row => row.metro,
      sortable: true,
      right: true,
      width: '120px',
      cell: row => (
        <div style={{
          textAlign: 'right',
          padding: '8px 0',
          fontFamily: 'monospace'
        }}>
          {row.metro ? parseFloat(row.metro).toFixed(2) : ''}
        </div>
      )
    },
    {
      name: 'Municipal',
      selector: row => row.municipal,
      sortable: true,
      right: true,
      width: '120px',
      cell: row => (
        <div style={{
          textAlign: 'right',
          padding: '8px 0',
          fontFamily: 'monospace'
        }}>
          {row.municipal ? parseFloat(row.municipal).toFixed(2) : ''}
        </div>
      )
    },
    {
      name: 'District',
      selector: row => row.district,
      sortable: true,
      right: true,
      width: '120px',
      cell: row => (
        <div style={{
          textAlign: 'right',
          padding: '8px 0',
          fontFamily: 'monospace'
        }}>
          {row.district ? parseFloat(row.district).toFixed(2) : ''}
        </div>
      )
    }
  ];

  const handleReset = () => {
    setData([]);
  };

  const saveToDatabase = async (formattedData) => {
    try {
        const result = await Swal.fire({
            title: 'Save Data?',
            text: `About to import ${formattedData.length} records. Continue?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!'
        });

        if (result.isConfirmed) {
            setImportProgress(0); // Reset progress
            
            const progressDialog = Swal.fire({
                title: 'Importing Data',
                html: 'Starting import...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const chunkSize = 100; // Reduced chunk size
            let processed = 0;
            const totalChunks = Math.ceil(formattedData.length / chunkSize);

            for (let i = 0; i < formattedData.length; i += chunkSize) {
                const chunk = formattedData.slice(i, i + chunkSize);
                
                try {
                    const response = await axios.post(nff_import, {
                        data: chunk
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    console.log('Chunk response:', response.data); // Add this for debugging

                    if (!response.data.success) {
                        throw new Error(response.data.message);
                    }

                    processed++;
                    const progress = Math.round((processed / totalChunks) * 100);
                    setImportProgress(progress); // Update progress state
                    
                    Swal.update({
                        html: `
                            <div style="margin-bottom: 1rem">
                                Processing: ${progress}%
                            </div>
                            <div>
                                ${processed * chunkSize} of ${formattedData.length} records
                            </div>
                        `
                    });

                } catch (error) {
                    console.error('Chunk error:', error);
                    throw new Error(
                        error.response?.data?.message || 
                        error.message || 
                        `Failed to import chunk ${processed + 1}`
                    );
                }
            }

            // Close progress dialog
            await progressDialog.close();

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Successfully imported ${formattedData.length} records`
            });

            // Reset data after successful import
            setData([]);

        }
    } catch (error) {
        console.error('Import error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Import Failed',
            text: error.message || 'Failed to import data',
        });
    } finally {
        setImportProgress(0); // Reset progress
    }
};

  // Add this helper function for color interpolation
  const getProgressColor = (progress) => {
    const red = Math.round(255 * (1 - progress / 100));
    const green = Math.round(255 * (progress / 100));
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <Container maxWidth="xl">
      <Card elevation={3} sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3
          }}>
            <Typography variant="h5" component="h1" sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 500 
            }}>
              License Fee Import
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ 
                  minWidth: isMobile ? 'auto' : undefined,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                {!isMobile && "Import Excel"}
                <input
                  type="file"
                  accept=".xlsx"
                  hidden
                  onChange={(e) => {
                    setLoading(true);
                    const file = e.target.files[0];
                    if (file) {
                      handleImport(file).finally(() => setLoading(false));
                    }
                  }}
                />
              </Button>
              {data.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => saveToDatabase(data)}
                    sx={{
                      backgroundColor: theme.palette.success.main,
                      '&:hover': {
                        backgroundColor: theme.palette.success.dark,
                      }
                    }}
                  >
                    Import to Database
                  </Button>
                  <Tooltip title="Clear Data">
                    <IconButton
                      onClick={handleReset}
                      sx={{
                        color: theme.palette.grey[600],
                        '&:hover': {
                          color: theme.palette.error.main,
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {(loading || importProgress > 0) && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress 
                variant="determinate"
                value={importProgress}
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getProgressColor(importProgress),
                    transition: 'background-color 0.3s ease'
                  }
                }} 
              />
              {importProgress > 0 && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {importProgress}% Complete
                </Typography>
              )}
            </Box>
          )}

          <Paper elevation={0} sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            '& .rdt_Table': {
              border: 'none',
            }
          }}>
            <DataTable
              columns={columns}
              data={data}
              pagination
              highlightOnHover
              responsive
              customStyles={customStyles}
              progressPending={loading}
              dense={isMobile}
              paginationPerPage={15}
              paginationRowsPerPageOptions={[15, 30, 50, 100]}
              noDataComponent={
                <Box sx={{ 
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <UploadFileIcon 
                    sx={{ 
                      fontSize: 48,
                      color: theme.palette.grey[400]
                    }} 
                  />
                  <Typography color="text.secondary">
                    No data available. Please upload an Excel file to begin.
                  </Typography>
                </Box>
              }
            />
          </Paper>
        </CardContent>
      </Card>

      {/* <SearchDialog 
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      /> */}
    </Container>
  );
};

export default NFFImport;