import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
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
import PageLoader from 'components/loading/PageLoader';

interface StudentProfileData {
  id: number;
  student_id: string;
  school_code: string;
  first_name: string;
  middle_initial: string | null;
  surname: string;
  suffix_name: string | null;
  full_name: string;
  email: string | null;
  username: string | null;
  nick_name: string | null;
  birth_date: string | null;
  gender: string | null;
  residential_address: string | null;
  emergency_contact_person: string | null;
  emergency_contact_number: string | null;
  level: string;
  section_course: string;
  lrn: string;
  student_type: string;
  id_info_status: string;
  class_details_status: string;
  id_print_status: string;
  created_at: string;
  name_to_appear_on_id?: string | null;
  esc_voucher_recipient?: boolean;
  esc_number?: string | null;
  parent_first_name?: string | null;
  parent_surname?: string | null;
  parent_email?: string | null;
  sms_app_credentials?: string | null;
  sms_app_created_at?: string | null;
}

interface UserData {
  username: string;
  email: string;
  role: string;
  user_id?: string;
  account_name?: string;
}

// Format middle initial on blur (initials only, preserve case, ensure period)
const formatMiddleInitialOnBlur = (value: string): string => {
  if (!value) return '';

  let formatted = value.trim();
  if (formatted.length === 0) return '';

  // Capitalize first letter, preserve the rest exactly as typed
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  // Ensure at least one period exists
  if (!formatted.includes('.')) {
    formatted += '.';
  }

  return formatted;
};

// Generate Name to Appear on ID Card - preserves middle initial exactly as encoded
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

// Validate password strength (at least 8 chars, uppercase, lowercase, number)
const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: 'Password is strong' };
};

// Helper function to validate 11-digit phone number
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  return /^\d{11}$/.test(phoneNumber);
};

const ProfileContent = () => {
  const { get, post } = useRouteApiSetup();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fetchedRef = useRef(false);
  const [isApproved, setIsApproved] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [smsCredentialsExist, setSmsCredentialsExist] = useState(false);

  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const [editableData, setEditableData] = useState({
    first_name: '',
    middle_initial: '',
    surname: '',
    suffix_name: '',
    nick_name: '',
    residential_address: '',
    birth_date: '',
    gender: '',
    emergency_contact_person: '',
    emergency_contact_number: '',
    parent_first_name: '',
    parent_surname: '',
    parent_email: '',
    password: '',
    name_to_appear_on_id: '',
    esc_voucher_recipient: false,
    esc_number: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (fetchedRef.current) return;

      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userStr);

        // Check SMS credentials from stored user data
        if (parsedUser.sms_credentials_exist !== undefined) {
          setSmsCredentialsExist(parsedUser.sms_credentials_exist);
        }

        const roleResponse = await get<{
          success: boolean;
          role: string;
        }>('/user-role');

        if (roleResponse.success) {
          const userInfo: UserData = {
            username: parsedUser.username || parsedUser.account_name || '',
            email: parsedUser.email || '',
            role: roleResponse.role,
            user_id: parsedUser.id,
            account_name: parsedUser.account_name,
          };
          setUserData(userInfo);

          if (roleResponse.role === 'Student') {
            const profileResponse = await get<{
              success: boolean;
              data: StudentProfileData;
              error?: string;
            }>('/student/profile');

            if (profileResponse.success && profileResponse.data) {
              setProfileData(profileResponse.data);

              if (profileResponse.data.id_info_status?.toLowerCase() === 'approved') {
                setIsApproved(true);
              }

              // Check sms_app_credentials from profile data
              if (profileResponse.data.sms_app_credentials === 'yes') {
                setSmsCredentialsExist(true);
              }

              let formattedBirthDate = '';
              if (profileResponse.data.birth_date) {
                formattedBirthDate = profileResponse.data.birth_date.substring(0, 10);
              }

              const firstName = profileResponse.data.first_name || '';
              const middleInitial = profileResponse.data.middle_initial || '';
              const lastName = profileResponse.data.surname || '';

              let nameToAppear = profileResponse.data.name_to_appear_on_id || '';
              if (!nameToAppear && (firstName || lastName)) {
                nameToAppear = generateNameToAppearOnId(firstName, middleInitial, lastName);
              }

              setEditableData({
                first_name: firstName,
                middle_initial: middleInitial,
                surname: lastName,
                suffix_name: profileResponse.data.suffix_name || '',
                nick_name: profileResponse.data.nick_name || '',
                residential_address: profileResponse.data.residential_address || '',
                birth_date: formattedBirthDate,
                gender: profileResponse.data.gender || '',
                emergency_contact_person: profileResponse.data.emergency_contact_person || '',
                emergency_contact_number: profileResponse.data.emergency_contact_number || '',
                parent_first_name: profileResponse.data.parent_first_name || '',
                parent_surname: profileResponse.data.parent_surname || '',
                parent_email: profileResponse.data.parent_email || '',
                password: '',
                name_to_appear_on_id: nameToAppear,
                esc_voucher_recipient: profileResponse.data.esc_voucher_recipient || false,
                esc_number: profileResponse.data.esc_number || '',
              });
            }
          }
        }

        fetchedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [get]);
  // ✅ NEW: Fetch existing parent data when SMS credentials exist
  useEffect(() => {
    const fetchExistingParentData = async () => {
      if (
        smsCredentialsExist &&
        profileData?.emergency_contact_number &&
        profileData?.school_code
      ) {
        try {
          const response = await get<{
            success: boolean;
            data: {
              parent_first_name: string | null;
              parent_surname: string | null;
              parent_email: string | null;
            };
          }>('/student/existing-parent-data', {
            params: {
              emergency_contact_number: profileData.emergency_contact_number,
              school_code: profileData.school_code,
            },
          });

          if (response.success && response.data) {
            setEditableData((prev) => ({
              ...prev,
              parent_first_name: response.data.parent_first_name || '',
              parent_surname: response.data.parent_surname || '',
              parent_email: response.data.parent_email || '',
            }));
          }
        } catch (error) {
          console.error('Failed to fetch existing parent data:', error);
        }
      }
    };

    fetchExistingParentData();
  }, [smsCredentialsExist, profileData?.emergency_contact_number, profileData?.school_code, get]);

  const handleFieldChange = (field: string, value: string) => {
    if (isApproved) return;

    let processedValue = value;

    // Capitalize first letter only, preserve rest (no forced lowercase)
    if (
      ['first_name', 'emergency_contact_person', 'parent_first_name', 'parent_surname'].includes(
        field,
      )
    ) {
      if (value.length > 0) {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }

    // Middle Initial - NO automatic formatting while typing
    if (field === 'middle_initial') {
      processedValue = value;
    }

    // Other name fields - capitalize first letter of each word
    if (['surname', 'nick_name'].includes(field)) {
      processedValue = value
        .split(' ')
        .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
        .join(' ');
    }

    // Only allow numbers for contact number and restrict to 11 digits
    if (field === 'emergency_contact_number') {
      processedValue = value.replace(/[^0-9]/g, '');
      if (processedValue.length > 11) {
        processedValue = processedValue.slice(0, 11);
      }
    }

    // Validate password on change
    if (field === 'password') {
      processedValue = value;
      if (value) {
        const validation = validatePasswordStrength(value);
        setPasswordError(validation.isValid ? '' : validation.message);
      } else {
        setPasswordError('');
      }
    }

    setEditableData((prev) => {
      const newData = { ...prev, [field]: processedValue };

      // Auto-generate Name to Appear on ID Card with exact middle initial
      if (field === 'first_name' || field === 'middle_initial' || field === 'surname') {
        const firstName = field === 'first_name' ? processedValue : prev.first_name;
        const middleInitial = field === 'middle_initial' ? processedValue : prev.middle_initial;
        const lastName = field === 'surname' ? processedValue : prev.surname;

        const generatedName = generateNameToAppearOnId(firstName, middleInitial, lastName);
        newData.name_to_appear_on_id = generatedName;
      }

      return newData;
    });
  };

  // Format middle initial when field loses focus
  const handleMiddleInitialBlur = () => {
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

  // Toggle password visibility in form
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Toggle password visibility in modal
  const handleToggleModalPasswordVisibility = () => {
    setShowModalPassword((prev) => !prev);
  };

  const openConfirmModal = () => {
    const requiredFields = [
      { field: 'first_name', message: 'First Name is required' },
      { field: 'surname', message: 'Last Name is required' },
      { field: 'nick_name', message: 'Nickname is required' },
      { field: 'birth_date', message: 'Date of Birth is required' },
      { field: 'gender', message: 'Gender is required' },
      { field: 'name_to_appear_on_id', message: 'Name to Appear on ID Card is required' },
      { field: 'residential_address', message: 'Residential Address is required' },
      { field: 'emergency_contact_person', message: 'Emergency Contact Person is required' },
      { field: 'emergency_contact_number', message: 'Emergency Contact Number is required' },
    ];

    // Only require parent/guardian fields if SMS credentials don't exist
    if (!smsCredentialsExist) {
      requiredFields.push(
        { field: 'parent_first_name', message: 'Parent/Guardian First Name is required' },
        { field: 'parent_surname', message: 'Parent/Guardian Last Name is required' },
        { field: 'parent_email', message: 'Parent/Guardian Email Address is required' },
        { field: 'password', message: 'Mobile App / Web App Password is required' },
      );
    }

    for (const { field, message } of requiredFields) {
      if (!editableData[field as keyof typeof editableData]) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          confirmButtonColor: '#2563eb',
        });
        return;
      }
    }

    // Only validate password strength if password is provided and credentials don't exist
    if (!smsCredentialsExist && editableData.password) {
      const passwordValidation = validatePasswordStrength(editableData.password);
      if (!passwordValidation.isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Weak Password',
          text: passwordValidation.message,
          confirmButtonColor: '#2563eb',
        });
        return;
      }
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

    if (editableData.parent_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editableData.parent_email)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter a valid Parent/Guardian Email Address',
          confirmButtonColor: '#2563eb',
        });
        return;
      }
    }

    setConfirmModalOpen(true);
  };

  const handleCloseModal = () => {
    setConfirmModalOpen(false);
    setIsCheckboxChecked(false);
    setShowModalPassword(false);
  };

  const handleConfirmApprove = async () => {
    if (!isCheckboxChecked) return;

    try {
      setUpdating(true);
      setConfirmModalOpen(false);

      const updateData: any = {
        first_name: editableData.first_name,
        middle_initial: editableData.middle_initial || '',
        surname: editableData.surname,
        suffix_name: editableData.suffix_name || '',
        nick_name: editableData.nick_name,
        residential_address: editableData.residential_address,
        birth_date: editableData.birth_date,
        gender: editableData.gender,
        emergency_contact_person: editableData.emergency_contact_person,
        emergency_contact_number: editableData.emergency_contact_number,
        name_to_appear_on_id: editableData.name_to_appear_on_id,
        esc_voucher_recipient: editableData.esc_voucher_recipient,
        esc_number: editableData.esc_number || '',
      };

      // Only include parent fields and password if SMS credentials don't exist
      if (!smsCredentialsExist) {
        updateData.parent_first_name = editableData.parent_first_name || '';
        updateData.parent_surname = editableData.parent_surname || '';
        updateData.parent_email = editableData.parent_email || '';
        updateData.password = editableData.password;
      } else {
        if (editableData.parent_first_name)
          updateData.parent_first_name = editableData.parent_first_name;
        if (editableData.parent_surname) updateData.parent_surname = editableData.parent_surname;
        if (editableData.parent_email) updateData.parent_email = editableData.parent_email;
      }

      const response = await post<{
        success: boolean;
        response?: string;
        data?: StudentProfileData;
        error?: string;
      }>('/student/update/profile', updateData);

      if (response.success) {
        if (response.data) {
          setProfileData(response.data);
          setIsApproved(true);
        }

        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: response.response || 'Student ID information has been approved and saved.',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      } else {
        throw new Error(response.error || 'Failed to approve registration');
      }
    } catch (error: any) {
      console.error('Failed to approve registration:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to approve registration',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    } finally {
      setUpdating(false);
      setIsCheckboxChecked(false);
      setShowModalPassword(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!userData || !profileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No registration data available</Typography>
      </Box>
    );
  }

  const isRegistrationApproved =
    isApproved || profileData.id_info_status?.toLowerCase() === 'approved';
  const isSmsCredentialsDisabled = smsCredentialsExist || isRegistrationApproved;

  return (
    <Box sx={{ p: 3 }}>
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
            {/* Header */}
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
                {isRegistrationApproved && (
                  <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 500 }} />
                )}
              </Stack>
            </Grid>

            {/* Avatar Section */}
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ alignItems: 'center', gap: 1 }}>
                <Avatar
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
                  {profileData.first_name?.charAt(0) || profileData.surname?.charAt(0) || 'S'}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {profileData.full_name}
                    </Typography>
                  </Stack>
                  {profileData.student_id && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                    >
                      Student ID: {profileData.student_id}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>

            <Divider sx={{ my: 0 }} />

            {/* A. Personal Information */}
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved}
                helperText="Enter middle initial(s) only. Period will be added automatically."
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" required disabled={isRegistrationApproved}>
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
                disabled={isRegistrationApproved}
                helperText="Auto-generated from First Name, Middle Initial, and Last Name. You can still edit if needed."
              />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* B. Additional Information */}
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved}
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
                disabled={isRegistrationApproved || isSmsCredentialsDisabled}
                helperText={
                  isSmsCredentialsDisabled
                    ? 'This mobile number is already registered in the system'
                    : editableData.emergency_contact_number &&
                        !isValidPhoneNumber(editableData.emergency_contact_number)
                      ? 'Must be exactly 11 digits'
                      : 'Enter exactly 11 digits (0-9)'
                }
                error={
                  !!editableData.emergency_contact_number &&
                  !isValidPhoneNumber(editableData.emergency_contact_number) &&
                  !isSmsCredentialsDisabled
                }
              />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* C. Mobile App / Web App Registration */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                C. Mobile App / Web App Registration
              </Typography>
              {isSmsCredentialsDisabled && (
                <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 2 }}>
                  ✓ Mobile app credentials already exist for this number. Registration details are
                  pre-filled.
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Parent/Guardian First Name"
                value={editableData.parent_first_name}
                onChange={(e) => handleFieldChange('parent_first_name', e.target.value)}
                required={!isSmsCredentialsDisabled}
                disabled={isRegistrationApproved || isSmsCredentialsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Parent/Guardian Last Name"
                value={editableData.parent_surname}
                onChange={(e) => handleFieldChange('parent_surname', e.target.value)}
                required={!isSmsCredentialsDisabled}
                disabled={isRegistrationApproved || isSmsCredentialsDisabled}
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
                required={!isSmsCredentialsDisabled}
                disabled={isRegistrationApproved || isSmsCredentialsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Mobile App / Web App Password"
                type={showPassword ? 'text' : 'password'}
                value={editableData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder={
                  isSmsCredentialsDisabled
                    ? 'Already registered'
                    : 'Enter password for mobile app access'
                }
                required={!isSmsCredentialsDisabled}
                disabled={isRegistrationApproved || isSmsCredentialsDisabled}
                error={!!passwordError && !isSmsCredentialsDisabled}
                helperText={
                  isSmsCredentialsDisabled
                    ? 'Password already set for this account'
                    : passwordError ||
                      'Password must be at least 8 characters with uppercase, lowercase, and number'
                }
                slotProps={{
                  input: {
                    endAdornment: !isSmsCredentialsDisabled && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          disabled={isRegistrationApproved}
                        >
                          <IconifyIcon
                            icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                            fontSize={20}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* D. School Information - Not Editable */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                D. School Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Level"
                value={profileData.level || '—'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Section/Course"
                value={profileData.section_course || '—'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="LRN"
                value={profileData.lrn || '—'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" disabled>
                <InputLabel>DepEd ESC Grantee</InputLabel>
                <Select
                  value={editableData.esc_voucher_recipient ? 'Yes' : 'No'}
                  label="DepEd ESC Grantee"
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
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
            )}

            {/* Submit Button */}
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
                  startIcon={<IconifyIcon icon="mdi:send" />}
                  disabled={updating || isRegistrationApproved}
                  sx={{
                    bgcolor: isRegistrationApproved ? '#94a3b8' : '#2563eb',
                    '&:hover': { bgcolor: isRegistrationApproved ? '#94a3b8' : '#1d4ed8' },
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    fontWeight: 600,
                  }}
                >
                  {isRegistrationApproved ? 'Already Approved' : updating ? 'Saving...' : 'Submit'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Confirmation Modal - Using Custom Dialog Component */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleCloseModal}
        title="Confirm Student ID Information"
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
          },
          {
            label: 'Approve ID Information',
            onClick: handleConfirmApprove,
            color: 'primary',
            variant: 'contained',
            disabled: !isCheckboxChecked || updating,
            startIcon: 'mdi:check-circle',
          },
        ]}
        content={
          <Stack spacing={3} direction="column" sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Please review the student information below. Make sure all details are correct before
              submitting.
            </Typography>

            {/* A. Personal Information Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              A. Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  First Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.first_name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Middle Initial
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.middle_initial || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Last Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.surname || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Suffix Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.suffix_name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Nickname
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.nick_name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Date of Birth
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.birth_date || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Gender
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.gender || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Name to Appear on ID Card
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.name_to_appear_on_id || '—'}
                </Typography>
              </Grid>
            </Grid>

            {/* B. Additional Information Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              B. Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Residential Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.residential_address || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Emergency Contact Person
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.emergency_contact_person || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Emergency Contact Number
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.emergency_contact_number || '—'}
                </Typography>
              </Grid>
            </Grid>

            {/* C. Parent/Guardian Information Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              C. Parent/Guardian Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Parent/Guardian First Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.parent_first_name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Parent/Guardian Last Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.parent_surname || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Parent/Guardian Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.parent_email || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Mobile App / Web App Password
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {showModalPassword ? editableData.password : '••••••••'}
                  </Typography>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleToggleModalPasswordVisibility}
                    onMouseDown={(e) => e.preventDefault()}
                    size="small"
                  >
                    <IconifyIcon
                      icon={showModalPassword ? 'mdi:eye-off' : 'mdi:eye'}
                      fontSize={18}
                    />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>

            {/* D. School Information Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
              D. School Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Level
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {profileData?.level || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Section/Course
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {profileData?.section_course || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  LRN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {profileData?.lrn || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  ESC Voucher Recipient
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {editableData.esc_voucher_recipient ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              {editableData.esc_voucher_recipient && editableData.esc_number && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    ESC Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {editableData.esc_number || '—'}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isCheckboxChecked}
                  onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  sx={{ color: '#2563eb', '&.Mui-checked': { color: '#2563eb' } }}
                />
              }
              label="I confirm that all the information provided above is correct and complete."
            />
          </Stack>
        }
      />

      <OnLoader open={updating} title="Submitting..." size={40} thickness={4} />
    </Box>
  );
};

export default ProfileContent;
