import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../store/auth';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  code: Yup.string().length(6, 'Must be 6 digits').required('Required'),
  newPassword: Yup.string().min(6, 'Min 6 characters').required('Required'),
});

const LoginScreen = () => {
  const { loginUser, sendResetCode, verifyAndResetPassword } = useAuthStore();
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [emailForReset, setEmailForReset] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (email: string) => {
    setIsLoading(true);
    const res = await sendResetCode(email);
    setIsLoading(false);

    if (res.success) {
      setEmailForReset(email);
      setStep('verify');
    }
  };

  const handleVerifyAndReset = async (values: { email: string; code: string; newPassword: string }) => {
    setIsLoading(true);
    const res = await verifyAndResetPassword(values);
    setIsLoading(false);

    if (res.success) {
      setIsForgotMode(false);
      setStep('email');
    }
  };


  return (
    <View style={styles.container}>
      {!isForgotMode ? (
        <>
          <Text style={styles.title}>Login</Text>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values) => {
              setIsLoading(true);
              try {
                await loginUser({ email: values.email, password: values.password });
              } catch (error) {
                Alert.alert('Login failed', 'Invalid credentials or server error');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  autoCapitalize="none"
                />
                {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

                <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsForgotMode(true)}>
                  <Text style={{ marginTop: 10, color: '#4A90E2' }}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </>
      ) : (
        <>
          <Text style={styles.title}>Forgot Password</Text>

          {step === 'email' && (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={Yup.object({ email: Yup.string().email().required() })}
              onSubmit={({ email }) => handleSendCode(email)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                  <TouchableOpacity
                    style={[styles.button, isLoading && { backgroundColor: '#ccc' }]}
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Please wait...' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          )}

          {step === 'verify' && (
            <Formik
              initialValues={{ email: emailForReset, code: '', newPassword: '' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleVerifyAndReset}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Verification Code"
                    keyboardType="numeric"
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    value={values.code}
                  />
                  {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}

                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    value={values.newPassword}
                  />
                  {touched.newPassword && errors.newPassword && <Text style={styles.error}>{errors.newPassword}</Text>}

                  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          )}

          <TouchableOpacity onPress={() => {
            setIsForgotMode(false);
            setStep('email');
          }}>
            <Text style={{ marginTop: 10, color: '#4A90E2' }}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 4 },
  error: { color: 'red', fontSize: 12, marginBottom: 6 },
  button: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default LoginScreen;
