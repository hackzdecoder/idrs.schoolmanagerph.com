import StudentIdRegistrationForm from 'components/sections/authentications/StudentIdRegistrationForm';

const StudentIdRegistration = () => {
  const defaultValues = {
    studentId: '',
    schoolIdCode: '',
  };

  return <StudentIdRegistrationForm defaultValues={defaultValues} />;
};

export default StudentIdRegistration;
