import React from "react";
import { DataGrid } from '@mui/x-data-grid';

const GeneralTable = ({
  showFairs = true,
  showTours = true,
  showExtraProperties = { SchoolTour: [], IndividualTour: [], Fair: [] },
  setMessage = () => {},
  user = null,
  events = [],
  fairs = [],
  statusFilter = "all",
  searchTerm = "",
  showType = "SchoolTour",
  EventRowActions,
  FairRowActions,
  viewType = "tours",
  onShowDetails,
}) => {
  
  const columnWidths = {
    name: 350,
    date: 80,
    time: 80,
    status: 120,
    assignedUsers: 90,
    requiredNumberOfGuides: 90,
    contactPerson: 120,
    email: 150,
    phoneNumber: 120,
    studentCount: 60,
    city: 100,
    applicationDate: 110,
    priority: 1,
    studentHighSchool: 180,
    majorOfInterest: 180,
    studentName: 150,
    actions: 10,
    details: 80
  };

  // Add state for pagination
  const [pageSize, setPageSize] = React.useState(10);

  const getColumns = () => {
    // First declare extraColumns
    const extraColumns = [];
    
    // Remove the details column from baseColumns and store it separately
    const detailsColumn = { 
      field: 'details',
      headerName: '',
      width: columnWidths.details,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => onShowDetails(params.row)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Details
        </button>
      )
    };
    
    const baseColumns = [
      { 
        field: 'name', 
        headerName: showType === "Fair" ? 'School Name' : 'Name', 
        width: columnWidths.name,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 250,
        renderCell: (params) => {
          if (showType === "Fair") {
            return params.row?.schoolName || "N/A";
          }
          return params.row?.applicant?.name || "N/A";
        }
      },
      { 
        field: 'date', 
        headerName: 'Date', 
        width: columnWidths.date,
        headerAlign: 'center',
        align: 'center',
        flex: 0,
        renderCell: (params) => {
          const date = showType === "Fair" ? params.row?.fairDate : params.row?.visitDate;
          if (!date) return "N/A";
          
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const formattedDate = dateObj.toLocaleDateString();
          
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280',
                fontWeight: '500'
              }}>
                {dayName}
              </span>
              <span>{formattedDate}</span>
            </div>
          );
        }
      },
      { 
        field: 'time', 
        headerName: 'Time', 
        width: columnWidths.time,
        headerAlign: 'center',
        align: 'center',
        flex: 0,
        renderCell: (params) => {
          return showType === "Fair" ? params.row?.fairTime : params.row?.visitTime || "N/A";
        }
      },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: columnWidths.status,
        headerAlign: 'center',
        align: 'center',
        flex: 0,
        renderCell: (params) => {
          const status = params.row?.status || "N/A";
          const getStatusColor = (status) => {
            switch(status.toLowerCase()) {
              case 'pending':
                return { bg: '#FEF3C7', text: '#92400E' }; // Warm yellow
              case 'confirmed':
                return { bg: '#DCFCE7', text: '#166534' }; // Green
              case 'scheduled':
                return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
              case 'completed-verified':
                return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
              case 'rejected':
                return { bg: '#FEE2E2', text: '#991B1B' }; // Red
              case 'accepted':
                return { bg: '#DCFCE7', text: '#166534' }; // Green
              default:
                return { bg: '#F3F4F6', text: '#4B5563' }; // Gray
            }
          };

          const colors = getStatusColor(status);
          const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          
          return (
            <div style={{
              backgroundColor: colors.bg,
              color: colors.text,
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '500',
              textTransform: 'capitalize',
              width: '90%',
              textAlign: 'center'
            }}>
              {formattedStatus}
            </div>
          );
        }
      }
    ];

    // Add Fair properties handling
    if (showType === "Fair" && showExtraProperties.Fair) {
      showExtraProperties.Fair.forEach(prop => {
        switch(prop) {
          case "assignedUsers":
            extraColumns.push({
              field: 'assignedUsers',
              headerName: '',
              width: columnWidths.assignedUsers,
              minWidth: columnWidths.assignedUsers,
              maxWidth: columnWidths.assignedUsers,
              headerAlign: 'center',
              align: 'center',
              flex: 0,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: '1.1',
                  width: '100%',
                  padding: '0 2px'
                }}>
                  Assigned<br/>Guides
                </div>
              ),
              renderCell: (params) => (
                <div style={{ 
                  textAlign: 'center', 
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  {params.row?.assignedUsers?.length || "0"}
                </div>
              )
            });
            break;
          case "requiredNumberOfGuides":
            extraColumns.push({
              field: 'requiredNumberOfGuides',
              headerName: '',
              width: columnWidths.requiredNumberOfGuides,
              minWidth: columnWidths.requiredNumberOfGuides,
              maxWidth: columnWidths.requiredNumberOfGuides,
              headerAlign: 'center',
              align: 'center',
              flex: 0,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: '1.1',
                  width: '100%',
                  padding: '0 2px'
                }}>
                  Required<br/>Guides
                </div>
              ),
              renderCell: (params) => (
                <div style={{ 
                  textAlign: 'center', 
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  {params.row?.requiredNumberOfGuides || "N/A"}
                </div>
              )
            });
            break;
          case "organiserName":
            extraColumns.push({
              field: 'organiserName',
              headerName: 'Organiser',
              width: columnWidths.contactPerson,
              renderCell: (params) => params.row?.organiserName || "N/A"
            });
            break;
          case "email":
            extraColumns.push({
              field: 'email',
              headerName: 'Email',
              width: columnWidths.email,
              renderCell: (params) => params.row?.email || "N/A"
            });
            break;
        }
      });
    }

    // Add SchoolTour properties
    if (showType === "SchoolTour" && showExtraProperties.SchoolTour) {
      showExtraProperties.SchoolTour.forEach(prop => {
        switch(prop) {
          case "assignedUsers":
            extraColumns.push({
              field: 'assignedUsers',
              headerName: '',
              width: columnWidths.assignedUsers,
              minWidth: columnWidths.assignedUsers,
              maxWidth: columnWidths.assignedUsers,
              headerAlign: 'center',
              align: 'center',
              flex: 0,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: '1.1',
                  width: '100%',
                  padding: '0 2px'
                }}>
                  Assigned<br/>Guides
                </div>
              ),
              renderCell: (params) => (
                <div style={{ 
                  textAlign: 'center', 
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  {params.row?.assignedUsers?.length || "0"}
                </div>
              )
            });
            break;
          case "requiredNumberOfGuides":
            extraColumns.push({
              field: 'requiredNumberOfGuides',
              headerName: '',
              width: columnWidths.requiredNumberOfGuides,
              minWidth: columnWidths.requiredNumberOfGuides,
              maxWidth: columnWidths.requiredNumberOfGuides,
              headerAlign: 'center',
              align: 'center',
              flex: 0,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: '1.1',
                  width: '100%',
                  padding: '0 2px'
                }}>
                  Required<br/>Guides
                </div>
              ),
              renderCell: (params) => (
                <div style={{ 
                  textAlign: 'center', 
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  {params.row?.requiredNumberOfGuides || "N/A"}
                </div>
              )
            });
            break;
          case "contactPerson":
            extraColumns.push({
              field: 'contactPerson',
              headerName: 'Contact Person',
              width: columnWidths.contactPerson,
              renderCell: (params) => params.row?.contactPerson || "N/A"
            });
            break;
          case "email":
            extraColumns.push({
              field: 'email',
              headerName: 'Email',
              width: columnWidths.email,
              renderCell: (params) => params.row?.applicant?.email || "N/A"
            });
            break;
          case "phoneNumber":
            extraColumns.push({
              field: 'phoneNumber',
              headerName: 'Phone',
              width: columnWidths.phoneNumber,
              renderCell: (params) => params.row?.applicant?.phoneNumber || "N/A"
            });
            break;
          case "studentCount":
            extraColumns.push({
              field: 'studentCount',
              headerName: '',
              width: columnWidths.studentCount,
              minWidth: columnWidths.studentCount,
              maxWidth: columnWidths.studentCount,
              headerAlign: 'center',
              align: 'center',
              flex: 0,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: '1.1',
                  width: '100%',
                  padding: '0 2px'
                }}>
                  Student<br/>Count
                </div>
              ),
              renderCell: (params) => (
                <div style={{ 
                  textAlign: 'center', 
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  {params.row?.studentCount || "N/A"}
                </div>
              )
            });
            break;
          case "city":
            extraColumns.push({
              field: 'city',
              headerName: 'City',
              width: columnWidths.city,
              renderCell: (params) => params.row?.city || "N/A"
            });
            break;
          case "applicationDate":
            extraColumns.push({
              field: 'applicationDate',
              headerName: 'Applied On',
              width: columnWidths.applicationDate,
              renderCell: (params) => params.row?.applicationDate 
                ? new Date(params.row.applicationDate).toLocaleDateString() 
                : "N/A"
            });
            break;
          case "priority":
            extraColumns.push({
              field: 'priority',
              headerName: 'Priority',
              width: columnWidths.priority,
              renderCell: (params) => {
                const priority = params.row?.applicant?.priority || "N/A";
                
                const getPriorityColor = (priority) => {
                  switch(priority) {
                    case "High":
                      return { bg: '#FEE2E2', text: '#991B1B' }; // Red for Focus
                    case "Medium":
                      return { bg: '#FEF3C7', text: '#92400E' }; // Yellow for Preferred
                    case "General":
                      return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue for General
                    default:
                      return { bg: '#F3F4F6', text: '#4B5563' }; // Gray for N/A
                  }
                };

                let text = "";
                switch(priority) {
                  case "High":
                    text = "Focus";
                    break;
                  case "Medium":
                    text = "Preferred";
                    break;
                  case "General":
                    text = "General";
                    break;
                  default:
                    text = "N/A";
                }

                const colors = getPriorityColor(priority);

                return (
                  <div style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    {text}
                  </div>
                );
              }
            });
            break;
        }
      });
    }

    // Add IndividualTour properties
    if (showType === "IndividualTour" && showExtraProperties.IndividualTour) {
      showExtraProperties.IndividualTour.forEach(prop => {
        switch(prop) {
          case "studentHighSchool":
            extraColumns.push({
              field: 'studentHighSchool',
              headerName: 'High School',
              width: columnWidths.studentHighSchool,
              renderCell: (params) => params.row?.studentHighSchool || "N/A"
            });
            break;
          case "email":
            extraColumns.push({
              field: 'email',
              headerName: 'Email',
              width: columnWidths.email,
              renderCell: (params) => params.row?.applicant?.email || "N/A"
            });
            break;
          case "phoneNumber":
            extraColumns.push({
              field: 'phoneNumber',
              headerName: 'Phone',
              width: columnWidths.phoneNumber,
              renderCell: (params) => params.row?.applicant?.phoneNumber || "N/A"
            });
            break;
          case "majorOfInterest":
            extraColumns.push({
              field: 'majorOfInterest',
              headerName: 'Major of Interest',
              width: columnWidths.majorOfInterest,
              renderCell: (params) => params.row?.majorOfInterest || "N/A"
            });
            break;
          
        }
      });
    }

    // Add actions column if row actions are provided
    if (EventRowActions || FairRowActions) {
      extraColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: columnWidths.actions,
        renderCell: (params) => {
          if (showType === "Fair" && FairRowActions) {
            return <FairRowActions 
              fair={params.row} 
              user={user}
              setMessage={setMessage}
            />;
          }
          if (EventRowActions) {
            return <EventRowActions 
              event={params.row} 
              user={user} 
              setMessage={setMessage} 
            />;
          }
          return null;
        },
      });
    }

    // Modify the modifyExtraColumn function to respect original column settings
    const modifyExtraColumn = (column) => ({
      ...column,
      headerAlign: column.headerAlign || 'center',
      align: column.align || 'center',
      // Only add flex if not explicitly set to 0
      ...(column.flex !== 0 && { flex: 1 }),
      // Only set minWidth if not explicitly set
      ...(column.minWidth === undefined && { minWidth: column.width })
    });

    // Return columns with details at the end
    return [...baseColumns, ...extraColumns.map(modifyExtraColumn), detailsColumn];
  };

  const filteredEvents = events.filter((event) => {
    // First filter by event type
    const matchesType = event.__t === showType;
    
    // Then apply status and search filters
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch = !searchTerm || 
      event.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.visitDate?.includes(searchTerm) ||
      event.requiredNumberOfGuides?.toString().includes(searchTerm);
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <DataGrid
        rows={viewType === "fairs" ? fairs : filteredEvents}
        columns={getColumns()}
        getRowId={(row) => row._id}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 20, 50]}
        pagination
        autoHeight
        disableSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        rowHeight={70}
        components={{
          NoRowsOverlay: () => (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              {viewType === "fairs" ? "No fairs available" : "No events available"}
            </div>
          ),
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-root': {
            width: '100%',
          },
          '& .MuiDataGrid-main': {
            width: '100%',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-virtualScroller': {
            width: '100%',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            width: '100%',
          },
          '& .MuiDataGrid-virtualScrollerRenderZone': {
            width: '100%',
          },
          '& .MuiDataGrid-cell': {
            borderColor: '#e5e7eb',
            whiteSpace: 'normal',
            padding: '8px',
            lineHeight: '1.5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
            '& .MuiDataGrid-columnHeader': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '& .MuiDataGrid-columnHeaderTitle': {
                width: '100%',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }
            }
          },
          '& .MuiDataGrid-row': {
            width: '100% !important',
            minWidth: 'fit-content',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f8fafc',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e5e7eb',
            width: '100%',
          },
          '& .MuiDataGrid-columnHeader': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          flexGrow: 1,
          flexShrink: 1,
          minWidth: '100%',
          '& .MuiDataGrid-pagination': {
            borderTop: '1px solid #e5e7eb',
          },
          '& .MuiTablePagination-root': {
            overflow: 'visible',
          },
        }}
      />
    </div>
  );
};

export default GeneralTable;
