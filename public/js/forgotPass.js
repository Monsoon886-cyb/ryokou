const forgotPassForm = document.querySelector('.forgotpass-form');

const hideAlertss = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlertss = (message, type) => {
  hideAlertss();
  const markup = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlertss, 5000);
};

const forgotPass = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/ryok/v1/user/forgotpassword',
      data: {
        email: email,
      },
    });

    if (res.data.status === 'success') {
      showAlertss(
        'Password reset token has been sent to your Email',
        'success'
      );

      window.setTimeout(() => {
        location.assign('/login');
      }, 2000);
    }
  } catch (err) {
    showAlertss(err.response.data.message, 'error');
  }
};

if (forgotPassForm) {
  forgotPassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    forgotPass(email);
  });
}
