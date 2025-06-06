import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegistrationScreen = ({ route, navigation }: any) => {
  const { userType } = route.params;
  const { registerUser, sendOtpToEmail, verifyEmailOtp } = useAuth(); // You must implement these two new methods in your AuthContext

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [emailVerifiedCheck, setEmailVerifiedCheck] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    ...(userType === 'vendor' && {
      businessName: Yup.string().required('Business name is required'),
      businessAddress: Yup.string().required('Business address is required'),
      businessContact: Yup.string().required('Business contact is required'),
    }),
  });

  const initialValues: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    businessName: '',
    businessAddress: '',
    businessContact: '',
  };

  const handleRegister = async (values: any) => {
    if (!isOtpVerified) return;

    const payload = {
      ...values,
      userType,
    };

    try {
      const result = await registerUser(payload);
      if (result) {
        setTimeout(() => {
          Alert.alert('Registration Successful', 'Your account has been created.', [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]);
        }, 100);
      }
    } catch (error: any) {
      Alert.alert('Failed!', error?.response?.data?.message);
      console.error('Error registering user:', error);
    }
  };

  const handleEmailBlur = async (email: string) => {
    if (!email || !email.includes('@')) return;

    try {
      await sendOtpToEmail(email); // call your backend to send OTP
      setIsOtpSent(true);
      setEmailError('');
    } catch (err: any) {
      console.log("error", err)
      setEmailError('Failed to send OTP. Try another email.');
    }
  };

  const handleVerifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
    try {
      await verifyEmailOtp(email, otp); // call backend to verify
      setIsOtpVerified(true);
      setEmailVerifiedCheck('✅');
      setEmailError('');
    } catch (err) {
      setEmailError('Invalid OTP. Please enter email again.');
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp('');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={64}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Create a new account</Text>
          </View>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleRegister}>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.form}>
                {/* First Name */}
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  placeholder="First name"
                  style={styles.input}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  autoCapitalize="none"
                />
                {touched.firstName && typeof errors.firstName === 'string' && <Text style={styles.errorText}>{errors.firstName}</Text>}

                {/* Last Name */}
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  placeholder="Last name"
                  style={styles.input}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                />
                {touched.lastName && typeof errors.lastName === 'string' && <Text style={styles.errorText}>{errors.lastName}</Text>}

                {/* Email + OTP Flow */}
                <Text style={styles.label}>Email {emailVerifiedCheck}</Text>
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(val) => {
                    setFieldValue('email', val);
                    setEmailVerifiedCheck('');
                    setIsOtpSent(false);
                    setIsOtpVerified(false);
                  }}
                  onBlur={() => handleEmailBlur(values.email)}
                  value={values.email}
                />
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}
                {touched.email && typeof errors.email === 'string' && <Text style={styles.errorText}>{errors.email}</Text>}

                {isOtpSent && !isOtpVerified && (
                  <>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                      placeholder="OTP"
                      style={styles.input}
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                    />
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#6c63ff' }]} onPress={() => {
                      handleVerifyOtp({ email: values.email, otp });
                    }}
                    >
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    </TouchableOpacity>
                  </>
                )}

                {isOtpSent && !isOtpVerified && (
                  <TouchableOpacity onPress={() => handleEmailBlur(values.email)}>
                    <Text style={{ color: '#4A90E2', marginTop: 5 }}>Resend OTP</Text>
                  </TouchableOpacity>
                )}

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && typeof errors.password === 'string' && <Text style={styles.errorText}>{errors.password}</Text>}

                {/* Phone Number */}
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  placeholder="Phone Number"
                  style={styles.input}
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  value={values.phoneNumber}
                />
                {touched.phoneNumber && typeof errors.phoneNumber === 'string' && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

                {/* Vendor fields */}
                {userType === 'vendor' && (
                  <>
                    <Text style={styles.sectionTitle}>Business Details</Text>

                    <Text style={styles.label}>Business Name</Text>
                    <TextInput
                      placeholder="Business Name"
                      style={styles.input}
                      onChangeText={handleChange('businessName')}
                      onBlur={handleBlur('businessName')}
                      value={values.businessName}
                    />
                    {touched.businessName && typeof errors.businessName === 'string' && <Text style={styles.errorText}>{errors.businessName}</Text>}

                    <Text style={styles.label}>Business Address</Text>
                    <TextInput
                      placeholder="Business Address"
                      style={[styles.input, styles.textArea]}
                      multiline
                      onChangeText={handleChange('businessAddress')}
                      onBlur={handleBlur('businessAddress')}
                      value={values.businessAddress}
                    />
                    {touched.businessAddress && typeof errors.businessAddress === 'string' && <Text style={styles.errorText}>{errors.businessAddress}</Text>}

                    <Text style={styles.label}>Business Contact</Text>
                    <TextInput
                      placeholder="Business Contact"
                      style={styles.input}
                      keyboardType="phone-pad"
                      onChangeText={handleChange('businessContact')}
                      onBlur={handleBlur('businessContact')}
                      value={values.businessContact}
                    />
                    {touched.businessContact && typeof errors.businessContact === 'string' && <Text style={styles.errorText}>{errors.businessContact}</Text>}
                  </>
                )}

                {/* Submit Button */}
                <TouchableOpacity style={[styles.button, !isOtpVerified && { backgroundColor: '#ccc' }]} onPress={() => handleSubmit()} disabled={!isOtpVerified}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fafbfc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegistrationScreen;
