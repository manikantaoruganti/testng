export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const isRequired = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'This field is required.';
  }
  return null;
};

export const isPositiveNumber = (value) => {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return 'Must be a positive number.';
  }
  return null;
};

export const isMinLength = (value, min) => {
  if (typeof value !== 'string' || value.length < min) {
    return `Must be at least ${min} characters long.`;
  }
  return null;
};

