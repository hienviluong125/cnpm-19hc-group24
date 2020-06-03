$(document).ready(function () {
  $('.confirm-dialog').on('click', function(e) {
    e.preventDefault();
    confirmResult = window.confirm("Are you sure you want to delete this one ?");
    if(confirmResult) {
      let buttonHref = $(this).attr('href');
      window.location.href = buttonHref;
    }
  });
});
