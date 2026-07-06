// app/src/components/sections/profile/admin-profile/ProfileContent.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import IconifyIcon from 'components/base/IconifyIcon';
import { Dialog } from 'components/dialogs/Dialog';
import PageLoader from 'components/loading/PageLoader';
import DataGridPagination from 'components/pagination/DataGridPagination';
import StudentDetails from './StudentDetails';

interface StudentInformation {
  id: number;
  student_id: string;
  school_code: string;
  full_name: string;
  first_name: string;
  surname: string;
  middle_initial: string | null;
  suffix_name: string | null;
  email: string | null;
  username: string | null;
  level: string;
  section_course: string;
  lrn: string;
  student_type: string;
  id_info_status: string;
  class_details_status: string;
  id_print_status: string;
  id_reprint_status: string;
  account_status: string;
  residential_address: string | null;
  parent_full_name: string | null;
  parent_email: string | null;
  emergency_contact: string | null;
  created_at: string;
  name_to_appear_on_id: string;
  nick_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  esc_voucher_recipient?: string | null;
  esc_number?: string | null;
  id_info_approval_date?: string | null;
  class_details_approval_date?: string | null;
  id_print_date?: string | null;
  parent_first_name?: string | null;
  parent_surname?: string | null;
}

interface StudentRecord {
  id: number;
  student_id: string;
  name_to_appear_on_id: string;
  created_at: string;
  id_info_status: string;
  class_details_status: string;
  id_print_status: string;
  id_reprint_status: string;
  school_code: string;
  email: string;
  student_type: string;
  lrn: string;
  first_name: string;
  last_name: string;
  middle_initial?: string | null;
  suffix?: string;
  level: string;
  section_course: string;
  parent_full_name?: string | null;
  parent_email?: string | null;
  emergency_contact?: string | null;
  present_address?: string;
  account_status: string;
  id_info_approval_date?: string | null;
  class_details_approval_date?: string | null;
  id_print_date?: string | null;
  nick_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  esc_voucher_recipient?: string | null;
  esc_number?: string | null;
  parent_first_name?: string | null;
  parent_surname?: string | null;
}

// ✅ Updated FilterCriteria - with Level and Section/Course
interface FilterCriteria {
  student_id: string;
  student_type: string;
  id_info_status: string;
  level: string;
  section_course: string;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
    case 'rejected':
      return 'error';
    case 'printed':
      return 'success';
    case 'pending_print':
      return 'warning';
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'yes':
      return 'success';
    case 'no':
      return 'default';
    default:
      return 'default';
  }
};

// Helper function to get student photo URL
const getStudentPhotoUrl = (schoolCode: string, studentId: string, surname: string): string => {
  if (!schoolCode || !studentId || !surname) return '';
  return `https://schoolmanagerph.com/idrs-school-ids/${schoolCode}/${studentId}_${surname}.jpg?t=${Date.now()}`;
};

const ProfileContent = () => {
  const { get } = useRouteApiSetup();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const fetchedRef = useRef(false);
  const getRef = useRef(get);

  // ✅ Options for dropdowns
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);

  // ✅ Updated filterCriteria state with level and section_course
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    student_id: '',
    student_type: '',
    id_info_status: '',
    level: '',
    section_course: '',
  });

  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) return students;
    const searchLower = searchText.toLowerCase();
    return students.filter(
      (student) =>
        student.student_id?.toLowerCase().includes(searchLower) ||
        student.name_to_appear_on_id?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.id_info_status?.toLowerCase().includes(searchLower),
    );
  }, [students, searchText]);

  const extractFilterOptions = (studentRecords: StudentRecord[]) => {
    const uniqueLevels = [...new Set(studentRecords.map((s) => s.level).filter(Boolean))].sort();
    const uniqueSections = [
      ...new Set(studentRecords.map((s) => s.section_course).filter(Boolean)),
    ].sort();
    setLevelOptions(uniqueLevels);
    setSectionOptions(uniqueSections);
  };

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      // ✅ Add ?pending_only=true to only get pending records
      const response = await getRef.current<{ success: boolean; data: StudentInformation[] }>(
        '/admin/students?pending_only=true',
      );
      if (response.success && Array.isArray(response.data)) {
        const studentRecords: StudentRecord[] = response.data.map((student) => ({
          id: student.id,
          student_id: student.student_id,
          name_to_appear_on_id: student.name_to_appear_on_id || student.full_name,
          created_at: student.created_at,
          id_info_status: student.id_info_status || 'Pending',
          class_details_status: student.class_details_status || 'Pending',
          id_print_status: student.id_print_status || 'Pending',
          id_reprint_status: student.id_reprint_status || 'No',
          school_code: student.school_code,
          email: student.email || student.parent_email || 'No email provided',
          student_type: student.student_type === 'new' ? 'new' : 'old',
          lrn: student.lrn,
          first_name: student.first_name,
          last_name: student.surname,
          middle_initial: student.middle_initial || null,
          suffix: student.suffix_name || undefined,
          level: student.level,
          section_course: student.section_course,
          parent_full_name: student.parent_full_name,
          parent_email: student.parent_email,
          emergency_contact: student.emergency_contact,
          present_address: student.residential_address || undefined,
          account_status: student.account_status || 'active',
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          id_print_date: student.id_print_date || null,
          nick_name: student.nick_name || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          esc_voucher_recipient: student.esc_voucher_recipient,
          esc_number: student.esc_number || null,
          parent_first_name: student.parent_first_name || null,
          parent_surname: student.parent_surname || null,
        }));
        setStudents(studentRecords);
        extractFilterOptions(studentRecords);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students data:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Replace the fetchFilteredStudents function with this:
  const fetchFilteredStudents = async () => {
    setFilterLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCriteria.student_id) params.append('student_id', filterCriteria.student_id);
      if (filterCriteria.student_type) params.append('student_type', filterCriteria.student_type);
      if (filterCriteria.id_info_status)
        params.append('id_info_status', filterCriteria.id_info_status);
      if (filterCriteria.level) params.append('level', filterCriteria.level);
      if (filterCriteria.section_course)
        params.append('section_course', filterCriteria.section_course);

      // ✅ Add pending_only=true to maintain pending filter
      params.append('pending_only', 'true');

      const queryString = params.toString();
      const url = queryString
        ? `/admin/students?${queryString}`
        : '/admin/students?pending_only=true';
      const response = await getRef.current<{ success: boolean; data: StudentInformation[] }>(url);

      if (response.success && Array.isArray(response.data)) {
        const studentRecords: StudentRecord[] = response.data.map((student) => ({
          id: student.id,
          student_id: student.student_id,
          name_to_appear_on_id: student.name_to_appear_on_id || student.full_name,
          created_at: student.created_at,
          id_info_status: student.id_info_status || 'Pending',
          class_details_status: student.class_details_status || 'Pending',
          id_print_status: student.id_print_status || 'Pending',
          id_reprint_status: student.id_reprint_status || 'No',
          school_code: student.school_code,
          email: student.email || student.parent_email || 'No email provided',
          student_type: student.student_type === 'new' ? 'new' : 'old',
          lrn: student.lrn,
          first_name: student.first_name,
          last_name: student.surname,
          middle_initial: student.middle_initial || null,
          suffix: student.suffix_name || undefined,
          level: student.level,
          section_course: student.section_course,
          parent_full_name: student.parent_full_name,
          parent_email: student.parent_email,
          emergency_contact: student.emergency_contact,
          present_address: student.residential_address || undefined,
          account_status: student.account_status || 'active',
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          id_print_date: student.id_print_date || null,
          nick_name: student.nick_name || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          esc_voucher_recipient: student.esc_voucher_recipient,
          esc_number: student.esc_number || null,
          parent_first_name: student.parent_first_name || null,
          parent_surname: student.parent_surname || null,
        }));
        setStudents(studentRecords);
        extractFilterOptions(studentRecords);
        setSearchText('');
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch filtered students:', error);
      alert('Failed to apply filter');
    } finally {
      setFilterLoading(false);
      setFilterModalOpen(false);
    }
  };

  // ✅ Updated resetFilter
  const resetFilter = () => {
    setFilterCriteria({
      student_id: '',
      student_type: '',
      id_info_status: '',
      level: '',
      section_course: '',
    });
    fetchAllStudents();
    setSearchText('');
    setFilterModalOpen(false);
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAllStudents();
  }, []);

  const handleRowClick = (params: GridRowParams) => {
    setSelectedStudent(params.row as StudentRecord);
    setShowStudentDetails(true);
  };

  const handleCloseStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
  };

  const handleFilterClick = () => setFilterModalOpen(true);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);
  const applyFilter = () => fetchFilteredStudents();

  const handleFilterChange =
    (field: keyof FilterCriteria) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setFilterCriteria({ ...filterCriteria, [field]: event.target.value });
    };

  const columns: GridColDef[] = [
    {
      field: 'student_id',
      headerName: 'Student ID No.',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, whiteSpace: 'normal', wordWrap: 'break-word' }}
        >
          {params.row.student_id}
        </Typography>
      ),
    },
    {
      field: 'name_to_appear_on_id',
      headerName: 'Student Name',
      width: 220,
      renderCell: (params: GridRenderCellParams) => {
        const student = params.row as StudentRecord;
        const photoUrl = getStudentPhotoUrl(
          student.school_code,
          student.student_id,
          student.last_name,
        );

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={photoUrl}
              sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: '0.875rem' }}
            >
              {student.name_to_appear_on_id?.charAt(0) || 'S'}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, whiteSpace: 'normal', wordWrap: 'break-word' }}
            >
              {student.name_to_appear_on_id}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {params.row.level || '—'}
        </Typography>
      ),
    },
    {
      field: 'section_course',
      headerName: 'Section/Course',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {params.row.section_course || '—'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Enrollment Date',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.row.created_at);
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      field: 'id_info_status',
      headerName: 'ID Info Status',
      width: 115,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.id_info_status}
          color={getStatusColor(params.row.id_info_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'id_info_approval_date',
      headerName: 'ID Info Approval Date',
      width: 165,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.id_info_approval_date) return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.id_info_approval_date);
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      field: 'class_details_status',
      headerName: 'Class Details Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.class_details_status}
          color={getStatusColor(params.row.class_details_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'class_details_approval_date',
      headerName: 'Class Details Approval Date',
      width: 205,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.class_details_approval_date)
          return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.class_details_approval_date);
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      field: 'id_print_status',
      headerName: 'ID Print Status',
      width: 115,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.id_print_status}
          color={getStatusColor(params.row.id_print_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'id_print_date',
      headerName: 'ID Print Date',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.id_print_date) return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.id_print_date);
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  if (loading) return <PageLoader />;

  if (showStudentDetails) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
        <Button
          variant="outlined"
          startIcon={<IconifyIcon icon="mdi:arrow-left" />}
          onClick={handleCloseStudentDetails}
          sx={{ mb: 3 }}
        >
          Back to Student List
        </Button>
        <StudentDetails
          student={selectedStudent}
          onClose={handleCloseStudentDetails}
          onUpdate={fetchAllStudents}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#0f172a',
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        Class Details for Approval
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <TextField
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            size="small"
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', height: 40 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="mdi:magnify" fontSize={20} color="#64748b" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="mdi:filter" />}
            onClick={handleFilterClick}
            fullWidth={isMobile}
            sx={{
              textTransform: 'none',
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Filter
          </Button>
        </Stack>
      </Stack>

      {/* ✅ Updated Filter Modal - Now with Level and Section/Course */}
      <Dialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filter Students"
        maxWidth={600}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        showLoading={filterLoading}
        loadingTitle="Applying filter..."
        actions={[
          {
            label: 'Reset',
            onClick: resetFilter,
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:refresh',
          },
          {
            label: 'Apply Filter',
            onClick: applyFilter,
            color: 'primary',
            variant: 'contained',
            startIcon: 'mdi:filter',
          },
        ]}
        content={
          <Stack spacing={2.5} direction="column" sx={{ mt: 1 }}>
            {/* Student ID No. */}
            <TextField
              fullWidth
              size="small"
              label="Student ID No."
              placeholder="Enter student ID number"
              value={filterCriteria.student_id}
              onChange={handleFilterChange('student_id')}
            />

            {/* Student Type */}
            <FormControl fullWidth size="small">
              <InputLabel>Student Type</InputLabel>
              <Select
                value={filterCriteria.student_type}
                label="Student Type"
                onChange={handleFilterChange('student_type')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New Student</MenuItem>
                <MenuItem value="old">Old Student</MenuItem>
              </Select>
            </FormControl>

            {/* ID Info Status */}
            <FormControl fullWidth size="small">
              <InputLabel>ID Info Status</InputLabel>
              <Select
                value={filterCriteria.id_info_status}
                label="ID Info Status"
                onChange={handleFilterChange('id_info_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>

            {/* Level - ADDED */}
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={filterCriteria.level}
                label="Level"
                onChange={handleFilterChange('level')}
              >
                <MenuItem value="">All Levels</MenuItem>
                {levelOptions.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Section/Course - ADDED */}
            <FormControl fullWidth size="small">
              <InputLabel>Section/Course</InputLabel>
              <Select
                value={filterCriteria.section_course}
                label="Section/Course"
                onChange={handleFilterChange('section_course')}
              >
                <MenuItem value="">All Sections</MenuItem>
                {sectionOptions.map((section) => (
                  <MenuItem key={section} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        }
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e9edf4',
          overflow: 'auto', // Changed from 'hidden' to 'auto' for better scrolling
          width: '100%',
        }}
      >
        <DataGrid
          rowHeight={64}
          rows={filteredStudents}
          columns={columns}
          pageSizeOptions={isMobile ? [5, 10, 25] : [10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: isMobile ? 5 : 10 } } }}
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
          slots={{
            basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e9edf4',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' },
            },
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal', // Allow text wrapping
              wordWrap: 'break-word', // Break long words
              lineHeight: '1.4', // Better line height for wrapped text
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default ProfileContent;
