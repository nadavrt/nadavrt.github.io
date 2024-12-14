document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const formValidator = {
        error: null,

        init(input) {
            this.error = false;
            if (input) {
                // Check the input type and proceed accordingly.
                if (input.name === 'email') this.validateEmail(input);
                else this.validateRegularField(input);
            } else {
                this.validateRegularField(document.querySelector('.contact-form input[name="name"]'));
                this.validateRegularField(document.querySelector('.contact-form textarea'));
                this.validateEmail(document.querySelector('.contact-form input[name="email"]'));
            }
        },

        /**
         * A helper function used to capitalize a word.
         * @param {string} string The string to capitalize.
         * @return {string} The capitalized string.
         */
        ucfirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /**
         * Validate that a required input field is not empty.
         * @param {HTMLElement} field The input field to validate.
         */
        validateRegularField(field) {
            field.classList.remove('error');
            if (field.value.trim() === '') {
                this.error = true;
                field.classList.add('error');
                field.placeholder = `${this.ucfirst(field.id)} is a required field.`;
            }
        },

        /**
         * Validate that a required email input field has a valid email.
         * @param {HTMLElement} field The email input field to validate.
         */
        validateEmail(field) {
            field.classList.remove('error');
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!emailRegex.test(field.value)) {
                this.error = true;
                field.classList.add('error');
                field.value = '';
                field.placeholder = 'Invalid email address.';
            }
        },
    };

    const contactForm = document.querySelector('.contact-form');

    // Add change event listeners to input and textarea elements.
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('change', () => formValidator.init(input));
    });

    // Add submit event listener to the form.
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formValidator.init();

        if (formValidator.error) return false;

        const submitButton = contactForm.querySelector('input[type="submit"]');
        submitButton.value = 'sending...';
        submitButton.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('sendContactForm.php', {
                method: 'POST',
                body: formData,
            });

            document.querySelector('#contact-form > .row').remove();
            if (response.ok && (await response.text()) === 'success') {
                contactForm.insertAdjacentHTML('beforeend', '<p>Your message has been sent successfully. Thank you for contacting me.</p>');
            } else {
                contactForm.insertAdjacentHTML('beforeend', '<p>An error has occurred while trying to process your message. Please reload the page and try again.</p>');
            }
        } catch (error) {
            document.querySelector('#contact-form > .row').remove();
            contactForm.insertAdjacentHTML('beforeend', '<p>An error has occurred while trying to process your message. Please reload the page and try again.</p>');
        }
    });
});
