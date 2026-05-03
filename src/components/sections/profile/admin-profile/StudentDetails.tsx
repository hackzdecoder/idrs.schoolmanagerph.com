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
}

interface StudentDetailsProps {
  student: StudentRecord | null;
  onClose?: () => void;
  onUpdate?: () => void;
}

// Helper function to get student photo URL
// Pattern: https://schoolmanagerph.com/idrs-school-ids/{school_code}/{student_id}_{surname}.jpg
const getStudentPhotoUrl = (schoolCode: string, studentId: string, surname: string): string => {
  if (!schoolCode || !studentId || !surname) return '';
  return `https://schoolmanagerph.com/idrs-school-ids/${schoolCode}/${studentId}_${surname}.jpg`;
};

// Helper functions
const formatMiddleInitialOnBlur = (value: string): string => {
  if (!value) return '';
  let formatted = value.trim();
  if (formatted.length === 0) return '';
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  if (!formatted.includes('.')) {
    formatted += '.';
  }
  return formatted;
};

const generateNameToAppearOnId = (
  firstName: string,
  middleInitial: string,
  lastName: string,
): string => {
  const first = firstName.trim();
  const middle = middleInitial.trim();
  const last = lastName.trim();
  if (!first && !last) return '';
  let result = last;
  if (first) {
    result += result ? `, ${first}` : first;
  }
  if (middle) {
    if (middle.includes('.')) {
      const cleanMiddle = middle.replace(/\.+$/, '');
      result += ` ${cleanMiddle}.`;
    } else {
      result += ` ${middle}.`;
    }
  }
  return result;
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  return /^\d{11}$/.test(phoneNumber);
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

  const [editableData, setEditableData] = useState({
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
  });

  const handleFieldChange = (field: string, value: string | boolean) => {
    // Don't allow editing if class details is already approved
    if (isClassDetailsApproved) return;

    let processedValue = value;

    if (typeof value === 'string') {
      if (
        ['first_name', 'emergency_contact_person', 'parent_first_name', 'parent_surname'].includes(
          field,
        )
      ) {
        if (value.length > 0) {
          processedValue = value.charAt(0).toUpperCase() + value.slice(1);
        }
      }

      if (field === 'middle_initial') {
        processedValue = value;
      }

      if (['surname', 'nick_name'].includes(field)) {
        processedValue = value
          .split(' ')
          .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
          .join(' ');
      }

      if (field === 'emergency_contact_number') {
        processedValue = value.replace(/[^0-9]/g, '');
        if (processedValue.length > 11) {
          processedValue = processedValue.slice(0, 11);
        }
      }
    }

    setEditableData((prev) => {
      const newData = { ...prev, [field]: processedValue };

      if (field === 'first_name' || field === 'middle_initial' || field === 'surname') {
        const firstName = field === 'first_name' ? processedValue : prev.first_name;
        const middleInitial = field === 'middle_initial' ? processedValue : prev.middle_initial;
        const lastName = field === 'surname' ? processedValue : prev.surname;
        const generatedName = generateNameToAppearOnId(
          firstName as string,
          middleInitial as string,
          lastName as string,
        );
        newData.name_to_appear_on_id = generatedName;
      }

      return newData;
    });
  };

  const handleMiddleInitialBlur = () => {
    if (isClassDetailsApproved) return;

    const formatted = formatMiddleInitialOnBlur(editableData.middle_initial);
    if (formatted !== editableData.middle_initial) {
      setEditableData((prev) => {
        const newData = { ...prev, middle_initial: formatted };
        const generatedName = generateNameToAppearOnId(prev.first_name, formatted, prev.surname);
        newData.name_to_appear_on_id = generatedName;
        return newData;
      });
    }
  };

  const handleCloseModal = () => {
    setConfirmModalOpen(false);
    setIsCheckboxChecked(false);
  };

  // Save school information to backend - ONLY updates student_id_info table
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

    // Prepare update data - send ALL school fields
    const updateData: Record<string, any> = {};

    // Always send level
    if (editableData.level !== student?.level) {
      updateData.level = editableData.level;
    }

    // Always send section_course
    if (editableData.section_course !== student?.section_course) {
      updateData.section_course = editableData.section_course;
    }

    // Always send lrn
    if (editableData.lrn !== student?.lrn) {
      updateData.lrn = editableData.lrn;
    }

    // Always send esc_voucher_recipient
    if (editableData.esc_voucher_recipient !== student?.esc_voucher_recipient) {
      updateData.esc_voucher_recipient = editableData.esc_voucher_recipient;
    }

    // Always send esc_number (even if empty)
    if (editableData.esc_number !== student?.esc_number) {
      updateData.esc_number = editableData.esc_number || '';
    }

    // If no changes, return true without API call
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
        text: 'Failed to save school information. Check console for details.',
        confirmButtonColor: '#2563eb',
      });
      return false;
    }
  };

  const handleConfirmApprove = async () => {
    if (!isCheckboxChecked) return;

    // Guard clause - ensure student exists
    if (!student) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Student information is missing',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // Check if already approved
    if (isClassDetailsApproved) {
      Swal.fire({
        icon: 'info',
        title: 'Already Approved',
        text: 'Class details have already been approved for this student.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    try {
      setUpdating(true);
      setConfirmModalOpen(false);

      // Save school information first (updates student_id_info table only)
      const saved = await saveSchoolInformation();

      if (!saved) {
        return;
      }

      // Approve class details - ONLY updates student_id_info table
      const classDetailsResponse = await put<{ success: boolean; response: string }>(
        `/admin/students/${student.id}`,
        {
          class_details_status: 'approved',
          // No date sent - backend will set it using Carbon::now('Asia/Manila')
        },
      );

      if (!classDetailsResponse.success) {
        throw new Error(classDetailsResponse.response || 'Failed to approve class details');
      }

      // Refresh the student list if callback provided
      if (onUpdate) {
        await onUpdate();
      }

      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        html: `
          <div style="text-align: left;">
            <p><strong>Student:</strong> ${editableData.name_to_appear_on_id}</p>
            <p><strong>Student ID:</strong> ${student.student_id || '—'}</p>
            <p><strong>Level:</strong> ${editableData.level || '—'}</p>
            <p><strong>Section/Course:</strong> ${editableData.section_course || '—'}</p>
            <p><strong>LRN:</strong> ${editableData.lrn || '—'}</p>
            <p><strong>ESC Grantee:</strong> ${editableData.esc_voucher_recipient ? 'Yes' : 'No'}</p>
            ${editableData.esc_number ? `<p><strong>ESC Number:</strong> ${editableData.esc_number}</p>` : ''}
            <p><strong>Parent/Guardian:</strong> ${editableData.parent_first_name} ${editableData.parent_surname}</p>
            <p><strong>Parent Email:</strong> ${editableData.parent_email || '—'}</p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
      }).then(() => {
        if (onClose) onClose();
      });
    } catch (_error) {
      console.error('Failed to approve student:', _error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to approve student. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setUpdating(false);
      setIsCheckboxChecked(false);
    }
  };

  const openConfirmModal = () => {
    // Check if already approved
    if (isClassDetailsApproved) {
      Swal.fire({
        icon: 'info',
        title: 'Already Approved',
        text: 'Class details have already been approved for this student. No further edits or approvals are allowed.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // Check if ID info is approved first
    if (student?.id_info_status?.toLowerCase() !== 'approved') {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Approve',
        html: `
          <div style="text-align: left;">
            <p><strong>Student ID Information Status:</strong> ${student?.id_info_status || 'Pending'}</p>
            <p>Student ID information must be approved first before you can approve class details.</p>
            <p>Please ask the student to complete their ID registration first.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // Validate required fields
    if (!editableData.first_name) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'First Name is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.surname) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Last Name is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.nick_name) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Nickname is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.birth_date) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Date of Birth is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.gender) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gender is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.residential_address) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Residential Address is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.emergency_contact_person) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Emergency Contact Person is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!isValidPhoneNumber(editableData.emergency_contact_number)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Emergency Contact Number must be exactly 11 digits',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.parent_first_name) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Parent/Guardian First Name is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (!editableData.parent_surname) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Parent/Guardian Last Name is required',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    if (
      editableData.parent_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editableData.parent_email)
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a valid Parent/Guardian Email Address',
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
        <Box component="form">
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  Student ID Registration
                </Typography>
                {isClassDetailsApproved ? (
                  <Chip
                    label="Class Details Approved"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ) : (
                  <Chip
                    label="Pending Approval"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={studentPhotoUrl}
                  sx={{
                    width: { xs: 70, sm: 80, md: 90 },
                    height: { xs: 70, sm: 80, md: 90 },
                    bgcolor: '#2563eb',
                    border: '3px solid #f0f4fe',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 600,
                  }}
                >
                  {editableData.first_name?.charAt(0) || editableData.surname?.charAt(0) || 'S'}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {editableData.name_to_appear_on_id}
                  </Typography>
                  {student?.student_id && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                    >
                      Student ID: {student.student_id}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>

            <Divider sx={{ my: 0 }} />

            {/* A. Personal Information - ALL EDITABLE (but disabled if approved) */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                A. Personal Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="First Name"
                value={editableData.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Middle Initial"
                value={editableData.middle_initial}
                onChange={(e) => handleFieldChange('middle_initial', e.target.value)}
                onBlur={handleMiddleInitialBlur}
                placeholder="e.g., D, DC, D.C, D. C."
                helperText="Enter middle initial(s) only. Period will be added automatically."
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Last Name"
                value={editableData.surname}
                onChange={(e) => handleFieldChange('surname', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Suffix Name"
                value={editableData.suffix_name}
                onChange={(e) => handleFieldChange('suffix_name', e.target.value)}
                placeholder="Jr., Sr., III, etc. (Optional)"
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Nickname"
                value={editableData.nick_name}
                onChange={(e) => handleFieldChange('nick_name', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Date of Birth"
                type="date"
                value={editableData.birth_date}
                onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" required disabled={isClassDetailsApproved}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={editableData.gender}
                  label="Gender"
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Name to Appear on ID Card"
                value={editableData.name_to_appear_on_id}
                onChange={(e) => handleFieldChange('name_to_appear_on_id', e.target.value)}
                placeholder="Last Name, First Name MI."
                required
                helperText="Auto-generated from First Name, Middle Initial, and Last Name. You can still edit if needed."
                disabled={isClassDetailsApproved}
              />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* B. Additional Information - ALL EDITABLE (but disabled if approved) */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                B. Additional Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="medium"
                label="Residential Address"
                value={editableData.residential_address}
                onChange={(e) => handleFieldChange('residential_address', e.target.value)}
                multiline
                rows={2}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Emergency Contact Person"
                value={editableData.emergency_contact_person}
                onChange={(e) => handleFieldChange('emergency_contact_person', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Emergency Contact Number"
                value={editableData.emergency_contact_number}
                onChange={(e) => handleFieldChange('emergency_contact_number', e.target.value)}
                placeholder="11 digits only (e.g., 09123456789)"
                inputProps={{ inputMode: 'numeric', maxLength: 11 }}
                required
                helperText={
                  editableData.emergency_contact_number &&
                  !isValidPhoneNumber(editableData.emergency_contact_number)
                    ? 'Must be exactly 11 digits'
                    : 'Enter exactly 11 digits (0-9)'
                }
                error={
                  !!editableData.emergency_contact_number &&
                  !isValidPhoneNumber(editableData.emergency_contact_number)
                }
                disabled={isClassDetailsApproved}
              />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* C. School Information - EDITABLE (disabled if approved) */}
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb' }}>
                  C. School Information
                </Typography>
                {isClassDetailsApproved && (
                  <Chip
                    label="Class Details Approved"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Level"
                value={editableData.level}
                onChange={(e) => handleFieldChange('level', e.target.value)}
                placeholder="e.g., Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12"
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Section/Course"
                value={editableData.section_course}
                onChange={(e) => handleFieldChange('section_course', e.target.value)}
                placeholder="e.g., Section A, STEM, ABM, HUMSS"
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="LRN (Learner Reference Number)"
                value={editableData.lrn}
                onChange={(e) => handleFieldChange('lrn', e.target.value)}
                placeholder="Enter LRN if available"
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" disabled={isClassDetailsApproved}>
                <InputLabel>DepEd ESC Grantee</InputLabel>
                <Select
                  value={editableData.esc_voucher_recipient ? 'Yes' : 'No'}
                  label="DepEd ESC Grantee"
                  onChange={(e) =>
                    handleFieldChange('esc_voucher_recipient', e.target.value === 'Yes')
                  }
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {editableData.esc_voucher_recipient && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="medium"
                  label="ESC Number"
                  value={editableData.esc_number}
                  onChange={(e) => handleFieldChange('esc_number', e.target.value)}
                  placeholder="Enter ESC number"
                  disabled={isClassDetailsApproved}
                />
              </Grid>
            )}

            {/* Class Details Status Display */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Class Details Status:
                </Typography>
                <Chip
                  label={student?.class_details_status || 'Pending'}
                  color={isClassDetailsApproved ? 'success' : 'warning'}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
                {student?.class_details_approval_date && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Approved: {new Date(student.class_details_approval_date).toLocaleDateString()}
                  </Typography>
                )}
              </Stack>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* D. Parent/Guardian Information - ALL EDITABLE (disabled if approved) */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                D. Parent/Guardian Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Parent/Guardian First Name"
                value={editableData.parent_first_name}
                onChange={(e) => handleFieldChange('parent_first_name', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Parent/Guardian Last Name"
                value={editableData.parent_surname}
                onChange={(e) => handleFieldChange('parent_surname', e.target.value)}
                required
                disabled={isClassDetailsApproved}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Parent/Guardian Email Address"
                type="email"
                value={editableData.parent_email}
                onChange={(e) => handleFieldChange('parent_email', e.target.value)}
                placeholder="optional@example.com"
                disabled={isClassDetailsApproved}
              />
            </Grid>

            {/* Submit Button - Hidden if already approved */}
            {!isClassDetailsApproved && (
              <Grid size={{ xs: 12 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: { xs: 3, sm: 5 } }}
                >
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
                    }}
                  >
                    {updating ? 'Approving...' : 'Approve Student'}
                  </Button>
                  {onClose && (
                    <Button
                      variant="outlined"
                      onClick={onClose}
                      disabled={updating}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Back
                    </Button>
                  )}
                </Stack>
              </Grid>
            )}

            {/* Show message if already approved */}
            {isClassDetailsApproved && (
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: { xs: 3, sm: 5 } }}>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Back
                  </Button>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleCloseModal}
        title="Confirm Student Approval"
        maxWidth={600}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        showLoading={updating}
        loadingTitle="Approving..."
        actions={[
          {
            label: 'Cancel',
            onClick: handleCloseModal,
            color: 'secondary',
            variant: 'outlined',
            disabled: updating,
          },
          {
            label: 'Approve Student',
            onClick: handleConfirmApprove,
            color: 'success',
            variant: 'contained',
            disabled: !isCheckboxChecked || updating,
            startIcon: 'mdi:check-circle',
          },
        ]}
        content={
          <Stack spacing={3} direction="column" sx={{ mt: 1, maxHeight: '70vh', pr: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Please review the student information below before approving.
            </Typography>

            {/* A. Personal Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              A. Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  First Name
                </Typography>
                <Typography variant="body2">{editableData.first_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Middle Initial
                </Typography>
                <Typography variant="body2">{editableData.middle_initial || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Last Name
                </Typography>
                <Typography variant="body2">{editableData.surname || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Suffix Name
                </Typography>
                <Typography variant="body2">{editableData.suffix_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Nickname
                </Typography>
                <Typography variant="body2">{editableData.nick_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Date of Birth
                </Typography>
                <Typography variant="body2">{editableData.birth_date || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Gender
                </Typography>
                <Typography variant="body2">{editableData.gender || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Name to Appear on ID Card
                </Typography>
                <Typography variant="body2">{editableData.name_to_appear_on_id || '—'}</Typography>
              </Grid>
            </Grid>

            {/* B. Additional Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              B. Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Residential Address
                </Typography>
                <Typography variant="body2">{editableData.residential_address || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Emergency Contact Person
                </Typography>
                <Typography variant="body2">
                  {editableData.emergency_contact_person || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Emergency Contact Number
                </Typography>
                <Typography variant="body2">
                  {editableData.emergency_contact_number || '—'}
                </Typography>
              </Grid>
            </Grid>

            {/* C. Parent/Guardian Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              C. Parent/Guardian Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Parent/Guardian First Name
                </Typography>
                <Typography variant="body2">{editableData.parent_first_name || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Parent/Guardian Last Name
                </Typography>
                <Typography variant="body2">{editableData.parent_surname || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Parent/Guardian Email
                </Typography>
                <Typography variant="body2">{editableData.parent_email || '—'}</Typography>
              </Grid>
            </Grid>

            {/* D. School Information */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              D. School Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Level
                </Typography>
                <Typography variant="body2">{editableData.level || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Section/Course
                </Typography>
                <Typography variant="body2">{editableData.section_course || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  LRN
                </Typography>
                <Typography variant="body2">{editableData.lrn || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  ESC Voucher Recipient
                </Typography>
                <Typography variant="body2">
                  {editableData.esc_voucher_recipient ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              {editableData.esc_voucher_recipient && editableData.esc_number && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    ESC Number
                  </Typography>
                  <Typography variant="body2">{editableData.esc_number || '—'}</Typography>
                </Grid>
              )}
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
              {student?.class_details_approval_date && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Class Details Approval Date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(student.class_details_approval_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
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

      {/* OnLoader component - shows loading overlay during save */}
      <OnLoader open={updating} title="Approving..." size={40} thickness={4} />
    </Box>
  );
};

export default StudentDetails;
