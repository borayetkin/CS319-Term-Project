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
}) => {
  
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
    // First declare extraColumns
    const extraColumns = [];
    
    const baseColumns = [
      { 
        field: 'name', 
        headerName: showType === "Fair" ? 'School Name' : 'Name', 
        width: columnWidths.name,
        flex: 0,
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
        flex: 0,
        renderCell: (params) => {
          const date = showType === "Fair" ? params.row?.fairDate : params.row?.visitDate;
          return date ? new Date(date).toLocaleDateString() : "N/A";
        }
      },
      { 
        field: 'time', 
        headerName: 'Time', 
        width: columnWidths.time,
        flex: 0,
        renderCell: (params) => {
          return showType === "Fair" ? params.row?.fairTime : params.row?.visitTime || "N/A";
        }
      },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: columnWidths.status,
        flex: 0,
        renderCell: (params) => params.row?.status || "N/A"
      }
    ];

    // Add Fair properties handling
    if (showType === "Fair" && showExtraProperties.Fair) {
      showExtraProperties.Fair.forEach(prop => {
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
          case "city":
            extraColumns.push({
              field: 'city',
              headerName: 'City',
              width: columnWidths.city,
              renderCell: (params) => params.row?.city || "N/A"
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

    return [...baseColumns, ...extraColumns];
  };

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
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <DataGrid
        rows={viewType === "fairs" ? fairs : filteredEvents}
        columns={getColumns()}
        getRowId={(row) => row._id}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        disableSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        components={{
          NoRowsOverlay: () => (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              {viewType === "fairs" ? "No fairs available" : "No events available"}
            </div>
          ),
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-main': {
            width: '100% !important',
          },
          '& .MuiDataGrid-virtualScroller': {
            width: '100% !important',
            overflow: 'hidden auto',
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            width: '100% !important',
          },
          '& .MuiDataGrid-virtualScrollerRenderZone': {
            width: '100% !important',
          },
          '& .MuiDataGrid-cell': {
            borderColor: '#e5e7eb',
            whiteSpace: 'normal',
            padding: '8px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f8fafc',
          },
          width: '100%',
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e5e7eb',
          }
        }}
      />
    </div>
  );
};

export default GeneralTable;
