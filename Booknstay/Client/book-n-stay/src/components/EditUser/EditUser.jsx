import React, { useState, useEffect } from 'react';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { userService } from '../../UserService';
import { validators } from '../../Validations';

const EditUser = ({ action, action1 }) => {

  const [editUserFormData, setEditUserFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    state: '',
  });
  const inputs = {
    first_name: editUserFormData.first_name,
    last_name: editUserFormData.last_name,
    phone_number: editUserFormData.phone_number,
    address: editUserFormData.address,
    state: editUserFormData.state,
  }
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await userService.EditUser(inputs)
      action();
      action1();
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.data) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: "Unsuccessful attempt",
          showConfirmButton: false,
          timer: 5000,
        });
      }
    }
  };

  const handleEditFirstNameChange = (e) => {
    const inputValue = e.target.value;
    setEditUserFormData((prevData) => ({
      ...prevData,
      first_name: inputValue,
    }));

    const editFNameValidation = validators.validateName(inputValue);
    setFirstNameError(editFNameValidation);

    checkFormValidity();
  };

  const handleEditLastNameChange = (e) => {
    const inputValue = e.target.value;
    setEditUserFormData((prevData) => ({
      ...prevData,
      last_name: inputValue,
    }));

    const editLNameValidation = validators.validateName(inputValue);
    setLastNameError(editLNameValidation);

    checkFormValidity();
  };

  const handleAddressChange = (e) => {
    const inputValue = e.target.value;
    setEditUserFormData((prevData) => ({
      ...prevData,
      address: inputValue,
    }));
  };

  const handleStateChange = (e) => {
    const inputValue = e.target.value;
    setEditUserFormData((prevData) => ({
      ...prevData,
      state: inputValue,
    }));
  };

  const handleEditPhoneChange = (e) => {
    const inputValue = e.target.value;
    setEditUserFormData((prevData) => ({
      ...prevData,
      phone_number: inputValue,
    }));

    const editPhnNumberValidation = validators.validatePhoneNumber(inputValue);
    setPhoneNumberError(editPhnNumberValidation);

    checkFormValidity();
  };

  const checkFormValidity = () => {
    setFormValid(
      editUserFormData.first_name.trim() !== '' &&
      editUserFormData.last_name.trim() !== '' &&
      editUserFormData.phone_number.trim() !== ''
    );
  };

  const fetchUserDetails = async () => {
    try {
      const response = await userService.GetEditUser();

      const userData = response.data;
      setEditUserFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone_number: userData.phone_number || "",
        address: userData.address || "",
        state: userData.state || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    checkFormValidity();
  }, [
    editUserFormData.first_name,
    editUserFormData.last_name,
    editUserFormData.phone_number,
  ]
  );

  return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '16px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', mx: 'auto' }}> <LockOutlinedIcon /> </Avatar>
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", fontFamily: 'serif' }} > Edit Profile </Typography>

        <Box noValidate data-testid="form-submit" sx={{ width: '80%', mt: '10%', mx: 'auto' }} >
          <TextField
            autoComplete="given-name"
            name="first_name"
            required
            fullWidth
            id="first_name"
            label="First Name"
            value={editUserFormData.first_name}
            autoFocus
            onChange={handleEditFirstNameChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action.active" />
                </InputAdornment>
              )
            }}
          />
          {firstNameError && (
            <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb: 2 }} >
              {firstNameError}
            </Typography>
          )}

          <TextField
            required
            fullWidth
            id="last_name"
            value={editUserFormData.last_name}
            label="Last Name"
            name="last_name"
            onChange={handleEditLastNameChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action.active" />
                </InputAdornment>
              ),
            }}
          />
          {lastNameError && (
            <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb: 2 }} >
              {lastNameError}
            </Typography>
          )}

          <TextField
            required
            fullWidth
            id="address"
            value={editUserFormData.address}
            label="Address"
            name="address"
            onChange={handleAddressChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action.active" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            required
            fullWidth
            id="state"
            value={editUserFormData.state}
            label="State"
            name="state"
            onChange={handleStateChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action.active" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            required
            fullWidth
            id="phone_number"
            value={editUserFormData.phone_number}
            label="Phone Number"
            name="phone_number"
            onChange={handleEditPhoneChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <PhoneIcon style={{ marginRight: '8px', color: '#757575' }} />
              )
            }}
          />
          {phoneNumberError && (
            <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -2, mb: 2 }} >
              {phoneNumberError}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={!formValid || isSubmitting} onClick={handleEdit}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Box>
  );
};
export default EditUser;