(function($){
	'use strict'

	let formValidator = {
		error: null,

		init: function(input)
		{
			formValidator.error = false;
			if ( input )
			{
				//Check the input type and proceed accordingly.
				if ( $(input).attr('id') == 'email' ) formValidator.validateEmail(input);
				else formValidator.validateRegularField(input);
			}
			else
			{
				formValidator.validateRegularField( $('.contact-form input[id="name"]') );
				formValidator.validateRegularField( $('.contact-form textarea') );
				formValidator.validateEmail( $('.contact-form input[id="email"]') );
			}
		},

		/**
		*	A helper function used to capitalize a word.
		*	@param str string The string to capitalize.
		*	@return str The capitalized string.
		**/
		ucfirst: function(string) 
		{
		    return string.charAt(0).toUpperCase() + string.slice(1);
		},


		/**
		*	Validate that a required input field is not empty.
		*	@param obj field The paragraph DOM object of said field
		*	@return NULL
		*
		**/
		validateRegularField: function(field)
		{
			$(field).removeClass('error');
			if ( $(field).val().trim() == '')
			{
				formValidator.error = true;
				$(field).addClass('error');
				$(field).attr('placeholder', formValidator.ucfirst($(field).attr('id')) + ' is a required field.');
			}
		},


		/**
		*	Validate that a required email input field has a valid email.
		*	@param obj field The paragraph DOM object of said field
		*	@return NULL
		*
		**/
		validateEmail: function(field)
		{
			$(field).removeClass('error');
			if ( !$(field).val().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/) )
			{
				formValidator.error = true;
				$(field).addClass('error');
				$(field).val('');
				$(field).attr('placeholder', 'Invalid email address.');
			}
		},

	} //End of formValidator class

	$(document).ready(function(){
		$('.contact-form input').on('change', function(){formValidator.init(this) });
		$('.contact-form textarea').on('change', function(){formValidator.init(this) });
		$('.contact-form').submit( function(e){
			e.preventDefault();
			formValidator.init();
			if ( formValidator.error ) return false;
			$('.contact-form input[type="submit"]').val('sending...').attr('disabled', 'disabled');

			const url = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeeRpbMz1UIyQx4gWowviwGhUY4ynZOkQY9SSErGL-Z_WkUKg/formResponse';
			const params = new URLSearchParams({
				"entry.1017880708": this.name.value,
				"entry.633732075": this.email.value,
				"entry.200786538": this.message.value,
			}).toString();

			fetch(`${url}?${params}`, { method: "GET", mode: 'no-cors' })
				.then(response => {
					$('#contact-form > .row').remove();
			        $('#contact-form').append('<p>Your message has been sent successfully. Thank you for contacting me.</p>');
				})
				.catch(error => {
					$('#contact-form > .row').remove();
			      	$('#contact-form').append('<p>An error has occured while trying to process your message. Please reload the page and try again.</p>');
				});
		}); //End .submit
	}); // End document.ready
})(jQuery);