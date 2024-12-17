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
}) => {
  
  // At the start of the component, define default column widths
  const columnWidths = {
    name: 200,
    date: 100,
    time: 80,
    status: 100,
    assignedUsers: 120,
    requiredNumberOfGuides: 120,
    contactPerson: 120,
    email: 180,
    phoneNumber: 120,
    studentCount: 100,
    city: 100,
    applicationDate: 100,
    priority: 100,
    studentHighSchool: 150,
    majorOfInterest: 150,
    studentName: 150,
    actions: 200
  };

  const getColumns = () => {
    const baseColumns = [
      { 
        field: 'applicantName', 
        headerName: 'Name', 
        width: columnWidths.name,
        flex: 0,
        renderCell: (params) => {
          if (showType === "SchoolTour") {
            return (
              <div style={{ 
                whiteSpace: 'normal',
                lineHeight: '1.2',
                padding: '8px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {params.row?.applicant?.name || "N/A"}
              </div>
            );
          }
          return params.row?.applicant?.name || "N/A";
        }
      },
      { 
        field: 'visitDate', 
        headerName: 'Date', 
        width: columnWidths.date,
        flex: 0,
        renderCell: (params) => {
          return params.row?.visitDate 
            ? new Date(params.row.visitDate).toLocaleDateString() 
            : "N/A";
        }
      },
      { 
        field: 'visitTime', 
        headerName: 'Time', 
        width: columnWidths.time,
        flex: 0,
        renderCell: (params) => params.row?.visitTime || "N/A"
      },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: columnWidths.status,
        flex: 0,
        renderCell: (params) => params.row?.status || "N/A"
      }
    ];

    // Add extra properties based on showExtraProperties
    const extraColumns = [];
    
    if (showType === "SchoolTour" && showExtraProperties.SchoolTour) {
      showExtraProperties.SchoolTour.forEach(prop => {
        switch(prop) {
          case "assignedUsers":
            extraColumns.push({
              field: 'assignedUsers',
              headerName: 'Assigned Guides',
              width: columnWidths.assignedUsers,
              renderCell: (params) => params.row?.assignedUsers?.length || "0"
            });
            break;
          case "requiredNumberOfGuides":
            extraColumns.push({
              field: 'requiredNumberOfGuides',
              headerName: 'Required Guides',
              width: columnWidths.requiredNumberOfGuides,
              renderCell: (params) => params.row?.requiredNumberOfGuides || "N/A"
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
              renderCell: (params) => params.row?.email || "N/A"
            });
            break;
          case "phoneNumber":
            extraColumns.push({
              field: 'phoneNumber',
              headerName: 'Phone',
              width: columnWidths.phoneNumber,
              renderCell: (params) => params.row?.phoneNumber || "N/A"
            });
            break;
          case "studentCount":
            extraColumns.push({
              field: 'studentCount',
              headerName: 'Student Count',
              width: columnWidths.studentCount,
              renderCell: (params) => params.row?.studentCount || "N/A"
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
                return text;
              }
            });
            break;
        }
      });
    }

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
              renderCell: (params) => params.row?.email || "N/A"
            });
            break;
          case "phoneNumber":
            extraColumns.push({
              field: 'phoneNumber',
              headerName: 'Phone',
              width: columnWidths.phoneNumber,
              renderCell: (params) => params.row?.phoneNumber || "N/A"
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
          case "studentName":
            extraColumns.push({
              field: 'studentName',
              headerName: 'Student Name',
              width: columnWidths.studentName,
              renderCell: (params) => params.row?.studentName || "N/A"
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
            return <FairRowActions fair={params.row} />;
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

    return [...baseColumns, ...extraColumns];
  };

  // Filter events based on status and search term
  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch = !searchTerm || 
      event.applicant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.visitDate?.includes(searchTerm) ||
      event.requiredNumberOfGuides?.toString().includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'auto', 
      maxWidth: '100vw',
      display: 'flex',  // Added
      flexDirection: 'column'  // Added
    }}>
      <DataGrid
        rows={filteredEvents}
        columns={getColumns()}
        getRowId={(row) => row._id}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        disableSelectionOnClick
        sx={{
          '.MuiDataGrid-root': {
            width: 'auto !important',
            maxWidth: '100%',
          },
          '.MuiDataGrid-virtualScroller': {
            maxWidth: '100%',
            overflowX: 'auto',
          },
          '.MuiDataGrid-cell': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 'unset !important',
            maxWidth: 'unset !important',
            padding: '8px',
            borderColor: '#e5e7eb',
          },
          '.MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
          },
          '.MuiDataGrid-row:hover': {
            backgroundColor: '#f8fafc',
          },
          // Force horizontal scroll instead of wrap
          '& .MuiDataGrid-virtualScrollerContent': {
            minWidth: '100% !important',
          }
        }}
        style={{
          width: '100%',
          maxWidth: '100%',
        }}
      />
    </div>
  );
};

export default GeneralTable;
