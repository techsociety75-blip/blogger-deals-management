export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateBloggerData = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.email || !validateEmail(data.email)) errors.push('Valid email is required');
  if (!data.category) errors.push('Category is required');
  return errors;
};

export const validateBookingData = (data) => {
  const errors = [];
  if (!data.bloggerId) errors.push('Blogger ID is required');
  if (!data.campaignName) errors.push('Campaign name is required');
  if (!data.budget || data.budget <= 0) errors.push('Valid budget is required');
  if (!data.dueDate) errors.push('Due date is required');
  return errors;
};
