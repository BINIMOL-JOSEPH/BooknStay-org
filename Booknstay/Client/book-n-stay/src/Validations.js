import validator from 'validator';


const validateHotelName = (value) => {
    if (!value.trim()) {
      return 'Please enter your hotel name.';
    } else {
      return ''; 
    }
};

const validateAddress = (value) => {
    if (!value.trim()) {
        return 'Please enter your address.';
    } else {
        return '';
    }
};

const validateDescription = (value) => {
    if (!value.trim()) {
        return 'Please enter hotel description.';
    } else {
        return '';
    }
}; 

const validateCity = (value) => {
    if(!value.trim()) {
        return 'Please enter your city.'
    } else if (!/^[a-zA-Z ]+$/.test(value)) {
        return 'Please enter a valid city name.';
    } else {
        return ''
    }
};

const validateDistrict = (value) => {
    if(!value.trim()) {
        return 'Please enter your district.'
    } else if (!/^[a-zA-Z ]+$/.test(value)) {
        return 'Please enter a valid district name.';
    } else {
        return ''
    }
};

const validateState = (value) => {
    if(!value.trim()) {
        return 'Please enter your state.'
    } else if (!/^[a-zA-Z ]+$/.test(value)) {
        return 'Please enter a valid state name.';
    } else {
        return ''
    }
};

const validateEmail = (value) => {
    let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;   

    if(!value.trim()) {
        return 'Please enter an email address.'
    } else if (!regex.test(value)) {
        return 'Enter a valid email address.'
    } else {
        return ''
    }
};

const validatePhoneNumber = (value) => {
    const isNumeric = /^\d+$/.test(value);

    if(!value.trim()) {
        return 'Please enter your phone number.'
    } else if (isNumeric) {
        const isValidLength = value.length === 10;

        if (!isValidLength) {
            return 'Invalid phone number. Must be 10 digits.'
        } else {
            return ''
        }
    } else {
        return 'Invalid characters in phone number. Only digits are allowed.'
    }
};

const validatePinCode = (value) => {
    const isNumeric = /^\d+$/.test(value);

    if(!value.trim()) {
        return 'Please enter your pincode.'
    } else if (isNumeric) {
        const isValidLength = value.length === 6;

        if (!isValidLength) {
            return 'Invalid pincode. Must be 6 digits.'
        } else {
            return ''
        }
    } else {
        return 'Invalid characters in pincode. Only digits are allowed.'
    }
};

const validateServiceCharge = (value) => {
    if(!value.trim()) {
        return 'Please enter the rate.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return 'Rate should be numeric value with atmost 2 decimal place.'
    } else {
        return ''
    }
};

const validateLicenseNumber = (value) => {
    if(!value.trim()) {
        return 'Please enter the license number.'
    } else if (!/^\d{2}-\d{4}-\d{4}$/.test(value)) {
        return 'Please enter a valid license number (e.g., 12-1234-1234).'
    } else {
        return ''
    }
};

const validateLink = (value) => {
    if(!value.trim()) {
        return 'Please enter the location link.'
    } else if (!validator.isURL(value)) {
        return 'Please provide valid url'
    } else {
        return ''
    }
};

const validatePassword = (value) => {
    if(!value.trim()) {
        return 'Please enter a password. '
    } else if (value.length < 8 || !/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return 'Password must contain one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.'
    } else {
        return ''
    }
};

const validateName = (value) => {
    if (!value.trim()) {
      return 'Please fill this field.';
    } else {
      return ''; 
    }
};

const validateNumberOfRooms = (value) => {
    const isNumeric = /^\d+$/.test(value);

    if (!value.trim()) {
        return 'Please enter the number of rooms.';
    } else if (!isNumeric) {
        return 'Invalid characters. Only digits are allowed.';
    } else {
      return ''; 
    }
};

const validateRoomFacilites = (value) => {
    const isValid = /^[A-Za-z, ]+$/.test(value);

    if (!value.trim()) {
        return 'Please enter the room facilities.';
    } else if (!isValid) {
        return 'Invalid characters. Only letters are allowed.';
    } else {
      return ''; 
    }
};
const validateServiceDescription = (value) => {

    if (!value.trim()) {
        return 'Please enter the service description.';
    } else {
        return '';
    }
};
const validateServiceTitle = (value) => {
    const isValid = /^[A-Za-z, ]+$/.test(value);
    if (!value.trim()) {
        return 'Please enter the service title.';
    } else if (!isValid) {
        return 'Invalid characters. Only letters are allowed.';
    } else {
        return '';
    }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; 

const validateImage = (file) => {
    const allowedFormats = ['jpeg', 'png', 'jpg'];

    if (!file) {
        return 'Please choose an image file.';
    }

    const fileNameParts = file.name.split('.');
    const fileFormat = fileNameParts[fileNameParts.length - 1].toLowerCase();

    if (!allowedFormats.includes(fileFormat)) {
        return 'Invalid file format. Please choose a jpeg, png, or jpg file.';
    } else if (file.size > MAX_FILE_SIZE) {
        return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB. Please choose a smaller file.`;
    }

    return '';
};
const validateAadharNumber = (value) => {
    const isNumeric = /^\d+$/.test(value);

    if(!value.trim()) {
        return 'Please enter your aadhar number.'
    } else if (isNumeric) {
        const isValidLength = value.length === 12;

        if (!isValidLength) {
            return 'Invalid aadhar number. Must be 12 digits.'
        } else {
            return ''
        }
    } else {
        return 'Invalid characters in aadhar number. Only digits are allowed.'
    }
};

const validateRoomType = (value) => {
    const isValid = /^[A-Za-z, ]+$/.test(value);

    if(!value.trim()) {
        return 'Please fill this field'
    } else if (!isValid) {
        return 'Invalid characters. Only letters are allowed.';
    } else {
        return '';
    }
}

  
const validators = {
    validateHotelName,  
    validateAddress,
    validateDescription,
    validateCity,
    validateDistrict,
    validateState,
    validateEmail,
    validatePhoneNumber,
    validatePinCode,
    validateServiceCharge,
    validateLicenseNumber,
    validateLink,
    validatePassword,
    validateName,
    validateNumberOfRooms,
    validateRoomFacilites,
    validateAadharNumber,
    validateServiceDescription,
    validateServiceTitle,
    validateImage,
    validateRoomType
};


export {validators}

  
