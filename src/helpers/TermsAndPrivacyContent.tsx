import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import useRouteApiSetup from 'hooks/useRouteApiSetup';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CompanyInfo {
  company_name: string;
  copyright_name: string;
  publication_date: string;
  updated_at: string;
}

interface TermsAndPrivacyContentProps {
  onCheckboxChange?: (checked: boolean) => void;
  isChecked?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Default company info (fallback when API fails)
const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'TaparSoft Enterprise',
  copyright_name: 'TaparSoft Enterprise',
  publication_date: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================================
// Component
// ============================================================================

const TermsAndPrivacyContent: React.FC<TermsAndPrivacyContentProps> = ({
  onCheckboxChange,
  isChecked = false,
}) => {
  const { post } = useRouteApiSetup();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(isChecked);
  const hasFetched = useRef(false);

  // Sync with parent prop when it changes
  useEffect(() => {
    setCheckboxChecked(isChecked);
  }, [isChecked]);

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchCompanyInfo = async () => {
      try {
        const response = await post('/trademarks', {
          type: 'company',
        });

        if (response && response.success && response.type === 'company' && response.data) {
          setCompanyInfo({
            company_name: response.data.company_name || DEFAULT_COMPANY_INFO.company_name,
            copyright_name: response.data.copyright_name || DEFAULT_COMPANY_INFO.copyright_name,
            publication_date:
              response.data.publication_date || DEFAULT_COMPANY_INFO.publication_date,
            updated_at: response.data.updated_at || DEFAULT_COMPANY_INFO.updated_at,
          });
        } else {
          setCompanyInfo(DEFAULT_COMPANY_INFO);
        }
      } catch (err: any) {
        console.error('Failed to fetch company info:', err);
        setCompanyInfo(DEFAULT_COMPANY_INFO);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [post]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setCheckboxChecked(checked);
    if (onCheckboxChange) {
      onCheckboxChange(checked);
    }
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          width: '100%',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading terms and privacy policy...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================================
  // Data Extraction
  // ==========================================================================

  const companyName = companyInfo?.company_name || DEFAULT_COMPANY_INFO.company_name;
  const copyrightName = companyInfo?.copyright_name || DEFAULT_COMPANY_INFO.copyright_name;
  const publicationDate = companyInfo?.publication_date
    ? formatDate(companyInfo.publication_date)
    : formatDate(DEFAULT_COMPANY_INFO.publication_date);

  // ==========================================================================
  // Main Render - ONLY CHECKBOX, NO BUTTONS
  // ==========================================================================

  return (
    <Stack direction="column" spacing={3}>
      {/* ==================== PRIVACY POLICY SECTION ==================== */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: 'primary.dark',
            textAlign: 'center',
          }}
        >
          SchoolMANAGER PRIVACY NOTICE
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          INTRODUCTION
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          {companyName} (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
          respects your privacy and is committed to protecting your personal data. This Privacy
          Notice informs you about how we look after your personal data when you visit our website
          or use our application (regardless of where you visit it from) and tells you about your
          privacy rights and how the law protects you.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          This Privacy Notice applies to all users of SchoolMANAGER, including administrators,
          teachers, students, parents, and guardians.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          DATA WE COLLECT
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We may collect, use, store and transfer different kinds of personal data about you,
          including but not limited to:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Identity Data</b>: Full name, username, date of birth, gender, student/employee ID
          numbers.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Contact Data</b>: Email address, phone number, mailing address.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Educational Data</b>: Grades, attendance records, class schedules, enrollment status,
          academic progress, disciplinary records.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Technical Data</b>: IP address, browser type, device information, login data, time
          zone settings.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Profile Data</b>: Your username and password, account preferences, feedback, and
          survey responses.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          • <b>Usage Data</b>: Information about how you use our website, application, products, and
          services.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          HOW WE COLLECT YOUR DATA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We use different methods to collect data from and about you:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Direct interactions</b>: You provide data when you register, fill in forms, update
          your profile, or communicate with us.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Automated technologies</b>: As you interact with our Services, we automatically
          collect Technical Data and Usage Data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          • <b>Third parties</b>: We may receive data from educational institutions, government
          agencies, or other authorized sources.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          HOW WE USE YOUR DATA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We use your personal data for the following purposes:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • To register and manage user accounts.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • To provide and maintain educational services, grade management, attendance tracking, and
          class scheduling.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • To communicate with users about academic updates, announcements, and important notices.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • To comply with legal and regulatory requirements, including student data protection
          laws.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • To improve and optimize our Services, including security and performance monitoring.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          • To protect the safety and security of our users and the integrity of the academic
          environment.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          DATA SHARING AND DISCLOSURE
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We may share your personal data with:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Educational institutions</b>: Schools and their authorized personnel.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Service providers</b>: Third parties who provide IT, system administration, and
          hosting services.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • <b>Government authorities</b>: When required by law or to comply with legal obligations.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          • <b>Professional advisers</b>: Including lawyers, auditors, and insurers.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          DATA SECURITY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We have implemented appropriate security measures to prevent your personal data from being
          accidentally lost, used, accessed in an unauthorized way, altered, or disclosed. We limit
          access to your personal data to those employees, agents, contractors, and other third
          parties who have a business need to know.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          We also have procedures in place to deal with any suspected personal data breach and will
          notify you and any applicable regulator of a breach where we are legally required to do
          so.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          DATA RETENTION
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We will retain your personal data only for as long as necessary to fulfill the purposes we
          collected it for, including for the purposes of satisfying any legal, accounting, or
          reporting requirements. Student records may be retained for the duration required by
          applicable educational laws and regulations.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          In some circumstances, we may anonymize your personal data so that it can no longer be
          associated with you, in which case we may use such information without further notice to
          you.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          YOUR LEGAL RIGHTS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          Under certain circumstances, you have rights under data protection laws in relation to
          your personal data, including the right to:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Request access to your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Request correction of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Request erasure of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Object to processing of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Request restriction of processing of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Request transfer of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          • Withdraw consent at any time (where we rely on consent).
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          DATA PRIVACY OFFICER
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We have appointed a Data Privacy Officer (DPO) who is responsible for overseeing questions
          in relation to this Privacy Notice. If you have any questions about this Privacy Notice,
          including any requests to exercise your legal rights, please contact us using the details
          set out below.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          CONTACT INFORMATION
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • General Inquiries: customercare@schoolmanagerph.com
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.5 }}>
          • Data Privacy Officer: dpo@schoolmanagerph.com
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          CHANGES TO THIS PRIVACY NOTICE
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          We keep our Privacy Notice under regular review. We will notify you of any changes by
          posting the new Privacy Notice within the Website and Application and updating the
          &quot;Last updated&quot; date below.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Last updated: {publicationDate}
        </Typography>
      </Box>

      <Divider />

      {/* ==================== TERMS AND CONDITIONS SECTION ==================== */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: 'primary.dark',
            textAlign: 'center',
          }}
        >
          SchoolMANAGER TERMS AND CONDITIONS
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          AGREEMENT TO TERMS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          Please read these Terms and Conditions (&quot;Terms&quot; or &quot;Agreement&quot; or
          &quot;Terms and Conditions&quot;) carefully before accessing and using the SchoolMANAGER
          Website or Mobile Application (&quot;SchoolMANAGER&quot; or &quot;Website&quot; or
          &quot;Application&quot;) (&quot;Services&quot;) operated by {companyName}{' '}
          (&quot;Company&quot;).
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          Please also read the SchoolMANAGER <b>Privacy Policy</b> and <b>Acceptable Use Policy</b>{' '}
          before using the SchoolMANAGER Website and/or Application and SchoolMANAGER Services. The
          Privacy Notice sets out the purpose and manner of the collection and processing of your
          personal data when you use the SchoolMANAGER Services, while the Acceptable Use Policy
          defines the rules you must comply with when using the SchoolMANAGER Services. If you do
          not understand or do not wish to be bound by these Terms and the Acceptable Use Policy, do
          not proceed with accessing the SchoolMANAGER Website, SchoolMANAGER Application and using
          the SchoolMANAGER Services.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          These Terms constitute a legally binding agreement between you and the Company and take
          effect upon your downloading, accessing or using the Services and remain valid until
          terminated by you or the Company. However, certain provisions shall survive termination,
          as required by law, regulation, or the nature of their operation.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Further, you acknowledge that you understand and agree to be governed by the terms and
          conditions of SchoolMANAGER Services you access or use. If you disagree with any parts of
          the Terms, then you may not access nor use the Services.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          LICENSE TO USE
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Subject to your agreement to and compliance with the Terms and Acceptable Use Policy, you
          are granted a non-exclusive, non-transferable, revocable, limited license to use the
          Services solely for your personal and non-commercial use.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          INTELLECTUAL PROPERTY RIGHTS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          All right, title, and interest in and to the Services (excluding the Content/Data provided
          by users, if any) are and will remain the exclusive property of {companyName} and its
          licensors. Any feedback, comments, or suggestions you may provide regarding the
          SchoolMANAGER Website or Application is entirely voluntary and the Company will be free to
          use such feedback, comments, or suggestions as we deem fit and without any obligation to
          you (user). Nothing in these Terms gives you the right to use the SchoolMANAGER Website or
          Application name or any of the SchoolMANAGER trademarks, logos, domain names, and other
          distinctive brand features.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          USER REPRESENTATIONS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          By using the SchoolMANAGER Website or Application, you represent and warrant that: (1) you
          are at least eighteen (18) years of age; (2) all information you have provided and will
          provide in the Application is truthful, accurate and complete; (3) you will maintain the
          accuracy of such information and promptly update such registration information as
          necessary; (4) you will comply with the Terms and Conditions and Acceptable Use Policy;
          (5) you will not use the Application for any illegal or unauthorized purpose.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          ACCOUNT SECURITY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          You shall keep your Account Login Credentials, OTP, and your Password Reset Links
          confidential and secure at all times. These credentials and data must not be disclosed to
          anyone.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          You agree to assume full responsibility and liability for all the actions made through
          your SchoolMANAGER Account. You acknowledge and agree that your Account Login Credentials,
          OTP, and your Password Reset Links are known only to you, and that any action using your
          Account Login Credentials, OTP, and Password Reset Links shall be conclusively presumed to
          have been made by you.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          You agree that the Company, at its sole discretion, is entitled to act on instructions
          received from you through the SchoolMANAGER Website or Application upon entry of your
          Account Login Credentials, OTP, and your Password Reset Links. You shall hold the Company
          free and harmless from any claims arising from the use of your Account Login Credentials,
          OTP, and Password Reset Links, unless such claims are proven to be directly and solely
          caused by the gross negligence of the Company. The security, safekeeping, and proper use
          of your SchoolMANAGER Account as well as the confidentiality of your Account Login
          Credentials, OTP, and your Password Reset Links, shall be your sole responsibility.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          TERMINATION
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          If you are in breach of any of the Terms and/or the Acceptable Use Policy, the Company
          reserves the right, in its sole discretion, to terminate your right to access or use the
          SchoolMANAGER Website and/or Application. The Company is not responsible for any loss,
          damage, or harm related to your inability to access or use the SchoolMANAGER Website
          and/or Application based on such termination.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          PRIVACY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Your privacy matters to us. You can learn how your information is handled when you use our
          Services by reading our <b>Privacy Policy</b> below.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          WARRANTIES AND REPRESENTATIONS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          The services are provided &quot;as is&quot; and &quot;as available&quot; and to the extent
          permitted by law without warranties of any kind, either express or implied, including, but
          not limited to, implied warranties of merchantability, fitness for a particular purpose,
          title, and non-infringement. While the Company takes measures to ensure the security,
          accuracy and availability of the SchoolMANAGER Website, Application and other related
          services as we attempt to provide a good user experience, we do not represent or warrant
          that: (a) the services will always be secure, error-free, or timely; (b) the services will
          always function without delays, disruptions, or imperfections; (c) the data or information
          transmitted through the SchoolMANAGER website or application will be error-free,
          uninterrupted or free from unauthorized access; (d) all products or services obtained
          using the SchoolMANAGER website or application will meet user expectations; (e) the use of
          SchoolMANAGER Services will always produce a specific result or outcome; (f) that any
          content, user content, or information you obtain on or through the services will be timely
          or accurate.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          LIMITATION OF LIABILITY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          {companyName} and its affiliates, directors, officers, stockholders, employees, licensors,
          suppliers, and agents will not be liable for any indirect, incidental, special,
          consequential, punitive, or multiple damages, or any loss of profits or revenues, whether
          incurred directly or indirectly, or any loss of data, use, goodwill or other intangible
          losses, resulting from: (a) your use of the Services or inability to use the Services; (b)
          your access to or inability to access the Services; (c) the conduct or content of other
          users or third parties on or through the Services; or (d) unauthorized access, use or
          alteration of your content or data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          Unless specified in these Terms, {companyName} makes no warranty, express or implied,
          regarding SchoolMANAGER Services.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Unless due to the proven direct and sole fault or negligence of the Company, the Company
          shall not be liable for any Claims arising from, in connection with, or as a result of any
          acts or circumstances that are beyond its control, including: a) any unauthorized action;
          b) the User&apos;s inability to perform or complete any action due to the service
          unavailability of their SIM or internet provider; c) any delay, interruption, or
          termination of the Services due to reasons beyond the control of the company, including
          force majeure, actions of governmental agencies or third parties, or changes in
          legislation; hacker attacks, intrusions, or outbreaks of a computer/mobile device virus;
          loss of information or records; the User&apos;s inability to complete any action due to
          the destruction, breakdown, or malfunction of platforms, systems and devices not caused by
          the Company; material effects caused by technological adjustments made by third parties;
          temporary or permanent shutdowns caused by governmental authorities; or technological
          program errors by third parties; d) any misrepresentation, fraud, or misconduct by any
          third party.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          GOVERNING LAW
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          The laws of the Republic of the Philippines shall govern these Terms and any claims and
          disputes arising out of or relating to these Terms and the Acceptable Use Policy or their
          subject matter shall be pursuant to the Philippine laws.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          SEPARABILITY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          If any provision of these Terms is held to be invalid, illegal, or unenforceable, the
          remaining provisions shall continue in full force and effect.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          CHANGES
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          {companyName} reserves the right, at its sole discretion, to modify the Terms and the
          Acceptable Use Policy at any time. If the Company makes changes, we will post the amended
          Terms and/or Acceptable Use Policy within the Website and/or Application and update the
          &quot;Publication and Effectivity&quot; date below. We shall notify you by sending an
          email notification to the email address associated with your account or providing notice
          through the Website and/or Application. Unless we say otherwise in the notice, amendments
          to the Terms will be effective immediately. Your use of Services after the amended Terms
          comes into effect constitutes your agreement to the amended Terms and Conditions.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          CONTACT US
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          SchoolMANAGER welcomes comments, questions, concerns, or suggestions. Please contact us by
          sending an email to customercare@schoolmanagerph.com.
        </Typography>

        <Stack spacing={0.3}>
          <Typography variant="body2" color="text.secondary">
            Date of Publication: {publicationDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date of Effectivity: {publicationDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {copyrightName}
          </Typography>
        </Stack>
      </Box>

      {/* ONLY CHECKBOX - NO BUTTONS */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox checked={checkboxChecked} onChange={handleCheckboxChange} color="primary" />
          }
          label={
            <Typography variant="body2">
              I have read, understood, and agree to the <strong>Terms & Conditions</strong> and{' '}
              <strong>Privacy Policy</strong>.
            </Typography>
          }
        />
      </Box>
    </Stack>
  );
};

export default TermsAndPrivacyContent;
