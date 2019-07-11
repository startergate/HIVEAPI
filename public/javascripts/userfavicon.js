$('.login').click(function(event) {
  if ($('.userDropdown').hasClass('hidden')) {
    $('.userDropdown').removeClass('hidden');
  } else {
    $('.userDropdown').addClass('hidden');
  }
});