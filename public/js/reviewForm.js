const setupReviewForm = () => {
  const reviewButton = document.getElementById('reviewButton');
  const reviewFormContainer = document.getElementById('reviewFormContainer');
  const reviewForm = document.getElementById('reviewForm');
  const cancelButton = document.querySelector('.btn-cancel');
  const tourId = reviewForm.dataset.tourId;
  const userId = reviewForm.dataset.userId;

  if (!reviewButton) return;

  // Toggle form visibility
  reviewButton.addEventListener('click', () => {
    reviewFormContainer.classList.add('show');
  });

  // Hide form on cancel
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      reviewFormContainer.classList.remove('show');
    });
  }

  const submitReview = async (review, rating, tour, user) => {
    try {
      const res = await axios({
        method: 'POST',
        url: `/ryok/v1/tsua/${tour}/reviews`,
        data: {
          review,
          rating,
          tour,
          user,
        },
      });
      if (res.data.status === 'success') {
        window.setTimeout(() => {
          location.reload();
        }, 1000);
      }
    } catch (err) {
      alert(err.response.data.message);
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  };

  // Handle form submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rating =
        document.querySelector('input[name="rating"]:checked')?.value || 5;
      const review = document.getElementById('review').value;

      if (!review) {
        alert('Please write a review before submitting');
        return;
      }

      // API call
      submitReview(review, rating, tourId, userId);

      // Reset and hide form
      reviewForm.reset();
      reviewFormContainer.classList.remove('show');
    });
  }
};

// Initialize all functions when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setupReviewForm();
});
