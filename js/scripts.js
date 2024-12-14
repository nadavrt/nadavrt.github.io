/**
* Load additional images on demand. Used for the More Info section.
* @param  Object imageNode The node for the image that should be loaded.
* @return Boolean true if the process succeded. Otherwise false.
**/
function lazyLoadImage(imageNode)
{
    if ( $(imageNode).data('src') )
    {
      $(imageNode).attr('src', $(imageNode).data('src') );
      $(imageNode).removeAttr('data-src');
      return true;
    }
    else return false;
}

function resizeProfilePicture()
{
  let sidebarWrap = $('.sidebar-wrap-left, .sidebar-wrap-right'),
      sidebar = $('.sidebar');
      socialLinks = $('.social-links > div > a');

  sidebar.width($('.sidebar-wrap-left, .sidebar-wrap-right').width());
  sidebar.height($('.sidebar img').height());
  sidebarWrap.height($('.sidebar').height());
  socialLinks.height($('.social-links > div > a').width());
}

function runHomepageScripts()
{
  let heading = $('.sidebar h1, .sidebar h3'),
      isMobile = window.innerWidth < 768,
      isIpad = window.innerWidth > 768 && window.innerWidth < 1024;

  //update sidebar image source
  let profileImage = document.querySelector('.profile-image');
  if ( isMobile ) {
    profileImage.src = 'img/profile-pic-phones.jpg';
  }
  else {
    profileImage.src = 'img/profile-pic.jpg';
    resizeProfilePicture();
    window.addEventListener('resize', () => {
      resizeProfilePicture();
    });
  }

  //In case this is a PC, enable fadeInDown animation.
  if ( !isMobile && !isIpad ) setTimeout(function(){heading.addClass('fadeInDown');},200);

  //Add an animated arrow CSS effect to the sidebar for iPads.
  if ( isIpad ){
    let sidebar = document.querySelector('.sidebar');
    sidebar.dataset.device = "iPad";
  }

  /*Stucking Navigation Links*/
  let navLinks = { 1: 48, 2: 88, 3: 128, 4: 168, 5: 208, 6: 248, 7: 288, 8: 328, 9: 368, 10: 408, 11: 448, 12: 488, 13: 528};
  $.each( navLinks, function( i, val ) {
    $( "#" + i ).scrollToFixed({
      marginTop: val
    });
  });

	//INTERNAL ANCHOR LINKS SCROLLING (NAVIGATION)
	$('.scroll-up').click(function(){
    $("html, body").animate({ scrollTop: 0 }, 1000, 'easeInOutQuart');
    return false;
	});
	$(".scroll-top-40").click(function(event){		
		event.preventDefault();
		$('html, body').animate({scrollTop:$(this.hash).offset().top - 40}, 1000, 'easeInOutQuart');
	});
	$(".scroll").click(function(event){
		event.preventDefault();
		$('html, body').animate({scrollTop:$(this.hash).offset().top}, 1000, 'easeInOutQuart');
	});
	
	/*Contact Details (Box underneath profile picture) Animation*/
	let contactDetailsWayPoint = $('#strength').waypoint({
    handler: function(direction) {
      const contacts = $('.contact-details-wrap');
      if(direction === 'down') 
      {
       contacts.removeClass('fadeOutDown');
       contacts.addClass('fadeInUp');
      }
      else
      {
       contacts.removeClass('fadeInUp');
       contacts.addClass('fadeOutDown');
     }
    },
    offset: '10%',
  });

  // Skill bars years
  let currentYear = new Date().getFullYear();
  const rows = document.querySelectorAll('.xp-in-years');
  rows.forEach((row) => {
    if (row.dataset.year && !isNaN(row.dataset.year)){
      const yearStarted = parseInt(row.dataset.year);
      row.innerText = currentYear - yearStarted;
    }
  });

	// Skill Bars Animation
	let = $('.skillset').waypoint({
		handler: function(direction) {
      $('.indicator').each(function() {
				 var widthAnim = $(this).attr("data-percentage");
				 $(this).css('width', widthAnim + '%');
      });
	  }, 
    offset: '75%',
  });
	
	
	/***********Portfolio Filtering and information **********/
	$('.portfolio-filter a').click(function(e){e.preventDefault()});
	portfolio.init();

  $('.portfolio-item').click( function(e){
     e.preventDefault();
     let project = $('> a', this).data('project'),
         projectImageNode = $('.row[data-project=' + project + '] div > img'),
         rows = $('#more-info > .row');
         lazyLoadImage(projectImageNode);
     $(rows).removeClass('active');
     $.each(rows, function(){
        if ( $(this).data('project') == project )
        {
          $(this).addClass('active');
          return false;
        }
     })
  });

  // Copyright year
  document.querySelector('year').innerText = new Date().getFullYear();
}

if (Modernizr.touch) $('*').removeClass('animated'); //If this is a touch device we disable some functionality due to inconsistencies.

$(window).resize( resizeProfilePicture );
$(document).ready( runHomepageScripts );

//PORTFOILO FILTERING AND RESPONSIVENESS FUNCTION
var portfolio = (function( $ ) {
  'use strict';

  var $grid = $('.portfolio-items'),
      $filterOptions = $('.portfolio-filter'),
      $sizer = $grid.find('.shuffle__sizer'),

  init = function() {


    // None of these need to be executed synchronously
    setTimeout(function() {
      listen();
      setupFilters();
    }, 100);

    // You can subscribe to custom events. To receive the loading and done events,
    // you must subscribe to them before initializing the plugin, otherwise they will
    // fire before you have subscribed to them
    // shrink, shrunk, filter, filtered, sorted, load, done
    $grid.on('loading.shuffle done.shuffle shrink.shuffle shrunk.shuffle filter.shuffle filtered.shuffle sorted.shuffle layout.shuffle', function(evt, shuffle) {
      // Make sure the browser has a console
      if ( window.console && window.console.log && typeof window.console.log === 'function' ) {
        //console.log( 'Shuffle:', evt.type );
      }
    });

    // instantiate the plugin
    $grid.shuffle({
      itemSelector: '.portfolio-item',
      sizer: $sizer
    });

    // Destroy it! o_O
    // $grid.shuffle('destroy');
  },

  // Set up button clicks
  setupFilters = function() {
    var $btns = $filterOptions.children();
    $btns.on('click', function() {
      var $this = $(this),
          isActive = $this.hasClass( 'active' ),
          group = $this.data('group');
					$('.portfolio-filter .active').removeClass('active');
					$this.addClass('active');

      // Filter elements
      $grid.shuffle( 'shuffle', group );
    });

    $btns = null;
  },

  // Re layout shuffle when images load. This is only needed
  // below 768 pixels because the .picture-item height is auto and therefore
  // the height of the picture-item is dependent on the image
  // I recommend using imagesloaded to determine when an image is loaded
  // but that doesn't support IE7
  listen = function() {
    var debouncedLayout = $.throttle( 300, function() {
      $grid.shuffle('update');
    });

    // Get all images inside shuffle
    $grid.find('img').each(function() {
      var proxyImage;

      // Image already loaded
      if ( this.complete && this.naturalWidth !== undefined ) {
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      proxyImage = new Image();
      $( proxyImage ).on('load', function() {
        $(this).off('load');
        debouncedLayout();
      });

      proxyImage.src = this.src;
    });

    // Because this method doesn't seem to be perfect.
    setTimeout(function() {
      debouncedLayout();
    }, 500);
  };

  return {
    init: init
  };
}( jQuery ));