document.addEventListener('DOMContentLoaded', () => {
    
    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            
            // Toggle active class on header
            header.classList.toggle('active');
            
            // Animate max-height
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = 0;
            }
        });
    });

    // Modal Logic
    const modal = document.getElementById('configModal');
    const btnConfig = document.getElementById('btnConfig');
    const btnCloseModal = document.getElementById('closeModal');
    const btnSaveModal = document.getElementById('btnSaveModal');

    if (btnConfig && modal) {
        btnConfig.addEventListener('click', () => {
            modal.classList.add('show');
        });
    }

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    if (btnSaveModal && modal) {
        btnSaveModal.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            modal.classList.remove('show');
            // Optional: alert('Perfil salvo com sucesso!');
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

});
