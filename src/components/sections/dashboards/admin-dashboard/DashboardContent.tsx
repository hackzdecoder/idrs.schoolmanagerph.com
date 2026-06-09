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
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
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
  nick_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  id_info_approval_date?: string | null;
  class_details_approval_date?: string | null;
  esc_voucher_recipient?: string | null;
  esc_number?: string | null;
  id_print_date?: string | null;
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
  username: string;
  present_address?: string;
  level: string;
  section_course: string;
  account_status: string;
  parent_full_name?: string | null;
  parent_email?: string | null;
  emergency_contact?: string | null;
  nick_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  id_info_approval_date?: string | null;
  class_details_approval_date?: string | null;
  esc_voucher_recipient?: string | null;
  esc_number?: string | null;
  id_print_date?: string | null;
}

interface FilterCriteria {
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
  total_students: number;
  approved_id_info_count: number;
  pending_id_info_count: number;
  approved_class_details_count: number;
  pending_class_details_count: number;
  printed_ids_count: number;
  total_pending_ids_count: number;
  total_reprinted_ids_count: number;
}

// Text formatting utilities
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatName = (name: string | null | undefined): string => {
  if (!name) return '—';
  return capitalizeWords(name);
};

const formatMiddleInitial = (initial: string | null | undefined): string => {
  if (!initial) return '—';
  return initial.toUpperCase();
};

const preserveOriginalCase = (text: string | null | undefined): string => {
  if (!text) return '—';
  return text;
};

const formatStatusLabel = (status: string | undefined | null): string => {
  if (!status) return '—';
  if (status.toLowerCase() === 'yes') return 'Yes';
  if (status.toLowerCase() === 'no') return 'No';
  return capitalizeFirstLetter(status);
};

const formatStudentTypeLabel = (type: string | undefined | null): string => {
  if (!type) return 'Not specified';
  if (type.toLowerCase() === 'new') return 'New Student';
  if (type.toLowerCase() === 'old') return 'Old Student';
  return capitalizeFirstLetter(type);
};

const getStudentTypeBadgeColor = (type: string | undefined | null): string => {
  if (!type) return 'default';
  if (type.toLowerCase() === 'new') return 'info';
  if (type.toLowerCase() === 'old') return 'secondary';
  return 'default';
};

const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
    case 'rejected':
      return 'error';
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'processing':
      return 'info';
    case 'printed':
      return 'success';
    case 'pending_print':
      return 'warning';
    case 'yes':
      return 'success';
    case 'no':
      return 'default';
    default:
      return 'default';
  }
};

// Helper function to get student photo URL
// Pattern: /idrs-school-ids/{school_code}/{student_id}_{surname}.jpg
const getStudentPhotoUrl = (schoolCode: string, studentId: string, surname: string): string => {
  if (!schoolCode || !studentId || !surname) return '';
  return `https://schoolmanagerph.com/idrs-school-ids/${schoolCode}/${studentId}_${surname}.jpg`;
};

const DashboardContent = () => {
  const { get } = useRouteApiSetup();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  // State declarations
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);

  const hasFetched = useRef(false);
  const getApi = useRef(get);

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
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

  // Statistics calculations
  const statistics: Statistics = useMemo(() => {
    const totalStudents = students.length;
    const approvedIdInfoCount = students.filter(
      (student) => student.id_info_status?.toLowerCase() === 'approved',
    ).length;
    const pendingIdInfoCount = students.filter(
      (student) => student.id_info_status?.toLowerCase() === 'pending',
    ).length;
    const approvedClassDetailsCount = students.filter(
      (student) => student.class_details_status?.toLowerCase() === 'approved',
    ).length;
    const pendingClassDetailsCount = students.filter(
      (student) => student.class_details_status?.toLowerCase() === 'pending',
    ).length;
    const printedIdsCount = students.filter(
      (student) => student.id_print_status?.toLowerCase() === 'printed',
    ).length;
    const totalPendingIdsCount = students.filter(
      (student) =>
        student.id_print_status?.toLowerCase() === 'pending' ||
        student.id_print_status?.toLowerCase() === 'pending_print',
    ).length;
    const totalReprintedIdsCount = students.reduce((sum, student) => {
      return sum + (student.id_reprint_count || 0);
    }, 0);

    return {
      total_students: totalStudents,
      approved_id_info_count: approvedIdInfoCount,
      pending_id_info_count: pendingIdInfoCount,
      approved_class_details_count: approvedClassDetailsCount,
      pending_class_details_count: pendingClassDetailsCount,
      printed_ids_count: printedIdsCount,
      total_pending_ids_count: totalPendingIdsCount,
      total_reprinted_ids_count: totalReprintedIdsCount,
    };
  }, [students]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const searchLower = searchQuery.toLowerCase();
    return students.filter((student) => {
      return (
        student.student_id?.toLowerCase().includes(searchLower) ||
        student.school_code?.toLowerCase().includes(searchLower) ||
        student.name_to_appear_on_id?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.username?.toLowerCase().includes(searchLower) ||
        student.id_info_status?.toLowerCase().includes(searchLower)
      );
    });
  }, [students, searchQuery]);

  // Extract unique filter options from students data
  const extractFilterOptions = (studentRecords: StudentRecord[]) => {
    const uniqueLevels = [...new Set(studentRecords.map((s) => s.level).filter(Boolean))].sort();
    const uniqueSections = [
      ...new Set(studentRecords.map((s) => s.section_course).filter(Boolean)),
    ].sort();
    setLevelOptions(uniqueLevels);
    setSectionOptions(uniqueSections);
  };

  // Fetch all students from API
  const fetchAllStudents = async () => {
    setIsLoading(true);
    try {
      const response = await getApi.current<{ success: boolean; data: StudentInformation[] }>(
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
          username: student.username || student.student_id,
          present_address: student.residential_address || undefined,
          level: student.level,
          section_course: student.section_course,
          account_status: student.account_status || 'active',
          parent_full_name: student.parent_full_name,
          parent_email: student.parent_email,
          emergency_contact: student.emergency_contact,
          nick_name: student.nick_name || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          esc_voucher_recipient: student.esc_voucher_recipient,
          esc_number: student.esc_number || null,
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          id_print_date: student.id_print_date || null,
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
      setIsLoading(false);
    }
  };

  // Fetch filtered students from API
  const fetchFilteredStudents = async () => {
    setIsFilterLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterCriteria.student_id) queryParams.append('student_id', filterCriteria.student_id);
      if (filterCriteria.student_type)
        queryParams.append('student_type', filterCriteria.student_type);
      if (filterCriteria.level) queryParams.append('level', filterCriteria.level);
      if (filterCriteria.section_course)
        queryParams.append('section_course', filterCriteria.section_course);
      if (filterCriteria.id_info_status)
        queryParams.append('id_info_status', filterCriteria.id_info_status);
      if (filterCriteria.class_details_status)
        queryParams.append('class_details_status', filterCriteria.class_details_status);
      if (filterCriteria.id_print_status)
        queryParams.append('id_print_status', filterCriteria.id_print_status);
      if (filterCriteria.id_reprint_status)
        queryParams.append('id_reprint_status', filterCriteria.id_reprint_status);
      if (filterCriteria.approved_id_info_date_from)
        queryParams.append('id_info_approval_date_from', filterCriteria.approved_id_info_date_from);
      if (filterCriteria.approved_id_info_date_to)
        queryParams.append('id_info_approval_date_to', filterCriteria.approved_id_info_date_to);
      if (filterCriteria.approved_class_details_date_from)
        queryParams.append(
          'class_details_approval_date_from',
          filterCriteria.approved_class_details_date_from,
        );
      if (filterCriteria.approved_class_details_date_to)
        queryParams.append(
          'class_details_approval_date_to',
          filterCriteria.approved_class_details_date_to,
        );
      if (filterCriteria.enrollment_date_from)
        queryParams.append('date_from', filterCriteria.enrollment_date_from);
      if (filterCriteria.enrollment_date_to)
        queryParams.append('date_to', filterCriteria.enrollment_date_to);

      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/admin/students?${queryString}` : '/admin/students';
      const response = await getApi.current<{ success: boolean; data: StudentInformation[] }>(
        apiUrl,
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
          username: student.username || student.student_id,
          present_address: student.residential_address || undefined,
          level: student.level,
          section_course: student.section_course,
          account_status: student.account_status || 'active',
          parent_full_name: student.parent_full_name,
          parent_email: student.parent_email,
          emergency_contact: student.emergency_contact,
          nick_name: student.nick_name || null,
          birth_date: student.birth_date || null,
          gender: student.gender || null,
          esc_voucher_recipient: student.esc_voucher_recipient,
          esc_number: student.esc_number || null,
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          id_print_date: student.id_print_date || null,
        }));
        setStudents(studentRecords);
        setSearchQuery('');
        extractFilterOptions(studentRecords);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch filtered students:', error);
      alert('Failed to apply filter');
    } finally {
      setIsFilterLoading(false);
      setIsFilterModalOpen(false);
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilterCriteria({
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
    setSearchQuery('');
    setIsFilterModalOpen(false);
  };

  // Handle level selection change (updates section options)
  const onLevelChange = (event: SelectChangeEvent) => {
    const selectedLevel = event.target.value;
    setFilterCriteria({ ...filterCriteria, level: selectedLevel, section_course: '' });

    if (selectedLevel) {
      let filteredSections = students;
      filteredSections = filteredSections.filter((student) => student.level === selectedLevel);
      const uniqueSections = [
        ...new Set(filteredSections.map((s) => s.section_course).filter(Boolean)),
      ].sort();
      setSectionOptions(uniqueSections);
    } else {
      const allSections = students;
      const uniqueSections = [
        ...new Set(allSections.map((s) => s.section_course).filter(Boolean)),
      ].sort();
      setSectionOptions(uniqueSections);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAllStudents();
  }, []);

  // Event handlers
  const onRowClick = (params: GridRowParams) => {
    setSelectedStudent(params.row as StudentRecord);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const onFilterChange =
    (field: keyof FilterCriteria) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setFilterCriteria({ ...filterCriteria, [field]: event.target.value });
    };

  const applyFilters = () => {
    fetchFilteredStudents();
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // DataGrid column definitions
  const dataGridColumns: GridColDef[] = [
    // {
    //   field: 'school_code',
    //   headerName: 'School Code',
    //   width: 120,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Typography variant="body2" sx={{ fontWeight: 500 }}>
    //       {preserveOriginalCase(params.row.school_code)}
    //     </Typography>
    //   ),
    // },
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
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {preserveOriginalCase(student.name_to_appear_on_id)}
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
        <Typography variant="body2">{preserveOriginalCase(params.row.level)}</Typography>
      ),
    },
    {
      field: 'section_course',
      headerName: 'Section/Course',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{preserveOriginalCase(params.row.section_course)}</Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Enrollment Date',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const enrollmentDate = new Date(params.row.created_at);
        return enrollmentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'id_info_status',
      headerName: 'ID Info Status',
      width: 115,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={formatStatusLabel(params.row.id_info_status)}
          color={getStatusBadgeColor(params.row.id_info_status) as any}
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
        const approvalDate = new Date(params.row.id_info_approval_date);
        return approvalDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'class_details_status',
      headerName: 'Class Details Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={formatStatusLabel(params.row.class_details_status)}
          color={getStatusBadgeColor(params.row.class_details_status) as any}
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
        const approvalDate = new Date(params.row.class_details_approval_date);
        return approvalDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'id_print_status',
      headerName: 'ID Print Status',
      width: 115,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={formatStatusLabel(params.row.id_print_status)}
          color={getStatusBadgeColor(params.row.id_print_status) as any}
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
        const printDate = new Date(params.row.id_print_date);
        return printDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Statistics Cards - Row 1 */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {/* Card 1: Total Students */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Total Students
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#1e293b',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.total_students}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#e0e7ff',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:account-group" fontSize={24} color="#2563eb" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Approved ID Info */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Approved ID Info
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#10b981',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.approved_id_info_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#d1fae5',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:check-circle" fontSize={24} color="#10b981" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Pending ID Info */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Pending ID Info
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#f59e0b',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.pending_id_info_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#fef3c7',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:clock-outline" fontSize={24} color="#f59e0b" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Approved Class Details */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Approved Class Details
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#10b981',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.approved_class_details_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#d1fae5',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:check-circle" fontSize={24} color="#10b981" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Cards - Row 2 */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {/* Card 5: Pending Class Details - CLICKABLE */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderColor: '#f59e0b',
              },
            }}
            onClick={() => {
              window.location.href = paths.management;
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Pending Class Details
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#f59e0b',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.pending_class_details_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#fef3c7',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:clock-outline" fontSize={24} color="#f59e0b" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 6: Printed IDs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Printed IDs
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#10b981',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.printed_ids_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#d1fae5',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:printer" fontSize={24} color="#10b981" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 7: Total Pending IDs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Total Pending IDs
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#f59e0b',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.total_pending_ids_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#fef3c7',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:printer-alert" fontSize={24} color="#f59e0b" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 8: Total Reprinted IDs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Total Reprinted IDs
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#8b5cf6',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {statistics.total_reprinted_ids_count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#ede9fe',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <IconifyIcon icon="mdi:refresh" fontSize={24} color="#8b5cf6" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar - NO EXPORT BUTTONS */}
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
            value={searchQuery}
            onChange={onSearchChange}
            size="small"
            variant="outlined"
            fullWidth={isMobileDevice}
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
            onClick={openFilterModal}
            fullWidth={isMobileDevice}
            sx={{
              textTransform: 'none',
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Filter Records
          </Button>
        </Stack>
      </Stack>

      {/* Filter Modal */}
      <Dialog
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Student Records"
        maxWidth={700}
        disableBackdropClick={true}
        showLoading={isFilterLoading}
        loadingTitle="Applying filter..."
        actions={[
          {
            label: 'Reset',
            onClick: resetAllFilters,
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:refresh',
          },
          {
            label: 'Apply Filter',
            onClick: applyFilters,
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
            {/* ❌ School Code removed from filter options */}

            <TextField
              fullWidth
              size="small"
              label="Student ID No."
              placeholder="Enter student ID number"
              value={filterCriteria.student_id}
              onChange={onFilterChange('student_id')}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Student Type</InputLabel>
              <Select
                value={filterCriteria.student_type}
                label="Student Type"
                onChange={onFilterChange('student_type')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New Student</MenuItem>
                <MenuItem value="old">Old Student</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select value={filterCriteria.level} label="Level" onChange={onLevelChange}>
                <MenuItem value="">All</MenuItem>
                {levelOptions.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Section/Course</InputLabel>
              <Select
                value={filterCriteria.section_course}
                label="Section/Course"
                onChange={onFilterChange('section_course')}
              >
                <MenuItem value="">All</MenuItem>
                {sectionOptions.map((section) => (
                  <MenuItem key={section} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>ID Info Status</InputLabel>
              <Select
                value={filterCriteria.id_info_status}
                label="ID Info Status"
                onChange={onFilterChange('id_info_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Class Details Status</InputLabel>
              <Select
                value={filterCriteria.class_details_status}
                label="Class Details Status"
                onChange={onFilterChange('class_details_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>ID Printing Status</InputLabel>
              <Select
                value={filterCriteria.id_print_status}
                label="ID Printing Status"
                onChange={onFilterChange('id_print_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="printed">Printed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>ID Reprint Status</InputLabel>
              <Select
                value={filterCriteria.id_reprint_status}
                label="ID Reprint Status"
                onChange={onFilterChange('id_reprint_status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>

            <Divider />

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
                onChange={onFilterChange('approved_id_info_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.approved_id_info_date_to}
                onChange={onFilterChange('approved_id_info_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

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
                onChange={onFilterChange('approved_class_details_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.approved_class_details_date_to}
                onChange={onFilterChange('approved_class_details_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

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
                onChange={onFilterChange('enrollment_date_from')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="To"
                type="date"
                value={filterCriteria.enrollment_date_to}
                onChange={onFilterChange('enrollment_date_to')}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        }
      />

      {/* DataGrid - NO CHECKBOX SELECTION for Admin */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #e9edf4', overflow: 'hidden' }}
      >
        <DataGrid
          rowHeight={64}
          rows={filteredStudents}
          columns={dataGridColumns}
          pageSizeOptions={isMobileDevice ? [5, 10, 25] : [10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: isMobileDevice ? 5 : 10 } },
            sorting: { sortModel: [{ field: 'name_to_appear_on_id', sort: 'asc' }] },
          }}
          onRowClick={onRowClick}
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
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } },
          }}
        />
      </Paper>

      {/* Student Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title="Student Information"
        maxWidth={600}
        hideCloseButton={false}
        disableBackdropClick={true}
        content={
          selectedStudent && (
            <Stack spacing={3} direction="column">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={getStudentPhotoUrl(
                    selectedStudent.school_code,
                    selectedStudent.student_id,
                    selectedStudent.last_name,
                  )}
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    bgcolor: '#2563eb',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 600,
                  }}
                >
                  {selectedStudent.name_to_appear_on_id?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                  >
                    {preserveOriginalCase(selectedStudent.name_to_appear_on_id)}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {/* SECTION 1: School Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    A. School Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Level
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {preserveOriginalCase(selectedStudent.level)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Section/Course
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {preserveOriginalCase(selectedStudent.section_course)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Student Type
                  </Typography>
                  <Chip
                    label={formatStudentTypeLabel(selectedStudent.student_type)}
                    color={getStudentTypeBadgeColor(selectedStudent.student_type) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    DepEd ESC Grantee
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.esc_voucher_recipient?.toLowerCase() === 'yes' ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    ESC Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.esc_number || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Enrollment Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>

                {/* SECTION 2: Personal Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    B. Personal Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    First Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatName(selectedStudent.first_name)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Middle Initial
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatMiddleInitial(selectedStudent.middle_initial)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Last Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatName(selectedStudent.last_name)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Suffix Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatName(selectedStudent.suffix)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Nickname
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatName(selectedStudent.nick_name)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    LRN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.lrn || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.birth_date
                      ? new Date(selectedStudent.birth_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.gender ? capitalizeFirstLetter(selectedStudent.gender) : '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>

                {/* SECTION 3: Additional Information (ID Application Status) */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    C. Additional Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Name to Appear on ID Card
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {preserveOriginalCase(selectedStudent.name_to_appear_on_id)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    ID Info Status
                  </Typography>
                  <Chip
                    label={formatStatusLabel(selectedStudent.id_info_status)}
                    color={getStatusBadgeColor(selectedStudent.id_info_status) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    ID Info Approval Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Class Details Status
                  </Typography>
                  <Chip
                    label={formatStatusLabel(selectedStudent.class_details_status)}
                    color={getStatusBadgeColor(selectedStudent.class_details_status) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Class Details Approval Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    ID Print Status
                  </Typography>
                  <Chip
                    label={formatStatusLabel(selectedStudent.id_print_status)}
                    color={getStatusBadgeColor(selectedStudent.id_print_status) as any}
                    size="small"
                    sx={{ fontWeight: 500, mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    ID Print Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.id_print_date
                      ? new Date(selectedStudent.id_print_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>

                {/* Residential Address */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Residential Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {preserveOriginalCase(selectedStudent.present_address) || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Emergency Contact Person and Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.emergency_contact || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>

                {/* SECTION 4: Parent/Guardian Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    D. Parent/Guardian Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Parent/Guardian Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.parent_full_name || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
                  >
                    Parent/Guardian Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.parent_email || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )
        }
      />
    </Box>
  );
};

export default DashboardContent;
