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
import {
  DataGrid,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from '@mui/x-data-grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import * as XLSX from 'xlsx';
import IconifyIcon from 'components/base/IconifyIcon';
import { Dialog } from 'components/dialogs/Dialog';
import PageLoader from 'components/loading/PageLoader';
import DataGridPagination from 'components/pagination/DataGridPagination';

/**
 * Interface matching the backend StudentIdInfo response structure
 */
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
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  id_print_date?: string | null;
}

/**
 * Interface for the frontend StudentRecord used in DataGrid
 */
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
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  id_print_date?: string | null;
}

/**
 * Filter criteria interface
 */
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

/**
 * Statistics interface
 * ✅ TASK 1 & 2: Updated interface with correct names
 */
interface Statistics {
  total: number;
  approvedIdInfo: number;
  pendingIdInfo: number;
  approvedClassDetails: number;
  pendingClassDetails: number;
  printedIds: number;
  totalPendingIds: number; // ✅ Task 1: Renamed from pendingPrintIds
  totalReprintedIds: number; // ✅ Task 2: Renamed from reprintedIds (will be sum)
}

/**
 * Returns the appropriate MUI color based on status
 */
const getStatusColor = (status: string) => {
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

/**
 * Dashboard component for Super Admin - displays all students
 */
const DashboardContent = () => {
  const { get } = useRouteApiSetup();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const fetchedRef = useRef(false);
  const getRef = useRef(get);

  // Dynamic filter options
  const [schoolCodeOptions, setSchoolCodeOptions] = useState<string[]>([]);
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

  /**
   * Calculate statistics from students data
   * ✅ TASK 1 & 2: Fixed calculation
   */
  const statistics: Statistics = useMemo(() => {
    const total = students.length;
    const approvedIdInfo = students.filter(
      (s) => s.id_info_status?.toLowerCase() === 'approved',
    ).length;
    const pendingIdInfo = students.filter(
      (s) => s.id_info_status?.toLowerCase() === 'pending',
    ).length;
    const approvedClassDetails = students.filter(
      (s) => s.class_details_status?.toLowerCase() === 'approved',
    ).length;
    const pendingClassDetails = students.filter(
      (s) => s.class_details_status?.toLowerCase() === 'pending',
    ).length;
    const printedIds = students.filter(
      (s) => s.id_print_status?.toLowerCase() === 'printed',
    ).length;

    // ✅ Task 1: Total Pending IDs (count of pending print status)
    const totalPendingIds = students.filter(
      (s) =>
        s.id_print_status?.toLowerCase() === 'pending' ||
        s.id_print_status?.toLowerCase() === 'pending_print',
    ).length;

    // ✅ Task 2: SUM of id_reprint_count values, not count of records
    const totalReprintedIds = students.reduce((sum, student) => {
      return sum + (student.id_reprint_count || 0);
    }, 0);

    return {
      total,
      approvedIdInfo,
      pendingIdInfo,
      approvedClassDetails,
      pendingClassDetails,
      printedIds,
      totalPendingIds,
      totalReprintedIds,
    };
  }, [students]);

  /**
   * Filter students based on search text
   */
  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) {
      return students;
    }

    const searchLower = searchText.toLowerCase();
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
  }, [students, searchText]);

  /**
   * Extract unique filter options from students
   */
  const extractFilterOptions = (studentRecords: StudentRecord[]) => {
    const schoolCodes = [
      ...new Set(studentRecords.map((s) => s.school_code).filter(Boolean)),
    ].sort();
    const levels = [...new Set(studentRecords.map((s) => s.level).filter(Boolean))].sort();
    const sections = [
      ...new Set(studentRecords.map((s) => s.section_course).filter(Boolean)),
    ].sort();
    setSchoolCodeOptions(schoolCodes);
    setLevelOptions(levels);
    setSectionOptions(sections);
  };

  /**
   * Fetches all student data from the API
   */
  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      const response = await getRef.current<{
        success: boolean;
        data: StudentInformation[];
      }>('/admin/students');

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
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          esc_voucher_recipient: student.esc_voucher_recipient || false,
          esc_number: student.esc_number || null,
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
      setLoading(false);
    }
  };

  /**
   * Fetches filtered student data from the API
   * ✅ TASK 3: All filter parameters are correctly sent to backend
   */
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
      // ✅ Task 3a: Approved ID Info Date Range
      if (filterCriteria.approved_id_info_date_from)
        params.append('id_info_approval_date_from', filterCriteria.approved_id_info_date_from);
      if (filterCriteria.approved_id_info_date_to)
        params.append('id_info_approval_date_to', filterCriteria.approved_id_info_date_to);
      // ✅ Task 3b: Approved Class Details Date Range
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
      // ✅ Task 3c: Enrollment Date Range
      if (filterCriteria.enrollment_date_from)
        params.append('date_from', filterCriteria.enrollment_date_from);
      if (filterCriteria.enrollment_date_to)
        params.append('date_to', filterCriteria.enrollment_date_to);

      const queryString = params.toString();
      const url = queryString ? `/admin/students?${queryString}` : '/admin/students';

      const response = await getRef.current<{
        success: boolean;
        data: StudentInformation[];
      }>(url);

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
          id_info_approval_date: student.id_info_approval_date || null,
          class_details_approval_date: student.class_details_approval_date || null,
          esc_voucher_recipient: student.esc_voucher_recipient || false,
          esc_number: student.esc_number || null,
          id_print_date: student.id_print_date || null,
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

  /**
   * Reset filter
   */
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

  // Update section options when level changes
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

  /**
   * Export selected rows to Excel
   * ✅ TASK 4: All missing fields included
   */
  const exportSelectedToExcel = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one student to export');
      return;
    }

    const dataToExport = filteredStudents.filter((student) => selectedRows.includes(student.id));

    const worksheetData = dataToExport.map((student) => ({
      'School Code': student.school_code || '—',
      'Student ID No.': student.student_id || '—',
      'Last Name': student.last_name || '—',
      'First Name': student.first_name || '—',
      'Middle Initial': student.middle_initial || '—',
      'Name to Appear on ID Card': student.name_to_appear_on_id || '—',
      Level: student.level || '—',
      'Section/Course': student.section_course || '—',
      'Residential Address': student.present_address || '—',
      // ✅ Task 4a: Gender
      Gender: student.gender || '—',
      // ✅ Task 4b: Date of Birth (yyyy-mm-dd)
      'Date of Birth': student.birth_date
        ? new Date(student.birth_date).toISOString().split('T')[0]
        : '—',
      'Emergency Contact Person': student.emergency_contact?.split(' - ')[0] || '—',
      'Emergency Contact Number': student.emergency_contact?.split(' - ')[1] || '—',
      LRN: student.lrn || '—',
      'ESC Grantee': student.esc_voucher_recipient ? 'Yes' : 'No',
      // ✅ Task 4c: ESC Number
      'ESC Number': student.esc_number || '—',
      'ID Info Status': student.id_info_status || '—',
      // ✅ Task 4d: ID Info Approval Date
      'ID Info Approval Date': student.id_info_approval_date
        ? new Date(student.id_info_approval_date).toISOString().split('T')[0]
        : '—',
      'Class Details Status': student.class_details_status || '—',
      // ✅ Task 4e: Class Details Approval Date
      'Class Details Approval Date': student.class_details_approval_date
        ? new Date(student.class_details_approval_date).toISOString().split('T')[0]
        : '—',
      'ID Print Status': student.id_print_status || '—',
      // ✅ Task 4f: ID Print Date
      'ID Print Date': student.id_print_date
        ? new Date(student.id_print_date).toISOString().split('T')[0]
        : '—',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Students');
    XLSX.writeFile(wb, `students_selected_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Export all students to Excel
   * ✅ TASK 4: All missing fields included
   */
  const exportAllToExcel = () => {
    if (filteredStudents.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheetData = filteredStudents.map((student) => ({
      'School Code': student.school_code || '—',
      'Student ID No.': student.student_id || '—',
      'Last Name': student.last_name || '—',
      'First Name': student.first_name || '—',
      'Middle Initial': student.middle_initial || '—',
      'Name to Appear on ID Card': student.name_to_appear_on_id || '—',
      Level: student.level || '—',
      'Section/Course': student.section_course || '—',
      'Residential Address': student.present_address || '—',
      // ✅ Task 4a: Gender
      Gender: student.gender || '—',
      // ✅ Task 4b: Date of Birth (yyyy-mm-dd)
      'Date of Birth': student.birth_date
        ? new Date(student.birth_date).toISOString().split('T')[0]
        : '—',
      'Emergency Contact Person': student.emergency_contact?.split(' - ')[0] || '—',
      'Emergency Contact Number': student.emergency_contact?.split(' - ')[1] || '—',
      LRN: student.lrn || '—',
      'ESC Grantee': student.esc_voucher_recipient ? 'Yes' : 'No',
      // ✅ Task 4c: ESC Number
      'ESC Number': student.esc_number || '—',
      'ID Info Status': student.id_info_status || '—',
      // ✅ Task 4d: ID Info Approval Date
      'ID Info Approval Date': student.id_info_approval_date
        ? new Date(student.id_info_approval_date).toISOString().split('T')[0]
        : '—',
      'Class Details Status': student.class_details_status || '—',
      // ✅ Task 4e: Class Details Approval Date
      'Class Details Approval Date': student.class_details_approval_date
        ? new Date(student.class_details_approval_date).toISOString().split('T')[0]
        : '—',
      'ID Print Status': student.id_print_status || '—',
      // ✅ Task 4f: ID Print Date
      'ID Print Date': student.id_print_date
        ? new Date(student.id_print_date).toISOString().split('T')[0]
        : '—',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Students');
    XLSX.writeFile(wb, `students_all_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Handles row click to open student details modal
   */
  const handleRowClick = (params: GridRowParams) => {
    setSelectedStudent(params.row as StudentRecord);
    setModalOpen(true);
  };

  /**
   * Closes the student details modal
   */
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  /**
   * Handles selection change
   */
  const handleSelectionChange = (selection: any) => {
    setSelectedRows(selection);
  };

  /**
   * Handle filter button click
   */
  const handleFilterClick = () => {
    setFilterModalOpen(true);
  };

  /**
   * Handle filter input change
   */
  const handleFilterChange =
    (field: keyof FilterCriteria) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setFilterCriteria({
        ...filterCriteria,
        [field]: event.target.value,
      });
    };

  /**
   * Apply filter
   */
  const applyFilter = () => {
    fetchFilteredStudents();
  };

  /**
   * Handle search text change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  /**
   * DataGrid column definitions
   * ✅ TASK 5 & 6: All fields displayed correctly
   */
  const columns: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      width: 64,
    },
    {
      field: 'school_code',
      headerName: 'School Code',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.school_code}
        </Typography>
      ),
    },
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
    // ✅ Task 6a: ID Info Approval Date displayed
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
    // ✅ Task 6b: Class Details Approval Date displayed
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
    // ✅ Task 6c: ID Print Date displayed
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
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {/* Row 1 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.total}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#eef2ff',
                    color: '#2563eb',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:account-group" sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.approvedIdInfo}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#d1fae5',
                    color: '#10b981',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:check-circle" sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.pendingIdInfo}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#f59e0b',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:clock-outline" sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.approvedClassDetails}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#d1fae5',
                    color: '#10b981',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:check-circle" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.pendingClassDetails}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#f59e0b',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:clock-outline" sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.printedIds}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#d1fae5',
                    color: '#10b981',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:printer" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ TASK 1: Changed "Pending Print IDs" to "Total Pending IDs" */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.totalPendingIds}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#f59e0b',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:printer-alert" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ TASK 2: Changed "Reprinted IDs" to "Total Reprinted IDs" and uses sum */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e9edf4',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                    {statistics.totalReprintedIds}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: '#ede9fe',
                    color: '#8b5cf6',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <IconifyIcon icon="mdi:refresh" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
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
          sx={{
            width: { xs: '100%', sm: 'auto' },
            mb: { xs: 2, sm: 0 },
          }}
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
            fullWidth={isMobile}
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {selectedRows.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<IconifyIcon icon="mdi:file-excel" />}
              onClick={exportSelectedToExcel}
              fullWidth={isMobile}
              sx={{
                textTransform: 'none',
                borderColor: '#e2e8f0',
                color: '#475569',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              Export Selected ({selectedRows.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="mdi:file-excel" />}
            onClick={exportAllToExcel}
            fullWidth={isMobile}
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
            {/* a. School Code - Available for Super Admin */}
            <FormControl fullWidth size="small">
              <InputLabel>School Code</InputLabel>
              <Select
                value={filterCriteria.school_code}
                label="School Code"
                onChange={handleFilterChange('school_code')}
              >
                <MenuItem value="">All</MenuItem>
                {schoolCodeOptions.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            {/* j. Approved ID Info Date Range - Task 3a */}
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

            {/* k. Approved Class Details Date Range - Task 3b */}
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

            {/* l. Enrollment Date Range - Task 3c */}
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
        sx={{
          borderRadius: 3,
          border: '1px solid #e9edf4',
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rowHeight={64}
          rows={filteredStudents}
          columns={columns}
          pageSizeOptions={isMobile ? [5, 10, 25] : [10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: isMobile ? 5 : 10 } },
            sorting: {
              sortModel: [{ field: 'name_to_appear_on_id', sort: 'asc' }],
            },
          }}
          checkboxSelection
          disableRowSelectionOnClick={false}
          onRowClick={handleRowClick}
          onRowSelectionModelChange={handleSelectionChange}
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

      {/* Student Details Modal - ✅ TASK 7: All fields displayed */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        title="Student Information"
        maxWidth={600}
        hideCloseButton={false}
        disableBackdropClick={true}
        content={
          selectedStudent && (
            <Stack spacing={3} direction="column">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Avatar
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
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 0.5 }}
                  >
                    {selectedStudent.name_to_appear_on_id}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    A. Personal Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    First Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.first_name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Middle Initial
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.middle_initial || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Last Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.last_name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Suffix Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.suffix || '—'}
                  </Typography>
                </Grid>
                {/* ✅ Task 7a: Nickname */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Nickname
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.nick_name || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    LRN
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.lrn || '—'}
                  </Typography>
                </Grid>
                {/* ✅ Task 7b: Date of Birth */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.birth_date
                      ? new Date(selectedStudent.birth_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>
                {/* ✅ Task 7c: Gender */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.gender || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    B. School Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Level
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.level || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Section/Course
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.section_course || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Student Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.student_type === 'new' ? 'New Student' : 'Old Student'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ESC Voucher
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.esc_voucher_recipient ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                {/* ✅ Task 7d: ESC Number */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ESC Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.esc_number || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Enrollment Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
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
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    C. ID Application Status
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                {/* ✅ Task 7e: ID Info Approval Date */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ID Info Approval Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
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
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                {/* ✅ Task 7f: Class Details Approval Date */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Class Details Approval Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
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
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                {/* ✅ Task 7g: ID Print Date */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ID Print Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.id_print_date
                      ? new Date(selectedStudent.id_print_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    D. Parent/Guardian Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Parent/Guardian Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.parent_full_name || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Parent/Guardian Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.parent_email || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: '#e9edf4', my: 1 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 1 }}>
                    E. Address & Contact Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Residential Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.present_address || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Emergency Contact Person and Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {selectedStudent.emergency_contact || 'Not provided'}
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
