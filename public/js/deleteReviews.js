const deleteReview = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/ryok/v1/review/${id}`,
    });
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.addEventListener('click', function (e) {
  if (e.target.closest('.delete-btn')) {
    const button = e.target.closest('.delete-btn');
    const reviewId = button.dataset.reviewId;

    deleteReview(reviewId);
  }
});
