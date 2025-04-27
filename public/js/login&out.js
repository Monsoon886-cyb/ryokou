const logInForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.logout-btn');
const detailsbtn = document.querySelector('.btn--smalls');

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (message, type) => {
  hideAlert();
  const markup = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const logIn = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/ryok/v1/user/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('Logged in successfully!', 'success');
      window.setTimeout(() => {
        location.assign('/tours');
      }, 1500);
    }
  } catch (err) {
    showAlert(err.response.data.message, 'error');
  }
};

const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/ryok/v1/user/logout',
    });

    if (res.data.status === 'success') {
      showAlert('Logged out successfully!', 'success');
      location.assign('/');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('Error logging out! Try again.', 'error');
  }
};

if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    logIn(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logOut);
}
if (detailsbtn) {
  detailsbtn.addEventListener('click', () => {
    showAlert('Your are not logged in!', 'fail');
    window.setTimeout(() => {
      location.assign('/login');
    }, 1000);
  });
}
