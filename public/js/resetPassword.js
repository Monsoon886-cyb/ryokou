const resetPasswordForm = document.querySelector('.reset-password-form');

const hideAlertz = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlertz = (message, type) => {
  hideAlertz();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlertz, 5000);
};

const url = new URL(window.location.href);
const pathSegments = url.pathname.split('/');
const resetToken = pathSegments.pop();

const resetPass = async (password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/ryok/v1/user/resetPassword/${resetToken}`,
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status == 'success') {
      showAlertz('Password has been reset.', 'success');

      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlertz(err.response.data.message, 'error');
  }
};

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const passConfirm = document.getElementById('passwordConfirm').value;

    resetPass(pass, passConfirm);
  });
}
