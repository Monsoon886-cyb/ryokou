// Select form elements properly
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const hideTheAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showTheAlert = (message, type) => {
  hideTheAlert();
  const markup = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideTheAlert, 5000);
};

const updateUser = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? '/ryok/v1/user/updatepassword'
          : '/ryok/v1/user/updateme',
      data,
    });

    if (res.data.status === 'success') {
      showTheAlert(`${type.toUpperCase()} updated successfully!`, 'success');
    }
  } catch (err) {
    console.error('Update error:', err);
    showTheAlert('Error updating settings', 'error');
  }
};

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUser(form, 'user');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Show loading state
    document.querySelector('.password-btn').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUser(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    // Reset button text
    document.querySelector('.password-btn').textContent = 'Update Password';

    // Clear input fields after password update
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
