const signUpForm = document.querySelector('.sign-up');

const hideAlerts = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlerts = (message, type) => {
  hideAlerts();
  const markup = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlerts, 5000);
};

const signUp = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/ryok/v1/user/signup',
      data,
    });

    if (res.data.status === 'success') {
      showAlerts('Account created successfully!', 'success');
      window.setTimeout(() => {
        location.assign('/tours');
      }, 1500);
    }
  } catch (err) {
    showAlerts(err.response.data.message, 'error');
  }
};

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signUp({ name, email, password, passwordConfirm });
  });
}
