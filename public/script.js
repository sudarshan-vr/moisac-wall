document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    const loadingDiv = document.getElementById('loading');
    
    let stream = null;
    let photoData = null;
    let isCaptured = false;
    let flashTimeout;

    // Check for camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Camera access is not supported in your browser.');
        return;
    }

    // Start the camera
    async function loadImages() {
        try {
            const response = await fetch(`${window.location.origin}/api/images`);
            const data = await response.json();
            console.log(data);
        } catch (err) {
            console.error('Error loading images:', err);
        }
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            video.srcObject = stream;
            video.play();
            
            // Show/hide appropriate buttons
            captureBtn.style.display = 'block';
            retakeBtn.style.display = 'none';
            uploadBtn.style.display = 'none';
            video.style.display = 'block';
            canvas.style.display = 'none';
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            showError('Could not access the camera. Please ensure you have granted camera permissions.');
        }
    }

    // Flash animation
    function triggerFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        flash.style.zIndex = '1000';
        flash.style.opacity = '0';
        flash.style.transition = 'opacity 0.3s ease-out';
        
        document.body.appendChild(flash);
        
        // Trigger reflow
        void flash.offsetWidth;
        
        flash.style.opacity = '1';
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 300);
        }, 100);
    }

    // Capture photo
    function capturePhoto() {
        // Trigger flash effect
        triggerFlash();
        
        // Play camera shutter sound
        const shutterSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 
            '=='); // Very short beep sound
        shutterSound.play().catch(e => console.log('Audio play failed:', e));
        
        // Add a small delay to sync with flash
        setTimeout(() => {
            const context = canvas.getContext('2d');
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Apply a subtle filter for better image quality
            context.filter = 'contrast(1.05) saturate(1.1)';
            context.drawImage(canvas, 0, 0);
            context.filter = 'none';
            
            // Get image data as base64
            photoData = canvas.toDataURL('image/jpeg', 0.9);
            
            // Show the captured image with animation
            video.style.opacity = '0';
            canvas.classList.add('visible');
            
            // Update UI
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-flex';
            uploadBtn.style.display = 'inline-flex';
            
            // Hide any previous messages
            hideMessages();
            
            isCaptured = true;
        }, 150);
    }

    // Upload photo to server
    async function uploadPhoto() {
        if (!photoData) {
            showError('No photo to upload');
            return;
        }
        
        try {
            // Show loading state with animation
            loadingDiv.style.display = 'flex';
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            hideMessages();
            
            // Add a small delay to show the loading state
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Convert base64 to blob
            const blob = await (await fetch(photoData)).blob();
            const formData = new FormData();
            formData.append('photo', blob, `selfie-${Date.now()}.jpg`);
            
            // Send to server with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
            
            const response = await fetch(`${window.location.origin}/api/upload`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                let error;
                try {
                    const data = await response.json();
                    error = new Error(data.error || 'Upload failed');
                } catch (e) {
                    error = new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                throw error;
            }
            
            const data = await response.json();
            
            // Show success animation
            uploadBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
            showSuccess('Photo added to the mosaic wall!');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = `${window.location.origin}/dashboard`;
            }, 1500);
            
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err.name === 'AbortError' 
                ? 'Upload timed out. Please check your connection.' 
                : err.message || 'Error uploading photo. Please try again.';
            
            showError(errorMessage);
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Try Again';
            uploadBtn.disabled = false;
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // Helper functions
    function showError(message) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.justifyContent = 'center';
        successDiv.style.display = 'none';
        
        // Auto-hide error after 5 seconds
        clearTimeout(window.errorTimeout);
        window.errorTimeout = setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.style.display = 'none';
                errorDiv.style.opacity = '1';
            }, 300);
        }, 5000);
    }
    
    function showSuccess(message) {
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.display = 'flex';
        successDiv.style.alignItems = 'center';
        successDiv.style.justifyContent = 'center';
        errorDiv.style.display = 'none';
    }
    
    function hideMessages() {
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
    }
    
    // Add icon to error/success messages
    errorDiv.insertAdjacentHTML('afterbegin', '<i class="fas fa-exclamation-circle"></i> ');
    successDiv.insertAdjacentHTML('afterbegin', '<i class="fas fa-check-circle"></i> ');

    // Event Listeners
    captureBtn.addEventListener('click', capturePhoto);
    retakeBtn.addEventListener('click', startCamera);
    uploadBtn.addEventListener('click', uploadPhoto);

    // Start the camera when the page loads
    async function init() {
        try {
            await startCamera();
            // Add a subtle animation when camera starts
            video.style.opacity = '0';
            video.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                video.style.opacity = '1';
            }, 100);
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize camera. Please check permissions and try again.');
        }
    }
    
    // Add click effect to buttons
    [captureBtn, retakeBtn, uploadBtn].forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.currentTarget.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = '';
        });
    });
    
    // Initialize the app
    init();
});
