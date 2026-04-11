import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import IconifyIcon from 'components/base/IconifyIcon';
import { Dialog } from 'components/dialogs/Dialog';
import PageLoader from 'components/loading/PageLoader';
import DataGridPagination from 'components/pagination/DataGridPagination';

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
  id_reprint_count?: number;
  account_status: string;
  residential_address: string | null;
  parent_full_name: string | null;
  parent_email: string | null;
  emergency_contact: string | null;
  created_at: string;
  name_to_appear_on_id: string;
  id_info_approval_date?: string | null;
  class_details_approval_date?: string | null;
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  id_print_date?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  nick_name?: string | null;
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
  id_reprint_count?: number;
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
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  id_print_date?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  nick_name?: string | null;
}

interface FilterCriteria {
  school_code: string;
  student_id: string;
  student_type: string;
  level: string;
  section_course: string;
  id_info_status: string;
  class_details_status: string;
  id_print_status: string;
  id_reprint_status: string;
  approved_id_info_date_from: string;
  approved_id_info_date_to: string;
  approved_class_details_date_from: string;
  approved_class_details_date_to: string;
  enrollment_date_from: string;
  enrollment_date_to: string;
}

interface Statistics {
  total: number;
  pending: number;
  approved: number;
  declined: number;
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

const DashboardContent = () => {
  const { get, post } = useRouteApiSetup();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState<StudentRecord | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [updating, setUpdating] = useState(false);
  const fetchedRef = useRef(false);
  const getRef = useRef(get);

  // Dynamic filter options
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    school_code: '',
    student_id: '',
    student_type: '',
    level: '',
    section_course: '',
    id_info_status: '',
    class_details_status: '',
    id_print_status: '',
    id_reprint_status: '',
    approved_id_info_date_from: '',
    approved_id_info_date_to: '',
    approved_class_details_date_from: '',
    approved_class_details_date_to: '',
    enrollment_date_from: '',
    enrollment_date_to: '',
  });

  const statistics: Statistics = useMemo(() => {
    const total = students.length;
    const pending = students.filter((s) => s.id_info_status?.toLowerCase() === 'pending').length;
    const approved = students.filter((s) => s.id_info_status?.toLowerCase() === 'approved').length;
    const declined = students.filter((s) => s.id_info_status?.toLowerCase() === 'declined').length;
    return { total, pending, approved, declined };
  }, [students]);

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
    const levels = [...new Set(studentRecords.map((s) => s.level).filter(Boolean))].sort();
    const sections = [
      ...new Set(studentRecords.map((s) => s.section_course).filter(Boolean)),
    ].sort();
    setLevelOptions(levels);
    setSectionOptions(sections);
  };

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      const response = await getRef.current<{ success: boolean; data: StudentInformation[] }>(
        '/admin/students',
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
          id_reprint_count: student.id_reprint_count || 0,
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
          esc_voucher_recipient: student.esc_voucher_recipient || false,
          esc_number: student.esc_number || null,
          id_print_date: student.id_print_date || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          nick_name: student.nick_name || null,
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

  const fetchFilteredStudents = async () => {
    setFilterLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCriteria.school_code) params.append('school_code', filterCriteria.school_code);
      if (filterCriteria.student_id) params.append('student_id', filterCriteria.student_id);
      if (filterCriteria.student_type) params.append('student_type', filterCriteria.student_type);
      if (filterCriteria.level) params.append('level', filterCriteria.level);
      if (filterCriteria.section_course)
        params.append('section_course', filterCriteria.section_course);
      if (filterCriteria.id_info_status)
        params.append('id_info_status', filterCriteria.id_info_status);
      if (filterCriteria.class_details_status)
        params.append('class_details_status', filterCriteria.class_details_status);
      if (filterCriteria.id_print_status)
        params.append('id_print_status', filterCriteria.id_print_status);
      if (filterCriteria.id_reprint_status)
        params.append('id_reprint_status', filterCriteria.id_reprint_status);
      if (filterCriteria.approved_id_info_date_from)
        params.append('id_info_approval_date_from', filterCriteria.approved_id_info_date_from);
      if (filterCriteria.approved_id_info_date_to)
        params.append('id_info_approval_date_to', filterCriteria.approved_id_info_date_to);
      if (filterCriteria.approved_class_details_date_from)
        params.append(
          'class_details_approval_date_from',
          filterCriteria.approved_class_details_date_from,
        );
      if (filterCriteria.approved_class_details_date_to)
        params.append(
          'class_details_approval_date_to',
          filterCriteria.approved_class_details_date_to,
        );
      if (filterCriteria.enrollment_date_from)
        params.append('date_from', filterCriteria.enrollment_date_from);
      if (filterCriteria.enrollment_date_to)
        params.append('date_to', filterCriteria.enrollment_date_to);

      const queryString = params.toString();
      const url = queryString ? `/admin/students?${queryString}` : '/admin/students';
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
          id_reprint_count: student.id_reprint_count || 0,
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
          esc_voucher_recipient: student.esc_voucher_recipient || false,
          esc_number: student.esc_number || null,
          id_print_date: student.id_print_date || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          nick_name: student.nick_name || null,
        }));
        setStudents(studentRecords);
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

  const resetFilter = () => {
    setFilterCriteria({
      school_code: '',
      student_id: '',
      student_type: '',
      level: '',
      section_course: '',
      id_info_status: '',
      class_details_status: '',
      id_print_status: '',
      id_reprint_status: '',
      approved_id_info_date_from: '',
      approved_id_info_date_to: '',
      approved_class_details_date_from: '',
      approved_class_details_date_to: '',
      enrollment_date_from: '',
      enrollment_date_to: '',
    });
    fetchAllStudents();
    setSearchText('');
    setFilterModalOpen(false);
  };

  const handleLevelChange = (event: SelectChangeEvent) => {
    const selectedLevel = event.target.value;
    setFilterCriteria({ ...filterCriteria, level: selectedLevel, section_course: '' });

    if (selectedLevel) {
      const filteredSections = [
        ...new Set(
          students
            .filter((s) => s.level === selectedLevel)
            .map((s) => s.section_course)
            .filter(Boolean),
        ),
      ].sort();
      setSectionOptions(filteredSections);
    } else {
      const allSections = [
        ...new Set(students.map((s) => s.section_course).filter(Boolean)),
      ].sort();
      setSectionOptions(allSections);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAllStudents();
  }, []);

  const handleRowClick = (params: GridRowParams) => {
    setSelectedStudent(params.row as StudentRecord);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleFilterClick = () => setFilterModalOpen(true);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);
  const applyFilter = () => fetchFilteredStudents();

  const handleFilterChange =
    (field: keyof FilterCriteria) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setFilterCriteria({ ...filterCriteria, [field]: event.target.value });
    };

  const handleApproveClick = (student: StudentRecord) => {
    setStudentToApprove(student);
    setIsCheckboxChecked(false);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!isCheckboxChecked || !studentToApprove) return;

    setUpdating(true);
    try {
      // Call the backend API to approve the student
      const response = await post<{
        success: boolean;
        response?: string;
        error?: string;
      }>('/admin/students/approve', {
        student_id: studentToApprove.student_id,
        school_code: studentToApprove.school_code,
      });

      if (response.success) {
        setApproveModalOpen(false);
        setIsCheckboxChecked(false);

        // Update the local state to reflect the approval
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentToApprove.id ? { ...s, id_info_status: 'approved' } : s,
          ),
        );

        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text:
            response.response ||
            `Student ${studentToApprove.name_to_appear_on_id} has been approved successfully.`,
          confirmButtonColor: '#2563eb',
        });

        setStudentToApprove(null);
      } else {
        throw new Error(response.error || 'Failed to approve student');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to approve student',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseApproveModal = () => {
    setApproveModalOpen(false);
    setStudentToApprove(null);
    setIsCheckboxChecked(false);
  };

  const exportAllToExcel = () => {
    if (filteredStudents.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheetData = filteredStudents.map((student) => ({
      'Student ID No.': student.student_id || '—',
      'Last Name': student.last_name || '—',
      'First Name': student.first_name || '—',
      'Middle Initial': student.middle_initial || '—',
      'Name to Appear on ID Card': student.name_to_appear_on_id || '—',
      Level: student.level || '—',
      'Section/Course': student.section_course || '—',
      'Residential Address': student.present_address || '—',
      Gender: student.gender || '—',
      'Date of Birth': student.birth_date
        ? new Date(student.birth_date).toISOString().split('T')[0]
        : '—',
      'Emergency Contact Person': student.emergency_contact?.split(' - ')[0] || '—',
      'Emergency Contact Number': student.emergency_contact?.split(' - ')[1] || '—',
      LRN: student.lrn || '—',
      'ESC Grantee': student.esc_voucher_recipient ? 'Yes' : 'No',
      'ESC Number': student.esc_number || '—',
      'ID Info Status': student.id_info_status || '—',
      'ID Info Approval Date': student.id_info_approval_date
        ? new Date(student.id_info_approval_date).toISOString().split('T')[0]
        : '—',
      'Class Details Status': student.class_details_status || '—',
      'Class Details Approval Date': student.class_details_approval_date
        ? new Date(student.class_details_approval_date).toISOString().split('T')[0]
        : '—',
      'ID Print Status': student.id_print_status || '—',
      'ID Print Date': student.id_print_date
        ? new Date(student.id_print_date).toISOString().split('T')[0]
        : '—',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns: GridColDef[] = [
    {
      field: 'student_id',
      headerName: 'Student ID No.',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.student_id}
        </Typography>
      ),
    },
    {
      field: 'name_to_appear_on_id',
      headerName: 'Student Name',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {params.row.name_to_appear_on_id?.charAt(0) || 'S'}
          </Avatar>
          {params.row.name_to_appear_on_id}
        </Box>
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.row.level || '—'}</Typography>
      ),
    },
    {
      field: 'section_course',
      headerName: 'Section/Course',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.row.section_course || '—'}</Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Enrollment Date',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'id_info_status',
      headerName: 'ID Info Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.id_info_status || '—'}
          color={getStatusColor(params.row.id_info_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'id_info_approval_date',
      headerName: 'ID Info Approval Date',
      width: 160,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.id_info_approval_date) return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.id_info_approval_date);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'class_details_status',
      headerName: 'Class Details Status',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.class_details_status || '—'}
          color={getStatusColor(params.row.class_details_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'class_details_approval_date',
      headerName: 'Class Details Approval Date',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.class_details_approval_date)
          return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.class_details_approval_date);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'id_print_status',
      headerName: 'ID Print Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.id_print_status || '—'}
          color={getStatusColor(params.row.id_print_status) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'id_print_date',
      headerName: 'ID Print Date',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.id_print_date) return <Typography variant="body2">—</Typography>;
        const date = new Date(params.row.id_print_date);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Approve Student">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleApproveClick(params.row);
            }}
            disabled={params.row.id_info_status?.toLowerCase() === 'approved'}
            sx={{
              bgcolor:
                params.row.id_info_status?.toLowerCase() === 'approved' ? '#94a3b8' : '#22c55e',
              color: 'white',
              '&:hover': {
                bgcolor:
                  params.row.id_info_status?.toLowerCase() === 'approved' ? '#94a3b8' : '#16a34a',
              },
              width: 36,
              height: 36,
            }}
          >
            <IconifyIcon icon="mdi:check" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              cursor: 'default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {statistics.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#eef2ff', color: '#2563eb' }}>
                  <IconifyIcon icon="mdi:account-group" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              cursor: 'default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    {statistics.pending}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fef3c7', color: '#f59e0b' }}>
                  <IconifyIcon icon="mdi:clock-outline" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              cursor: 'default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {statistics.approved}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#d1fae5', color: '#10b981' }}>
                  <IconifyIcon icon="mdi:check-circle" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              cursor: 'default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Declined
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    {statistics.declined}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444' }}>
                  <IconifyIcon icon="mdi:close-circle" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            size="small"
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff',
                height: 40,
              },
              '& .MuiInputBase-input': {
                py: 1,
                px: 1.5,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  <IconifyIcon icon="mdi:magnify" fontSize={20} color="#64748b" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="mdi:filter" />}
            onClick={handleFilterClick}
          >
            Filter Records
          </Button>
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="mdi:file-excel" />}
            onClick={exportAllToExcel}
            sx={{
              textTransform: 'none',
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {/* Filter Modal */}
      <Dialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filter Student Records"
        maxWidth={700}
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
          <Stack
            spacing={2.5}
            direction="column"
            sx={{ mt: 1, maxHeight: '70vh', overflowY: 'auto', pr: 1 }}
          >
            {/* b. Student ID No. */}
            <TextField
              fullWidth
              size="small"
              label="Student ID No."
              placeholder="Enter student ID number"
              value={filterCriteria.student_id}
              onChange={handleFilterChange('student_id')}
            />

            {/* c. Student Type */}
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

            {/* d. Level */}
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select value={filterCriteria.level} label="Level" onChange={handleLevelChange}>
                <MenuItem value="">All</MenuItem>
                {levelOptions.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* e. Section/Course */}
            <FormControl fullWidth size="small">
              <InputLabel>Section/Course</InputLabel>
              <Select
                value={filterCriteria.section_course}
                label="Section/Course"
                onChange={handleFilterChange('section_course')}
                disabled={!filterCriteria.level}
              >
                <MenuItem value="">All</MenuItem>
                {sectionOptions.map((section) => (
                  <MenuItem key={section} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* f. ID Info Status */}
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

            {/* g. Class Details Status */}
            <FormControl fullWidth size="small">
              <InputLabel>Class Details Status</InputLabel>
              <Select
                value={filterCriteria.class_details_status}
                label="Class Details Status"
                onChange={handleFilterChange('class_details_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>

            {/* h. ID Printing Status */}
            <FormControl fullWidth size="small">
              <InputLabel>ID Printing Status</InputLabel>
              <Select
                value={filterCriteria.id_print_status}
                label="ID Printing Status"
                onChange={handleFilterChange('id_print_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="printed">Printed</MenuItem>
              </Select>
            </FormControl>

            {/* i. ID Reprint Status */}
            <FormControl fullWidth size="small">
              <InputLabel>ID Reprint Status</InputLabel>
              <Select
                value={filterCriteria.id_reprint_status}
                label="ID Reprint Status"
                onChange={handleFilterChange('id_reprint_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* j. Approved ID Info Date Range */}
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Approved ID Info Date Range
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="From"
                type="date"
                value={filterCriteria.approved_id_info_date_from}
                onChange={handleFilterChange('approved_id_info_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.approved_id_info_date_to}
                onChange={handleFilterChange('approved_id_info_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* k. Approved Class Details Date Range */}
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Approved Class Details Date Range
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="From"
                type="date"
                value={filterCriteria.approved_class_details_date_from}
                onChange={handleFilterChange('approved_class_details_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.approved_class_details_date_to}
                onChange={handleFilterChange('approved_class_details_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* l. Enrollment Date Range */}
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Enrollment Date Range
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="From"
                type="date"
                value={filterCriteria.enrollment_date_from}
                onChange={handleFilterChange('enrollment_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.enrollment_date_to}
                onChange={handleFilterChange('enrollment_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        }
      />

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #e9edf4', overflow: 'hidden' }}
      >
        <DataGrid
          rowHeight={64}
          rows={filteredStudents}
          columns={columns}
          pageSizeOptions={isMobile ? [5, 10, 25] : [10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: isMobile ? 5 : 10 } },
            // ✅ Default sorting by Student Name (alphabetically ascending)
            sorting: {
              sortModel: [{ field: 'name_to_appear_on_id', sort: 'asc' }],
            },
          }}
          onRowClick={handleRowClick}
          slots={{
            basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e9edf4',
              minHeight: { xs: 48, sm: 56 },
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            },
            '& .MuiDataGrid-cell': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      </Paper>

      {/* Student Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        title="Student Information"
        maxWidth={600}
        hideCloseButton={false}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        content={
          selectedStudent && (
            <Stack spacing={3} direction="column">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#2563eb',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                  }}
                >
                  {selectedStudent.name_to_appear_on_id?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedStudent.name_to_appear_on_id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Student ID: {selectedStudent.student_id}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    A. Personal Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    First Name
                  </Typography>
                  <Typography>{selectedStudent.first_name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Middle Initial
                  </Typography>
                  <Typography>{selectedStudent.middle_initial || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Last Name
                  </Typography>
                  <Typography>{selectedStudent.last_name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Suffix Name
                  </Typography>
                  <Typography>{selectedStudent.suffix || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Nickname
                  </Typography>
                  <Typography>{selectedStudent.nick_name || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Date of Birth
                  </Typography>
                  <Typography>
                    {selectedStudent.birth_date
                      ? new Date(selectedStudent.birth_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Gender
                  </Typography>
                  <Typography>{selectedStudent.gender || '—'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    B. School Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Level
                  </Typography>
                  <Typography>{selectedStudent.level || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Section/Course
                  </Typography>
                  <Typography>{selectedStudent.section_course || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    LRN
                  </Typography>
                  <Typography>{selectedStudent.lrn || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Student Type
                  </Typography>
                  <Typography>
                    {selectedStudent.student_type === 'new' ? 'New Student' : 'Old Student'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ESC Voucher
                  </Typography>
                  <Typography>{selectedStudent.esc_voucher_recipient ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ESC Number
                  </Typography>
                  <Typography>{selectedStudent.esc_number || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Enrollment Date
                  </Typography>
                  <Typography>
                    {new Date(selectedStudent.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    C. ID Application Status {/* ✅ Changed from "Application Status" */}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ID Info Status
                  </Typography>
                  <div>
                    <Chip
                      label={selectedStudent.id_info_status || '—'}
                      color={getStatusColor(selectedStudent.id_info_status) as any}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </div>
                </Grid>
                {/* ✅ Added ID Info Approval Date */}
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ID Info Approval Date
                  </Typography>
                  <Typography>
                    {selectedStudent.id_info_approval_date
                      ? new Date(selectedStudent.id_info_approval_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Class Details Status
                  </Typography>
                  <div>
                    <Chip
                      label={selectedStudent.class_details_status || '—'}
                      color={getStatusColor(selectedStudent.class_details_status) as any}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </div>
                </Grid>
                {/* ✅ Added Class Details Approval Date */}
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Class Details Approval Date
                  </Typography>
                  <Typography>
                    {selectedStudent.class_details_approval_date
                      ? new Date(selectedStudent.class_details_approval_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ID Print Status
                  </Typography>
                  <div>
                    <Chip
                      label={selectedStudent.id_print_status || '—'}
                      color={getStatusColor(selectedStudent.id_print_status) as any}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </div>
                </Grid>
                {/* ✅ Added ID Printing Date */}
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ID Printing Date
                  </Typography>
                  <Typography>
                    {selectedStudent.id_print_date
                      ? new Date(selectedStudent.id_print_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    D. Parent/Guardian Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Parent/Guardian Name
                  </Typography>
                  <Typography>{selectedStudent.parent_full_name || 'Not provided'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Parent/Guardian Email
                  </Typography>
                  <Typography>{selectedStudent.parent_email || 'Not provided'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    E. Address & Contact Information
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" fontWeight={600}>
                    Residential Address
                  </Typography>
                  <Typography>{selectedStudent.present_address || 'Not provided'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" fontWeight={600}>
                    Emergency Contact Person and Number
                  </Typography>
                  <Typography>{selectedStudent.emergency_contact || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )
        }
      />

      {/* Approve Confirmation Modal */}
      <Dialog
        open={approveModalOpen}
        onClose={handleCloseApproveModal}
        title="Confirm Student Approval"
        maxWidth={600}
        hideCloseButton={false}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        actions={[
          {
            label: 'Cancel',
            onClick: handleCloseApproveModal,
            color: 'secondary',
            variant: 'outlined',
          },
          {
            label: updating ? 'Approving...' : 'Approve',
            onClick: handleConfirmApprove,
            color: 'success',
            variant: 'contained',
            disabled: !isCheckboxChecked || updating,
            startIcon: 'mdi:check-circle',
          },
        ]}
        content={
          studentToApprove && (
            <Stack spacing={3} direction="column">
              <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 600 }}>
                Please review the student information below before approving.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#2563eb' }}>
                  {studentToApprove.name_to_appear_on_id?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {studentToApprove.name_to_appear_on_id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Student ID: {studentToApprove.student_id}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                    Personal Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    First Name
                  </Typography>
                  <Typography>{studentToApprove.first_name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Middle Initial
                  </Typography>
                  <Typography>{studentToApprove.middle_initial || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Last Name
                  </Typography>
                  <Typography>{studentToApprove.last_name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Suffix
                  </Typography>
                  <Typography>{studentToApprove.suffix || '—'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                    School Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Level
                  </Typography>
                  <Typography>{studentToApprove.level || '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Section/Course
                  </Typography>
                  <Typography>{studentToApprove.section_course || '—'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                    C. ID Application Status
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    ID Info Status
                  </Typography>
                  <Chip
                    label={studentToApprove.id_info_status || '—'}
                    color={getStatusColor(studentToApprove.id_info_status) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Class Details Status
                  </Typography>
                  <Chip
                    label={studentToApprove.class_details_status || '—'}
                    color={getStatusColor(studentToApprove.class_details_status) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                    Parent/Guardian Information
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Parent/Guardian Name
                  </Typography>
                  <Typography>{studentToApprove.parent_full_name || 'Not provided'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" fontWeight={600}>
                    Parent/Guardian Email
                  </Typography>
                  <Typography>{studentToApprove.parent_email || 'Not provided'}</Typography>
                </Grid>
              </Grid>
              <Stack direction="row" alignItems="center" spacing={1}>
                <input
                  type="checkbox"
                  id="approveConfirm"
                  checked={isCheckboxChecked}
                  onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <Typography
                  variant="body2"
                  component="label"
                  htmlFor="approveConfirm"
                  sx={{ cursor: 'pointer' }}
                >
                  I confirm that this student's information is correct and I approve this
                  registration.
                </Typography>
              </Stack>
            </Stack>
          )
        }
      />
    </Box>
  );
};

export default DashboardContent;
