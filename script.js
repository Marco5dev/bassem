document.addEventListener('DOMContentLoaded', () => {
    // Variables to track verification progress
    let selectedImages = new Set();
    let selectedAnswer = null;
    let verificationData = null;

    // Fetch the verification data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            verificationData = data;
            initImageVerification(data.images);
        })
        .catch(error => console.error('Error loading verification data:', error));

    // Initialize the image verification step
    function initImageVerification(images) {
        const imageGrid = document.getElementById('imageGrid');
        
        // Shuffle the images
        const shuffledImages = [...images].sort(() => Math.random() - 0.5);
        
        // Create and append image elements
        shuffledImages.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.dataset.id = image.id;
            
            const img = document.createElement('img');
            img.src = image.path;
            img.alt = 'Verification Image';
            
            imageItem.appendChild(img);
            imageGrid.appendChild(imageItem);
            
            // Add click event listener
            imageItem.addEventListener('click', () => {
                if (selectedImages.has(image.id)) {
                    selectedImages.delete(image.id);
                    imageItem.classList.remove('selected');
                } else {
                    if (selectedImages.size < 6) {
                        selectedImages.add(image.id);
                        imageItem.classList.add('selected');
                    }
                }
            });
        });
    }

    // Image verification button event
    document.getElementById('verifyImages').addEventListener('click', () => {
        if (selectedImages.size !== 6) {
            alert('Please select All the Robot images only the robot.');
            return;
        }

        // Check if the selected images are correct
        const correctImageIds = verificationData.images
            .filter(image => image.correct)
            .map(image => image.id);
            
        const isCorrect = [...selectedImages].every(id => correctImageIds.includes(id)) && 
                          selectedImages.size === correctImageIds.length;
        
        if (isCorrect) {
            goToNextStep('imageVerification', 'questionVerification');
            initQuestionVerification(verificationData.question);
        } else {
            alert('Incorrect selection. Please try again.');
            resetImageSelection();
        }
    });

    // Reset image selection
    function resetImageSelection() {
        selectedImages.clear();
        document.querySelectorAll('.image-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // Initialize the question verification step
    function initQuestionVerification(questionData) {
        document.getElementById('question').textContent = questionData.text;
        
        const answerOptions = document.getElementById('answerOptions');
        answerOptions.innerHTML = '';
        
        // Shuffle the answer options
        const shuffledOptions = [...questionData.options].sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.textContent = option.text;
            optionElement.dataset.index = index;
            
            optionElement.addEventListener('click', () => {
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
                selectedAnswer = index;
            });
            
            answerOptions.appendChild(optionElement);
        });
    }

    // Answer verification button event
    document.getElementById('verifyAnswer').addEventListener('click', () => {
        if (selectedAnswer === null) {
            alert('Please select an answer.');
            return;
        }
        
        const selectedOption = document.querySelector(`.answer-option.selected`).textContent;
        const isCorrect = verificationData.question.options.find(option => 
            option.text === selectedOption && option.correct);
        
        if (isCorrect) {
            goToNextStep('questionVerification', 'homePage');
        } else {
            alert('Incorrect answer. Please try again.');
            selectedAnswer = null;
            document.querySelectorAll('.answer-option').forEach(opt => {
                opt.classList.remove('selected');
            });
        }
    });

    // Navigate to next verification step
    function goToNextStep(currentStepId, nextStepId) {
        document.getElementById(currentStepId).classList.remove('active');
        document.getElementById(nextStepId).classList.add('active');
    }
});
