import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';

/**
 * Interface matching EXACTLY what the backend StudentController@student_profile returns
 */
interface StudentInformation {
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
  name_to_appear_on_id: string | null;
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
  esc_voucher_recipient: boolean | null;
  esc_number: string | null;
  parent_first_name: string | null;
  parent_surname: string | null;
  parent_email: string | null;
  id_info_status: string;
  class_details_status: string;
  id_print_status: string;
  id_reprint_status: string;
  account_status: string;
  created_at: string;
}

/**
 * Capitalizes first letter of a string without forcing the rest to lowercase
 * Use this for proper nouns and phrases like "Section A"
 */
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes first letter of each word (for names)
 */
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats a name properly (first letter uppercase, rest lowercase)
 * Use this for first names, surnames, etc.
 */
const formatName = (name: string | null | undefined): string => {
  if (!name) return '—';
  return capitalizeWords(name);
};

/**
 * Formats a middle initial (always uppercase)
 */
const formatMiddleInitial = (initial: string | null | undefined): string => {
  if (!initial) return '—';
  return initial.toUpperCase();
};

/**
 * Formats text that should preserve original casing (like addresses, section names)
 */
const preserveCase = (text: string | null | undefined): string => {
  if (!text) return '—';
  return text;
};

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
 * Format status for display with proper capitalization
 */
const formatStatus = (status: string | undefined | null): string => {
  if (!status) return '—';
  if (status.toLowerCase() === 'yes') return 'Yes';
  if (status.toLowerCase() === 'no') return 'No';
  return capitalizeFirstLetter(status);
};

/**
 * Format student type for display
 */
const formatStudentType = (type: string | undefined | null): string => {
  if (!type) return 'Not specified';
  if (type.toLowerCase() === 'new') return 'New Student';
  if (type.toLowerCase() === 'old') return 'Old Student';
  return capitalizeFirstLetter(type);
};

/**
 * Get color for student type badge
 */
const getStudentTypeColor = (type: string | undefined | null): string => {
  if (!type) return 'default';
  if (type.toLowerCase() === 'new') return 'info';
  if (type.toLowerCase() === 'old') return 'secondary';
  return 'default';
};

/**
 * Dashboard component for Student
 */
const DashboardContent = () => {
  const { get } = useRouteApiSetup();
  const [studentData, setStudentData] = useState<StudentInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const getRef = useRef(get);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (fetchedRef.current) return;

      setLoading(true);
      try {
        const response = await getRef.current<{
          success: boolean;
          data: StudentInformation;
        }>('/student/profile');

        if (response.success && response.data) {
          setStudentData(response.data);
        } else {
          console.error('API returned unsuccessful response:', response);
        }

        fetchedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (!studentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No student data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Status Chips */}
      <Stack
        direction="row"
        spacing={3}
        justifyContent="flex-end"
        sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            ID Info:
          </Typography>
          <Chip
            label={formatStatus(studentData.id_info_status)}
            color={getStatusColor(studentData.id_info_status) as any}
            size="small"
            sx={{ fontWeight: 500, borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            Class Details:
          </Typography>
          <Chip
            label={formatStatus(studentData.class_details_status)}
            color={getStatusColor(studentData.class_details_status) as any}
            size="small"
            sx={{ fontWeight: 500, borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            ID Printing:
          </Typography>
          <Chip
            label={formatStatus(studentData.id_print_status)}
            color={getStatusColor(studentData.id_print_status) as any}
            size="small"
            sx={{ fontWeight: 500, borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            ID Reprint:
          </Typography>
          <Chip
            label={formatStatus(studentData.id_reprint_status)}
            color={getStatusColor(studentData.id_reprint_status) as any}
            size="small"
            sx={{ fontWeight: 500, borderRadius: 2 }}
          />
        </Box>
      </Stack>

      {/* Catalog Cards Grid */}
      <Grid container spacing={3}>
        {/* Personal Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ bgcolor: '#e0e7ff', p: 1, borderRadius: 2 }}>
                  <IconifyIcon icon="mdi:account" fontSize={24} color="#2563eb" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Personal Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} direction="column" flexWrap="wrap">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    First Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatName(studentData.first_name)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Middle Initial
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatMiddleInitial(studentData.middle_initial)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Last Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatName(studentData.surname)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Suffix Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatName(studentData.suffix_name)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Nickname
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatName(studentData.nick_name)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {studentData.birth_date
                      ? new Date(studentData.birth_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {studentData.gender ? capitalizeFirstLetter(studentData.gender) : '—'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* School Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ bgcolor: '#e0e7ff', p: 1, borderRadius: 2 }}>
                  <IconifyIcon icon="mdi:school" fontSize={24} color="#2563eb" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  School Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} direction="column" flexWrap="wrap">
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Level
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {preserveCase(studentData.level)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Section/Course
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {preserveCase(studentData.section_course)}
                  </Typography>
                </Box>
                {/* ✅ LRN moved here from Personal Information */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    LRN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {studentData.lrn || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Student Type
                  </Typography>
                  <Chip
                    label={formatStudentType(studentData.student_type)}
                    color={getStudentTypeColor(studentData.student_type) as any}
                    size="small"
                    sx={{ fontWeight: 500, borderRadius: 2 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                  >
                    Enrollment Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {new Date(studentData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Parent/Guardian & Contact Information Card */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ bgcolor: '#e0e7ff', p: 1, borderRadius: 2 }}>
                  <IconifyIcon icon="mdi:family-tree" fontSize={24} color="#2563eb" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Parent/Guardian & Contact Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                    Parent/Guardian Information
                  </Typography>
                  <Stack spacing={1.5} direction={'column'} flexWrap="wrap">
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Parent/Guardian Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {studentData.parent_first_name && studentData.parent_surname
                          ? `${formatName(studentData.parent_first_name)} ${formatName(studentData.parent_surname)}`
                          : formatName(studentData.parent_first_name || studentData.parent_surname)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Parent/Guardian Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {studentData.parent_email?.toLowerCase() || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                    Contact Information
                  </Typography>
                  <Stack spacing={1.5} direction={'column'} flexWrap="wrap">
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Residential Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {preserveCase(studentData.residential_address)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Emergency Contact Person
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {formatName(studentData.emergency_contact_person)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}
                      >
                        Emergency Contact Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {studentData.emergency_contact_number || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
