document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.querySelector('.share-btn');
  const photoUploadContainer = document.querySelector(
    '.photo-upload-container'
  );
  const cancelBtn = document.querySelector('.upload-cancel-btn');
  const submitBtn = document.querySelector('.upload-submit-btn');
  const fileInputs = document.querySelectorAll('.photo-upload-input');
  const experienceInput = document.querySelector('.experience-text-input'); // descriptiom
  const tourId = document.getElementById('tourId').value;
  const userId = document.getElementById('userId').value;

  shareBtn.addEventListener('click', () => {
    photoUploadContainer.classList.add('active');
  });

  cancelBtn.addEventListener('click', () => {
    photoUploadContainer.classList.remove('active');
    resetForm();
  });

  fileInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const circle = e.target.closest('.photo-upload-circle');
        const plusIcon = circle.querySelector('.plus-icon');

        plusIcon.style.display = 'none';

        const existingPreview = circle.querySelector('.preview-image');
        if (existingPreview) {
          circle.removeChild(existingPreview);
        }

        const indicator = document.createElement('div');
        indicator.classList.add('preview-image');
        indicator.innerHTML = '<i class="fas fa-check"></i>';
        circle.appendChild(indicator);
      }
    });
  });

  const createExpl = async (description, tour, user) => {
    try {
      const res = await axios({
        method: 'POST',
        url: `/ryok/v1/explore/`,
        data: {
          description,
          tour,
          user,
        },
      });
      if (res.data.status === 'success') {
        return res.data.data.explore._id;
      }
      return null;
    } catch (err) {
      alert(err.response.data.message);
      return null;
    }
  };

  const createExpl2 = async (data, exploreId) => {
    try {
      const res = await axios({
        method: 'PATCH',
        url: `/ryok/v1/explore/add/${exploreId}`,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  // Handle form
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';

      const formData = new FormData();

      let hasFiles = false;
      fileInputs.forEach((input) => {
        if (input.files && input.files.length > 0) {
          formData.append('images', input.files[0]);
          hasFiles = true;
        }
      });

      const experienceText = experienceInput.value.trim();

      if (!hasFiles && !experienceText) {
        alert(
          'Please upload at least one photo or write about your experience.'
        );
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        return;
      }

      try {
        const exploreId = await createExpl(experienceText, tourId, userId);

        if (exploreId) {
          await createExpl2(formData, exploreId);

          photoUploadContainer.classList.remove('active');
          resetForm();
        } else {
          alert('Failed to create explore document');
        }
      } catch (error) {
        alert(error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }

  // Reset the form
  function resetForm() {
    fileInputs.forEach((input) => {
      input.value = '';
      const circle = input.closest('.photo-upload-circle');
      const previewImg = circle.querySelector('.preview-image');
      if (previewImg) {
        circle.removeChild(previewImg);
      }

      const plusIcon = circle.querySelector('.plus-icon');
      plusIcon.style.display = '';
    });

    experienceInput.value = '';
  }
});
