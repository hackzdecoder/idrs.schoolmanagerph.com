import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import Swal from 'sweetalert2';
import IconifyIcon from 'components/base/IconifyIcon';
import { Dialog, OnLoader } from 'components/dialogs/Dialog';

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
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  parent_first_name?: string | null;
  parent_surname?: string | null;
  residential_address?: string | null;
  emergency_contact_person?: string | null;
  emergency_contact_number?: string | null;
  surname?: string;
}

interface StudentDetailsProps {
  student: StudentRecord | null;
  onClose?: () => void;
  onUpdate?: () => void;
}

// Helper function to get student photo URL
const getStudentPhotoUrl = (schoolCode: string, studentId: string, surname: string): string => {
  if (!schoolCode || !studentId || !surname) return '';
  return `https://schoolmanagerph.com/idrs-school-ids/${schoolCode}/${studentId}_${surname}.jpg`;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return dateString.substring(0, 10);
};

// Format helpers (following DashboardContent style)
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatName = (name: string | null | undefined): string => {
  if (!name) return '—';
  return name;
};

const preserveOriginalCase = (text: string | null | undefined): string => {
  if (!text) return '—';
  return text;
};

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onClose, onUpdate }) => {
  const { put } = useRouteApiSetup();
  const [updating, setUpdating] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  // Check if class details is already approved
  const isClassDetailsApproved = student?.class_details_status?.toLowerCase() === 'approved';

  // Generate photo URL for the current student
  const studentPhotoUrl =
    student?.school_code && student?.student_id && student?.last_name
      ? getStudentPhotoUrl(student.school_code, student.student_id, student.last_name)
      : '';

  // Student data for display (read-only fields)
  const studentData = {
    first_name: student?.first_name || '',
    middle_initial: student?.middle_initial || '',
    surname: student?.last_name || '',
    suffix_name: student?.suffix || '',
    nick_name: student?.nick_name || '',
    residential_address: student?.residential_address || student?.present_address || '',
    birth_date: formatDate(student?.birth_date),
    gender: student?.gender || '',
    emergency_contact_person:
      student?.emergency_contact_person || student?.emergency_contact?.split(' - ')[0] || '',
    emergency_contact_number:
      student?.emergency_contact_number || student?.emergency_contact?.split(' - ')[1] || '',
    parent_first_name: student?.parent_first_name || '',
    parent_surname: student?.parent_surname || '',
    parent_email: student?.parent_email || '',
    name_to_appear_on_id: student?.name_to_appear_on_id || '',
    esc_voucher_recipient: student?.esc_voucher_recipient || false,
    esc_number: student?.esc_number || '',
    level: student?.level || '',
    section_course: student?.section_course || '',
    lrn: student?.lrn || '',
    student_type: student?.student_type || '',
    email: student?.email || '',
  };

  // Editable school information state
  const [editableSchoolData, setEditableSchoolData] = useState({
    level: studentData.level,
    section_course: studentData.section_course,
    lrn: studentData.lrn,
    esc_voucher_recipient: studentData.esc_voucher_recipient,
    esc_number: studentData.esc_number,
  });

  const handleSchoolFieldChange = (field: string, value: string | boolean) => {
    if (isClassDetailsApproved) return;
    setEditableSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setConfirmModalOpen(false);
    setIsCheckboxChecked(false);
  };

  const saveSchoolInformation = async (): Promise<boolean> => {
    if (!student?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Student ID not found',
        confirmButtonColor: '#2563eb',
      });
      return false;
    }

    const updateData: Record<string, any> = {};

    if (editableSchoolData.level !== student?.level) {
      updateData.level = editableSchoolData.level;
    }
    if (editableSchoolData.section_course !== student?.section_course) {
      updateData.section_course = editableSchoolData.section_course;
    }
    if (editableSchoolData.lrn !== student?.lrn) {
      updateData.lrn = editableSchoolData.lrn;
    }
    if (editableSchoolData.esc_voucher_recipient !== student?.esc_voucher_recipient) {
      updateData.esc_voucher_recipient = editableSchoolData.esc_voucher_recipient;
    }
    if (editableSchoolData.esc_number !== student?.esc_number) {
      updateData.esc_number = editableSchoolData.esc_number || '';
    }

    if (Object.keys(updateData).length === 0) {
      return true;
    }

    try {
      const response = await put<{ success: boolean; response: string }>(
        `/admin/students/${student.id}`,
        updateData,
      );

      if (response.success) {
        return true;
      } else {
        throw new Error(response.response || 'Update failed');
      }
    } catch (_error) {
      console.error('Failed to save school information:', _error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to save school information.',
        confirmButtonColor: '#2563eb',
      });
      return false;
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!isCheckboxChecked) return;
    if (!student) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Student information is missing',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    if (isClassDetailsApproved) {
      Swal.fire({
        icon: 'info',
        title: 'Already Approved',
        text: 'Class details have already been approved for this student.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // Validate required fields
    if (!editableSchoolData.level) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Level is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableSchoolData.section_course) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Section/Course is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    try {
      setUpdating(true);
      setConfirmModalOpen(false);

      const saved = await saveSchoolInformation();
      if (!saved) return;

      const classDetailsResponse = await put<{ success: boolean; response: string }>(
        `/admin/students/${student.id}`,
        { class_details_status: 'approved' },
      );

      if (!classDetailsResponse.success) {
        throw new Error(classDetailsResponse.response || 'Failed to approve class details');
      }

      if (onUpdate) {
        await onUpdate();
      }

      Swal.fire({
        icon: 'success',
        title: 'Enrollment Confirmed!',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        if (onClose) onClose();
      });
    } catch (_error) {
      console.error('Failed to approve student:', _error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to confirm enrollment. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setUpdating(false);
      setIsCheckboxChecked(false);
    }
  };

  const openConfirmModal = () => {
    if (isClassDetailsApproved) {
      Swal.fire({
        icon: 'info',
        title: 'Already Approved',
        text: 'Class details have already been approved for this student. No further edits or approvals are allowed.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // ✅ REMOVED: The validation that checks if ID Info Status is approved
    // School Admin can now confirm enrollment regardless of ID Info Status

    // Validate required school fields
    if (!editableSchoolData.level) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Level is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableSchoolData.section_course) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Section/Course is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setConfirmModalOpen(true);
  };

  if (!student) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          No student selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid #e9edf4',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          mx: 'auto',
        }}
      >
        {/* Header with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            src={studentPhotoUrl}
            sx={{
              width: { xs: 64, sm: 80 },
              height: { xs: 64, sm: 80 },
              bgcolor: '#2563eb',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 600,
            }}
          >
            {studentData.name_to_appear_on_id?.charAt(0) || 'S'}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {preserveOriginalCase(studentData.name_to_appear_on_id)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Student ID: {student.student_id}
            </Typography>
          </Box>
        </Box>

        {/* ========================================================= */}
        {/* SECTION 1: A. School Information (EDITABLE) */}
        {/* ========================================================= */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
          A. School Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Level *"
              value={editableSchoolData.level}
              onChange={(e) => handleSchoolFieldChange('level', e.target.value)}
              placeholder="e.g., Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12"
              disabled={isClassDetailsApproved}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Section/Course *"
              value={editableSchoolData.section_course}
              onChange={(e) => handleSchoolFieldChange('section_course', e.target.value)}
              placeholder="e.g., Section A, STEM, ABM, HUMSS"
              disabled={isClassDetailsApproved}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" required disabled={isClassDetailsApproved}>
              <InputLabel>DepEd ESC Grantee *</InputLabel>
              <Select
                value={editableSchoolData.esc_voucher_recipient ? 'Yes' : 'No'}
                label="DepEd ESC Grantee *"
                onChange={(e) =>
                  handleSchoolFieldChange('esc_voucher_recipient', e.target.value === 'Yes')
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {editableSchoolData.esc_voucher_recipient && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="ESC Number (Optional)"
                value={editableSchoolData.esc_number}
                onChange={(e) => handleSchoolFieldChange('esc_number', e.target.value)}
                placeholder="Enter ESC number if available"
                disabled={isClassDetailsApproved}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="LRN (Optional)"
              value={editableSchoolData.lrn}
              onChange={(e) => handleSchoolFieldChange('lrn', e.target.value)}
              placeholder="Enter LRN if available"
              disabled={isClassDetailsApproved}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Class Details Status:
              </Typography>
              <Chip
                label={student.class_details_status || 'Pending'}
                color={isClassDetailsApproved ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 500 }}
              />
              {student.class_details_approval_date && (
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Approved: {new Date(student.class_details_approval_date).toLocaleDateString()}
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Confirm Enrollment Button - Placed under School Information */}
        {!isClassDetailsApproved && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={openConfirmModal}
              startIcon={<IconifyIcon icon="mdi:check-circle" />}
              disabled={updating}
              sx={{
                bgcolor: updating ? '#94a3b8' : '#22c55e',
                '&:hover': { bgcolor: updating ? '#94a3b8' : '#16a34a' },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {updating ? 'Confirming...' : 'Confirm Enrollment'}
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ========================================================= */}
        {/* SECTION 2: B. Personal Information (READ-ONLY) */}
        {/* ========================================================= */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
          B. Personal Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              First Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {formatName(studentData.first_name)}
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
              {studentData.middle_initial || '—'}
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
              {formatName(studentData.surname)}
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
              {formatName(studentData.suffix_name)}
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
              {formatName(studentData.nick_name)}
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
              {studentData.birth_date
                ? new Date(studentData.birth_date).toLocaleDateString('en-US', {
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
              {studentData.gender ? capitalizeFirstLetter(studentData.gender) : '—'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ========================================================= */}
        {/* SECTION 3: C. Additional Information (READ-ONLY) */}
        {/* Following DashboardContent.tsx modal structure */}
        {/* ========================================================= */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
          C. Additional Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Name to Appear on ID Card */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              Name to Appear on ID Card
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {preserveOriginalCase(studentData.name_to_appear_on_id)}
            </Typography>
          </Grid>

          {/* ID Info Status and Approval Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              ID Info Status
            </Typography>
            <Chip
              label={student?.id_info_status || 'Pending'}
              color={student?.id_info_status?.toLowerCase() === 'approved' ? 'success' : 'warning'}
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
              {student?.id_info_approval_date
                ? new Date(student.id_info_approval_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </Typography>
          </Grid>

          {/* Class Details Status and Approval Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              Class Details Status
            </Typography>
            <Chip
              label={student?.class_details_status || 'Pending'}
              color={isClassDetailsApproved ? 'success' : 'warning'}
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
              {student?.class_details_approval_date
                ? new Date(student.class_details_approval_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </Typography>
          </Grid>

          {/* ID Print Status and Print Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              ID Print Status
            </Typography>
            <Chip
              label={student?.id_print_status || 'Pending'}
              color={student?.id_print_status?.toLowerCase() === 'printed' ? 'success' : 'warning'}
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
              {student?.id_print_date
                ? new Date(student.id_print_date).toLocaleDateString('en-US', {
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
              {preserveOriginalCase(studentData.residential_address) || 'Not provided'}
            </Typography>
          </Grid>

          {/* Emergency Contact Person and Number (combined like Dashboard) */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              Emergency Contact Person and Number
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {studentData.emergency_contact_person && studentData.emergency_contact_number
                ? `${studentData.emergency_contact_person} - ${studentData.emergency_contact_number}`
                : studentData.emergency_contact_person ||
                  studentData.emergency_contact_number ||
                  'Not provided'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ========================================================= */}
        {/* SECTION 4: D. Parent/Guardian Information (READ-ONLY) */}
        {/* ========================================================= */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
          D. Parent/Guardian Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}
            >
              Parent/Guardian Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {studentData.parent_first_name || studentData.parent_surname
                ? `${formatName(studentData.parent_first_name)} ${formatName(studentData.parent_surname)}`.trim()
                : 'Not provided'}
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
              {studentData.parent_email || 'Not provided'}
            </Typography>
          </Grid>
        </Grid>

        {/* Back button only (when already approved) */}
        {isClassDetailsApproved && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Back
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleCloseModal}
        title="Confirm Enrollment"
        maxWidth={600}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        showLoading={updating}
        loadingTitle="Confirming..."
        actions={[
          {
            label: 'Cancel',
            onClick: handleCloseModal,
            color: 'secondary',
            variant: 'outlined',
            disabled: updating,
          },
          {
            label: 'Confirm Enrollment',
            onClick: handleConfirmEnrollment,
            color: 'success',
            variant: 'contained',
            disabled: !isCheckboxChecked || updating,
            startIcon: 'mdi:check-circle',
          },
        ]}
        content={
          <Stack spacing={3} direction="column" sx={{ mt: 1, maxHeight: '70vh', pr: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Please review the student information below before confirming enrollment.
            </Typography>

            {/* A. School Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              A. School Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Level
                </Typography>
                <Typography variant="body2">{editableSchoolData.level || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Section/Course
                </Typography>
                <Typography variant="body2">{editableSchoolData.section_course || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  LRN
                </Typography>
                <Typography variant="body2">{editableSchoolData.lrn || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ESC Voucher Recipient
                </Typography>
                <Typography variant="body2">
                  {editableSchoolData.esc_voucher_recipient ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              {editableSchoolData.esc_voucher_recipient && editableSchoolData.esc_number && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    ESC Number
                  </Typography>
                  <Typography variant="body2">{editableSchoolData.esc_number || '—'}</Typography>
                </Grid>
              )}
            </Grid>

            {/* B. Personal Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              B. Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  First Name
                </Typography>
                <Typography variant="body2">{studentData.first_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Middle Initial
                </Typography>
                <Typography variant="body2">{studentData.middle_initial || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Last Name
                </Typography>
                <Typography variant="body2">{studentData.surname || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Suffix Name
                </Typography>
                <Typography variant="body2">{studentData.suffix_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Nickname
                </Typography>
                <Typography variant="body2">{studentData.nick_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Date of Birth
                </Typography>
                <Typography variant="body2">{studentData.birth_date || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Gender
                </Typography>
                <Typography variant="body2">{studentData.gender || '—'}</Typography>
              </Grid>
            </Grid>

            {/* C. Additional Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              C. Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Name to Appear on ID Card
                </Typography>
                <Typography variant="body2">{studentData.name_to_appear_on_id || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ID Info Status
                </Typography>
                <Chip
                  label={student?.id_info_status || 'Pending'}
                  color={
                    student?.id_info_status?.toLowerCase() === 'approved' ? 'success' : 'warning'
                  }
                  size="small"
                  sx={{ fontWeight: 500, mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ID Info Approval Date
                </Typography>
                <Typography variant="body2">
                  {student?.id_info_approval_date
                    ? new Date(student.id_info_approval_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Class Details Status
                </Typography>
                <Chip
                  label={student?.class_details_status || 'Pending'}
                  color={isClassDetailsApproved ? 'success' : 'warning'}
                  size="small"
                  sx={{ fontWeight: 500, mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Class Details Approval Date
                </Typography>
                <Typography variant="body2">
                  {student?.class_details_approval_date
                    ? new Date(student.class_details_approval_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ID Print Status
                </Typography>
                <Chip
                  label={student?.id_print_status || 'Pending'}
                  color={
                    student?.id_print_status?.toLowerCase() === 'printed' ? 'success' : 'warning'
                  }
                  size="small"
                  sx={{ fontWeight: 500, mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ID Print Date
                </Typography>
                <Typography variant="body2">
                  {student?.id_print_date
                    ? new Date(student.id_print_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Residential Address
                </Typography>
                <Typography variant="body2">{studentData.residential_address || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Emergency Contact Person and Number
                </Typography>
                <Typography variant="body2">
                  {studentData.emergency_contact_person && studentData.emergency_contact_number
                    ? `${studentData.emergency_contact_person} - ${studentData.emergency_contact_number}`
                    : studentData.emergency_contact_person ||
                      studentData.emergency_contact_number ||
                      '—'}
                </Typography>
              </Grid>
            </Grid>

            {/* D. Parent/Guardian Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              D. Parent/Guardian Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Parent/Guardian Name
                </Typography>
                <Typography variant="body2">
                  {studentData.parent_first_name || studentData.parent_surname
                    ? `${formatName(studentData.parent_first_name)} ${formatName(studentData.parent_surname)}`.trim()
                    : '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Parent/Guardian Email
                </Typography>
                <Typography variant="body2">{studentData.parent_email || '—'}</Typography>
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isCheckboxChecked}
                  onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  sx={{ color: '#2563eb' }}
                  disabled={updating}
                />
              }
              label="I confirm that all the information provided above is correct and complete."
            />
          </Stack>
        }
      />

      <OnLoader open={updating} title="Confirming Enrollment..." size={40} thickness={4} />
    </Box>
  );
};

export default StudentDetails;
