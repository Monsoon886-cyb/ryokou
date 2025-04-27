const bookingForm = document.querySelector('.booking-form');
const participantsInput = document.getElementById('participants');
const participantsCount = document.getElementById('participantsCount');
const participantsName = document.getElementById('participantNames');
const totalPrice = document.getElementById('totalPrice');
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCVCInput = document.getElementById('cardCVC');
const cardNameInput = document.getElementById('cardName');
const currencyElement =
  document.getElementById('currency-symbol').dataset.currency;
const bookBtn = document.querySelector('.booking-btn');

const hideAlertssz = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlertssz = (message, type) => {
  hideAlertssz();
  const markup = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlertssz, 5000);
};

// Get tour and user data from data attributes
const getTourData = () => {
  const tourDataElement = document.getElementById('tourData');
  if (!tourDataElement) return null;

  return {
    id: tourDataElement.dataset.tourId,
    price: parseFloat(tourDataElement.dataset.tourPrice),
  };
};

const getUserData = () => {
  const userDataElement = document.getElementById('userData');
  if (!userDataElement) return null;

  return {
    id: userDataElement.dataset.userId,
  };
};

// Update booking summary
const updateBookingSummary = () => {
  if (!participantsInput || !participantsCount || !totalPrice) return;

  const participants = parseInt(participantsInput.value);
  const tourData = getTourData();
  const price = tourData ? tourData.price : 0;
  // const currencySymbol = getCurrencySymbol();

  participantsCount.textContent = participants;
  totalPrice.textContent = ` ${currencyElement} ${participants * price}`;
};

const book = async (tour, user, price, passengers, passengerNum) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/ryok/v1/tsua/${tour}/book/`,
      data: {
        tour,
        user,
        price,
        passengers,
        passengerNum,
      },
    });
    if (res.data.status === 'success') {
      showAlertssz('Tour Successfully booked', 'success');
      window.setTimeout(() => {
        location.assign('/tours');
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    showAlertssz(err.response.data.message, 'error');
    // Reset button text and state on error
    if (bookBtn) {
      bookBtn.textContent = 'Book Now';
      bookBtn.disabled = false;
    }
  }
};

// Event listeners
if (participantsInput) {
  participantsInput.addEventListener('change', updateBookingSummary);
  participantsInput.addEventListener('input', updateBookingSummary);
}

// Properly handle form submission
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Change button text to "Booking..."
    if (bookBtn) {
      bookBtn.textContent = 'Booking...';
      bookBtn.disabled = true;
    }

    const tourData = getTourData();
    const userData = getUserData();

    if (!tourData || !userData) {
      console.error('Missing tour or user data');
      // Reset button if there's an error
      if (bookBtn) {
        bookBtn.textContent = 'Book Now';
        bookBtn.disabled = false;
      }
      return;
    }

    //Get passenger names
    const passengerNames = participantsName.value
      .split(',')
      .map((names) => names.trim());

    const participantsNum = participantsInput ? participantsInput.value : 1;
    const totalP = totalPrice.textContent.split(' ')[2];
    book(
      tourData.id,
      userData.id,
      Number(totalP),
      passengerNames,
      participantsNum
    );
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    if (!bookingForm) {
      e.preventDefault();
      // Change button text to "Booking..."
      bookBtn.textContent = 'Booking...';
      bookBtn.disabled = true;

      console.log('Book button clicked directly');
      alert('Booking initiated! This is a direct button click.');

      // Reset button after direct click flow completes
      setTimeout(() => {
        bookBtn.textContent = 'Book Now';
        bookBtn.disabled = false;
      }, 2000);
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Booking page loaded');
  updateBookingSummary();
});

////////////////////////////////////////////////////////////
