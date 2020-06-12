$(document).ready(function () {
  $('.confirm-dialog').on('click', function(e) {
    e.preventDefault();
    confirmResult = window.confirm("Are you sure you want to delete this one ?");
    if(confirmResult) {
      let buttonHref = $(this).attr('href');
      window.location.href = buttonHref;
    }
  });

  $('body').on('click', '.confirm-popup' ,function(e) {
    e.preventDefault();
    confirmResult = window.confirm($(this).data('warning-message'));
    if(confirmResult) {
      let buttonHref = $(this).attr('href');
      window.location.href = buttonHref;
    }
  });

  $('#book-now-btn').on('click', function(e){
    if($('#book-date').val().length <= 0) {
      let td = new Date();
      let tdDate = td.getDate();
      tdDate = tdDate.toString().length < 2 ? `0${tdDate}` : tdDate;
      let tdMonth = td.getMonth() + 1;
      tdMonth = tdMonth.toString().length < 2 ? `0${tdMonth}` : tdMonth;
      let tdYear = td.getFullYear();

      let formattedDate = `${tdYear}-${tdMonth}-${tdDate}`;

      $('#book-date').val(formattedDate);
    }
  })
});
