import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  List,
  ListItem,
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
// Privacy Policy Component (EXACT COPY)
// ============================================================================

function PrivacyPolicyContent({ companyInfo }: { companyInfo: CompanyInfo | null }) {
  const companyName = companyInfo?.company_name;
  const publicationDate = companyInfo?.publication_date
    ? formatDate(companyInfo.publication_date)
    : companyInfo?.publication_date;

  return (
    <Stack spacing={2}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 2, color: 'primary.dark', textAlign: 'center' }}
        >
          SchoolMANAGER PRIVACY NOTICE
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          {companyName} takes your privacy very seriously. We work hard to protect your information
          by following international standards. Your privacy is our priority and we want to be
          transparent about how we process your personal data. This Privacy Notice provides
          information on how we handle your personal data whenever you use the SchoolMANAGER
          website, mobile application and services. It describes the purpose and manner of
          processing your personal data. It also covers your data privacy rights and how you can
          exercise them.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We respect your right to be informed, ensuring that this Privacy Notice is presented to
          you before or promptly after the collection of your personal data. In the course of
          processing your data for the purposes discussed herein and those closely related to such,
          we strive to create privacy notices that serve as reminders of how we collect, use,
          disclose, and process your personal data in accordance with the details outlined in this
          notice.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          For any purposes not explicitly stated in this Privacy Notice, those not readily inferred,
          or for purposes of processing personal data that requires your consent, we will make every
          reasonable effort to seek your permission. This may involve presenting a separate consent
          form that may require your signature, a tick box for you to select, or feature a button
          for you to click as an indication of your consent.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Personal Data Collected, Processed and Manner of Collection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          When you subscribe/sign up or as you use the different SchoolMANAGER website and/or
          application features, we collect and processed the following personal data:
        </Typography>

        <List dense sx={{ pl: 3, listStyleType: 'disc', mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Name (First Name, Middle Initial and Last Name)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Nickname
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Foreign Name (optional)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              User&apos;s Email Address
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              School&apos;s Email Address
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Student ID No. (optional)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Learner&apos;s Reference No. (optional)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              ID Photo
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Gender (optional)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Course
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Class Details (Level and Section)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Mobile Number
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              OTP or One-Time Password (used for Resetting your Login Password)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Password Reset Links (used for Resetting your Login Password)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Attendance Records (Date, Time, Kiosk)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              ID Tap-In Details (Date, Time, Kiosk)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              ID Tap-Out Details (Date, Time, Kiosk)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Notifications / Messages (Date, Subject and Message Content)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Student&apos;s Account Details
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Student&apos;s Grades
            </Typography>
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          The following personal data may also be collected when you use the SchoolMANAGER website
          and/or application:
        </Typography>

        <List dense sx={{ pl: 3, listStyleType: 'disc', mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Internet Protocol (IP) Address
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Login Data, Browser Type and Version
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              International Mobile Equipment Identity (IMEI)
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Device Identifier, Operating System and Platform
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Time Zone
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              Information, including accurate and up-to-date personal data, you voluntarily provide
              when you contact us or use SchoolMANAGER website and/or application.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Purposes for Collecting and Processing Personal Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 0.7 }}>
          We collect and process your personal data for the following purposes:
        </Typography>

        <List dense sx={{ pl: 3, listStyleType: 'disc', mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              For identification, due diligence, or know your user purposes (we may request for
              documentation to verify the personal data provided by you or your institution (school)
              as part of our user verification processes).
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              For you to able to use the different features inside the SchoolMANAGER website and
              application such as, but not limited to, viewing the student&apos;s attendance
              records, viewing system notifications and messages, viewing student&apos;s account
              records, viewing student&apos;s grades, viewing user profile, changing of user&apos;s
              password, changing of user&apos;s email address, resetting of user&apos;s password
              (OTP-based), and requesting assistance to change user&apos;s password.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To be able to contact customer support for your inquiries and concerns.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To be able to provide advisories.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To send system push notifications.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              For collecting feedback and to contact you regarding your feedback.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To conduct research, analysis and development activities (including, but not limited
              to, data analytics, surveys, product and service development), to analyze how
              SchoolMANAGER website and application users use our services and to improve our
              services and/or to enhance your user experience.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To setup and maintain backups and other mechanisms necessary for business continuity
              plans
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To enforce or defend any legal claims.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              To comply with the requirements of the law.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Security Measures, Storage and Transmission of Personal Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          We store and transmit personal data securely using organizational, physical, and technical
          security measures based on widely accepted data privacy and information security standards
          to protect the confidentiality, integrity, and availability of your personal data.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          If you believe that your privacy has been breached, please contact us immediately.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          You should be aware, however, that no method of transmission over the Internet or method
          of electronic storage is completely secure. While security cannot be guaranteed, we strive
          to protect the security of your information and are constantly reviewing and enhancing our
          information security measures.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          Your password is the key to your account. Please update it regularly and use unique
          numbers, letters, and special characters, and do not share your password to anyone.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          In addition, we may have advertisements with links to third-party sites posted in the
          website and/or application. Please be advised that when you click these ads, you may be
          redirected to their website. We do not have control over these websites&apos; security,
          and we are not responsible nor liable for their content, privacy policies, or practices.
          We recommend that you review the privacy policy and terms of service of any third-party
          site you visit to ensure the protection of your personal information.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Third Party Transfer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          We have partners that help provide you with better services. We may share or disclose your
          personal data with them for essential purposes. Our partners execute agreements with us to
          ensure that they protect your personal data as well. We may also share your personal data
          with our trusted partners who assist us in making our services seamless and efficient.
          They help us in various ways, such as answering your inquiries, analyzing information,
          managing risk, preventing fraud, and more.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 1 }}>
          In exceptional circumstances, we may be required to disclose your personal data to law
          enforcement agencies, regulatory bodies, courts and other government agencies, such as
          when there are grounds to believe that the disclosure is necessary to prevent a threat to
          life or health, to investigate or remedy potential or actual violations, to protect the
          rights, property, and safety of others, or for law enforcement purposes, or for fulfilment
          of legal and regulatory requirements and requests.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          In case of reorganization, sale of all or any portion of assets, merger, or acquisition by
          another entity, your personal data may be transferred to the successor entity. In the
          event that the business operations of {companyName} cease or enter bankruptcy, your
          personal data shall become an asset to be transferred or acquired by a third party. If
          this happens, we will make sure to tell you ahead of time if your data will be handed over
          to another company of if there will be new rules about keeping your information private.
          Upon sufficient notice has been given to you, you acknowledge that such transfers may
          occur, and that the transferee may decline to honor the commitments made in this Privacy
          Notice.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Retention and Disposal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Your trust and privacy are important to us. Hence, we aim to be transparent about how we
          store or share your information, all while ensuring its safety and security. We want to
          keep your details safe so they won&#39;t be used the wrong way, get lost, or be accessed
          by someone you didn&#39;t allow. That&#39;s why we&#39;ve added security measures to help
          protect against these dangers. These security measures include:‍
        </Typography>

        <List dense sx={{ pl: 3, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>a. Restricting access:</b> Only certain people are allowed to see your personal
              information.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>b. Encryption:</b> We code your personal information to keep it private when
              it&apos;s being stored and processed. Encryption is like turning your information into
              a secret code which can only be understood by those who have the key.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>c. OTP (One-Time Password):</b> Our system randomly generates unique OTP and send
              it to your nominated/registered email address in our database whenever you need to
              personally reset your account password in the system. OTPs are also time sensitive and
              has expiration.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          We regularly check how information moves into and out of our computer systems to make sure
          it&apos;s protected. We enforce organizational, physical, and technical security measures
          aligned with recognized industry standards.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Additionally, we advise you to stay vigilant and always protect your passwords. Inform us
          immediately if you suspect your passwords have been compromised. Never share your login
          credentials, OTP, and password reset links.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Whatever personal data provided by you or by your institution (school) or pertaining to
          you shall only be retained for as long as necessary:
        </Typography>

        <List dense sx={{ pl: 3, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>1.</b> For the fulfillment of the declared, specified, and legitimate purpose, or
              when the processing relevant to the purpose has been terminated;
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>2.</b> For the establishment, exercise, or defense of legal claims; or
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <b>3.</b> For legitimate business purposes, which must be consistent with standards
              followed by the applicable industry.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          We shall cease to retain your personal data or remove the means by which the data can be
          associated with you as soon as it is reasonable to assume that such retention no longer
          serves the purposes for which it was collected and is no longer necessary for any legal or
          business purpose.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Generally, your personal data is retained not longer than two (2) years unless otherwise
          necessary for the specified purposes or legal obligation. When no longer necessary, it
          shall be disposed of or discarded in a secure manner that would prevent further
          processing, unauthorized access, or disclosure to any other party. For physical records,
          we destroy them by shredding or we surrender it to your institution (school) if the
          agreement with you and/or your institution (school) requires us. In case your physical
          records has been handed/surrendered to you or your institution (school), the further
          retention or destruction of the physical records will be solely handled by you or your
          institution (school). For information stored on electronic media such as hard drives, USB
          drives or memory cards, we completely erase them using a secure wipe solutions so they
          cannot be read. This makes the information unreadable and unusable.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          When you choose to unsubscribe or delete your SchoolMANAGER account, your records such as
          attendance, messages, account details, grades will still remain. Only your SchoolMANAGER
          account (login credentials) will be deleted.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Records and other Information on the SchoolMANAGER computer systems will be deleted on a
          per academic year basis or when your institution has opted to discontinue your
          subscription to SchoolMANAGER website and/or Mobile Application and Services.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Should you wish to unsubscribe or delete your SchoolMANAGER account and/or
          discontinue/terminate your subscription, you may email customercare@schoolmanagerph.com.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Data Subject Rights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Under Section 16 of the Data Privacy Act of 2012, your rights as a data subject are as
          follows:
        </Typography>

        <List dense sx={{ pl: 3, listStyleType: 'disc', mb: 1 }}>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to be informed.</b> You have the right to be informed whether your personal
              data shall be, are being, or have been processed.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <b>Right to Access.</b> You have a right to be given access to specific kinds of
              information identified in the Data Privacy Act upon reasonable demand.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              You may request information about your personal data which we have collected or
              inquire about the ways in which your personal data may have been used, disclosed,
              stored, or processed by us within the past year. To facilitate processing of your
              request, it may be necessary for us to request further information relating to your
              request.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              We reserve the right to charge a reasonable administrative fee for the retrieval of
              your personal data records. In any case, you shall be informed of the fee before any
              such request is processed.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              We will respond to your request as soon as reasonably possible. If we are unable to
              provide you with any personal data or to make a correction requested by you, we shall
              generally inform you of the reasons why we are unable to do so (except where we are
              not required to do so under the applicable data protection laws).
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to Object.</b> You shall have the right to object the processing of your
              personal data where such processing is based on consent or legitimate interest,
              including processing for direct marketing, automated processing or profiling. You
              shall also be notified and be given an opportunity to withhold consent to the
              processing in case of changes or any amendment to the information supplied or declared
              to the data subject.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <b>Right to Rectification.</b> You have the right to dispute the inaccuracy or error
              in your personal data and have us correct the same within a reasonable period of time,
              unless the request is vexatious or otherwise unreasonable.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              You may change certain personal data directly through the SchoolMANAGER website or
              mobile application. For other personal data that cannot be changed through the
              SchoolMANAGER website or mobile application, you may email our customer support team
              at customercare@schoolmanagerph.com. We may ask for additional identification for
              verification and security purposes when you request to correct your personal data.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to File a Complaint.</b> If you feel that your personal data has been
              misused, maliciously disclosed, or improperly disposed, or that any of your data
              privacy rights have been violated, you have a right to file a complaint.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to Erasure or Blocking.</b> You shall have the right to suspend, withdraw or
              order the blocking, removal, or destruction of your personal data from the
              SchoolMANAGER website, mobile application and other system. We may ask for additional
              identification in order to verify the validity of your request when you exercise your
              right to erasure or blocking.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You may terminate your SchoolMANAGER account at any time by sending an email to our
              customer support team. We may need to ask for additional personal data to prove your
              identity for verification and security purposes. The account and the information will
              be deactivated or deleted from the active databases upon successful verification.
              However, information may be retained in order to prevent fraud, troubleshoot problems,
              assist with any investigations, enforce Terms and Condition of use, and/or comply with
              legal requirements.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to Damages.</b> Upon presentation of a valid decision, we recognize your
              right to be indemnified for actual and verifiable damages sustained due to inaccurate,
              incomplete, outdated, false, unlawfully obtained or unauthorized use of Personal
              Information, taking into account any violation of your rights and freedom as data
              subject.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0.2, pl: 1, ml: 2, listStyleType: 'disc' }}>
            <Typography variant="body2" color="text.secondary">
              <b>Right to Data Portability.</b> As a data subject, you have the right to obtain from
              us a copy of your personal data and/or have the same transmitted from/to another
              personal information controller (PIC), in an electronic or structured format that is
              commonly used.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          Updates or Changes to the Privacy Notice
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          We reserve the right to update or revise this privacy notice at any time and as required
          by latest amendments to the Data Privacy Act of 2012, its Implementing Rules and
          Regulations, issuances of the National Privacy Commission, or when there are improvements
          and changes to the collection, processing, sharing or disclosure, retention, and disposal
          of your personal data. Previous versions of the privacy notice will be retained and
          provided to data subjects upon request.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Last updated: {publicationDate}
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.dark' }}>
          How can you reach us?
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          For general inquiries, you may reach us through our customer support team at
          customercare@schoolmanagerph.com.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          For any questions, concerns, feedback on this privacy notice, or to exercise your data
          privacy rights, you may reach us through our Data Privacy Officer at
          dpo@schoolmanagerph.com.
        </Typography>
      </Box>
    </Stack>
  );
}

// ============================================================================
// Terms and Conditions Component (EXACT COPY)
// ============================================================================

function TermsAndConditionsContent({
  companyInfo,
  error,
}: {
  companyInfo: CompanyInfo | null;
  error?: boolean;
}) {
  const companyName = companyInfo?.company_name;
  const copyrightName = companyInfo?.copyright_name;
  const publicationDate = companyInfo?.publication_date
    ? formatDate(companyInfo.publication_date)
    : companyInfo?.publication_date;

  return (
    <Stack spacing={2}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 2, color: 'primary.dark', textAlign: 'center' }}
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
          are granted a non- exclusive, non-transferable, revocable, limited license to use the
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
          caused by the gross negligence of the Company. ‍The security, safekeeping, and proper use
          of your SchoolMANAGER Account as well as the confidentiality of your Account Login
          Credentials, OTP, and your Password Reset Links, shall be your sole responsibility.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          TERMINATION
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          If you are in breach of any of the Terms and/or the Acceptable Use Policy, the Company
          reserve the right, in its sole discretion, to terminate your right to access or use the
          SchoolMANAGER Website and/or Application. The Company is not responsible for any loss,
          damage, or harm related to your inability to access or use the SchoolMANAGER Website
          and/or Application based on such termination.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.7, color: 'text.dark' }}>
          PRIVACY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify', mb: 2 }}>
          Your privacy matters to us. You can learn how your information is handled when you use our
          Services by reading our
          <b> Privacy Policy</b>.
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
          Acceptable Use Policy at any time. If the company make changes, we will post the amended
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

        <Stack direction="column" spacing={0.3}>
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

        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Note: Could not load company information. Using default.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const TermsAndPrivacyContent: React.FC<TermsAndPrivacyContentProps> = ({
  onCheckboxChange,
  isChecked = false,
}) => {
  const { post } = useRouteApiSetup();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
          setError(false);
        } else {
          setCompanyInfo(DEFAULT_COMPANY_INFO);
          setError(true);
        }
      } catch (err: any) {
        console.error('Failed to fetch company info:', err);
        setCompanyInfo(DEFAULT_COMPANY_INFO);
        setError(true);
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
  // Main Render - Privacy Policy (EXACT) + Terms & Conditions (EXACT) + Checkbox
  // ==========================================================================

  return (
    <Stack direction="column" spacing={3}>
      {/* ==================== PRIVACY POLICY SECTION (EXACT COPY) ==================== */}
      <PrivacyPolicyContent companyInfo={companyInfo} />

      <Divider />

      {/* ==================== TERMS AND CONDITIONS SECTION (EXACT COPY) ==================== */}
      <TermsAndConditionsContent companyInfo={companyInfo} error={error} />

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
              I have read, understood, and agree to the <b>Terms & Conditions</b> and{' '}
              <b>Privacy Policy</b>.
            </Typography>
          }
        />
      </Box>
    </Stack>
  );
};

export default TermsAndPrivacyContent;
