function clearViews() {
  $("#reading-book-title").empty();
  $("#reading-progress").text("");
  $("#reading-list").empty();
}

function disableViews(disabled) {
  $(".dialog-btn").prop("disabled", disabled);
  $(".reading-date-from").prop("disabled", disabled);
  $(".reading-date-to").prop("disabled", disabled);
}

function updateBookRate(rate) {
  $("#book-rate").attr("data-book-rate", rate)

  for (i = 1; i <= 5; i++) {
    var star = $("#star" + i);
    star.removeClass("active");
    star.text("star_border");
    if (i <= rate) {
      $(star).addClass("active")
      star.text("star");
    }
  }
}

function updateReadingList(readings) {
  var actionFinish = $("#action-finish");
  var actionRead = $("#action-read");
  var actionAbandon = $("#action-abandon");
  var actionRemoveBook = $("#action-remove-book");

  if (readings.length == 0) {
    $("#reading-progress").text("Unread");
    actionFinish.hide();
    actionRead.show();
    actionAbandon.hide();
  }
  else {
    var latest = readings[0];
    switch (latest.progress) {
      case 'R':
        $("#reading-progress").text("Reading");
        actionFinish.show();
        actionRead.hide();
        actionAbandon.show();
        break;

      case 'F':
        $("#reading-progress").text("Finished");
        actionFinish.hide();
        actionRead.show();
        actionAbandon.hide();
        break;

      case 'A':
        $("#reading-progress").text("Abandoned");
        actionFinish.hide();
        actionRead.show();
        actionAbandon.hide();
        break;
    }
  }

  var statuses = {
    "R": "<span class='oi oi-pulse reading-progress-r'></span>",
    "F": "<span class='oi oi-check reading-progress-f'></span>",
    "A": "<span class='oi oi-x reading-progress-a'></span>"
  };

  for (var index in readings) {
    var reading = readings[index];
    var from = "<td class='reading-list-column reading-list-column-center'><input class='form-control form-control-sm reading-date reading-date-from' type='text' readonly value='" + reading.start_date + "'></td>";
    var isEnded = reading.end_date != null;
    var to = "<td class='reading-list-column reading-list-column-center'><input class='form-control form-control-sm reading-date reading-date-to' type='text' readonly " + (isEnded ? "" : "hidden ") + "value='" + (isEnded ? reading.end_date : "") + "'></td>";
    var progress = "<td class='reading-list-column reading-list-column-center'>" + statuses[reading.progress] + "</td>";
    var btnSave = "<button class='btn btn-primary btn-sm save-reading dialog-btn' href='#'><span class='oi oi-box btn-icon'></span>Save</a>";
    var btnDelete = "<button class='btn btn-danger btn-sm delete-reading dialog-btn' href='#'><span class='oi oi-delete btn-icon'></span>Delete</a>";
    var actions = "<td class='reading-list-column' id='reading-list-actions'>" + btnSave + btnDelete + "</td>";
    $("#reading-list").append("<tr reading-id='" + reading.id + "'>" + from + to + progress + actions + "</tr>");
  }

  $("tr").each(function() {
    checkDatePickers($(this));
  });

  $(".delete-reading").click(onDeleteClick);
  $(".save-reading").hide();
  $(".save-reading").click(onSaveClick);
}

function checkDatePickers(row) {
  var inputDateFrom = row.find(".reading-date-from");
  var inputDateTo = row.find(".reading-date-to");
  var dateFrom = inputDateFrom.attr("value");
  var dateTo = inputDateTo.attr("value");

  var onDateSelect = function(dateText, inst) {
    var oldValue = $(this).attr("value");
    if (oldValue == dateText) return;

    $(this).attr("value", dateText);
    var readingRow = $(this).closest("tr");
    var btnSave = readingRow.find(".save-reading");
    btnSave.show("normal");
    checkDatePickers(readingRow);
  };

  inputDateFrom.datepicker("destroy");
  inputDateFrom.datepicker({
    dateFormat: 'yy-mm-dd',
    maxDate: dateTo,
    onSelect: onDateSelect,
  });

  inputDateTo.datepicker("destroy");
  inputDateTo.datepicker({
    dateFormat: 'yy-mm-dd',
    minDate: dateFrom,
    onSelect: onDateSelect,
  });
}

function onDeleteClick() {
  if (!confirm("Are you sure to delete the reading?")) return;

  disableViews(true);

  var row = $(this).closest("tr");
  var readingId = row.attr("reading-id");

  var isbn13 = $("#reading-dialog").attr("book-isbn13");

  $.ajax({
    url: '/bookshelf/' + isbn13 + "/delete/",
    data: { "reading-id": readingId },
    dataType: 'json',
    type: 'POST',
    beforeSend: function(xhr, settings) {
      if (!this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", Cookies.get('csrftoken'));
      }
    },
    success: function(response) {
      clearViews();

      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onSaveClick() {
  if (!confirm("Are you sure to update the reading?")) return;

  disableViews(true);

  var row = $(this).closest("tr");
  var readingId = row.attr("reading-id");
  var inputDateFrom = row.find(".reading-date-from");
  var inputDateTo = row.find(".reading-date-to");
  var dateFrom = inputDateFrom.attr("value");
  var dateTo = inputDateTo.attr("value");

  var isbn13 = $("#reading-dialog").attr("book-isbn13");

  $.ajax({
    url: '/bookshelf/' + isbn13 + "/update/",
    data: { "reading-id": readingId, "start-date": dateFrom, "end-date": dateTo },
    dataType: 'json',
    type: 'POST',
    beforeSend: function(xhr, settings) {
      if (!this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", Cookies.get('csrftoken'));
      }
    },
    success: function(response) {
      clearViews();

      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onReadingLinkClick() {
  clearViews();
  disableViews(true);
  updateBookRate(0);

  var isbn13 = $(this).attr("book-isbn13");
  var removeUrl = $(this).attr("remove-url");

  var readingDialog = $("#reading-dialog");
  readingDialog.attr("book-isbn13", isbn13);
  readingDialog.attr("remove-url", removeUrl);

  $.ajax({
    url: '/bookshelf/' + isbn13 + "/",
    dataType: 'json',
    success: function(response) {
      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.rate) {
        updateBookRate(response.rate);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onActionReadClick() {
  if (!confirm("Are you sure to start reading this book?")) return;

  disableViews(true);

  var isbn13 = $("#reading-dialog").attr("book-isbn13");

  $.ajax({
    url: '/bookshelf/' + isbn13 + '/read/',
    dataType: 'json',
    success: function(response) {
      clearViews();

      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onActionFinishClick() {
  if (!confirm("Are you sure to finish reading this book?")) return;

  disableViews(true);

  var isbn13 = $("#reading-dialog").attr("book-isbn13");

  $.ajax({
    url: '/bookshelf/' + isbn13 + '/finish/',
    dataType: 'json',
    success: function(response) {
      clearViews();

      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onActionAbandonClick() {
  if (!confirm("Are you sure to give up reading this book?")) return;

  disableViews(true);

  var isbn13 = $("#reading-dialog").attr("book-isbn13");

  $.ajax({
    url: '/bookshelf/' + isbn13 + '/abandon/',
    dataType: 'json',
    success: function(response) {
      clearViews();

      if (response.book) {
        var book = response.book;
        $("#reading-book-title").text(book.title);
      }
      if (response.readings) {
        updateReadingList(response.readings);
      }
      disableViews(false);
    }
  });
}

function onActionRemoveBookClick() {
  if (!confirm("Are you sure to remove this book from your bookshelf?")) return;

  var removeUrl = $("#reading-dialog").attr("remove-url");
  location.href = removeUrl
}

function onBookRateUnhover() {
  var rate = $("#book-rate").attr("data-book-rate");
  updateBookRate(rate);
}

function onBookRateStarHover() {
  var index = parseInt($(this).attr("data-index"));
  for (i = 1; i <= 5; i++) {
    var star = $("#star" + i);
    star.removeClass("active");
    star.text("star_border");
    if (i <= index) {
      $(star).addClass("active")
      star.text("star");
    }
  }
}

function onBookRateStarClick() {
  var rate = parseInt($(this).attr("data-index"));
  updateBookRate(rate);

  var isbn13 = $("#reading-dialog").attr("book-isbn13");
  $.ajax({
    url: '/bookshelf/' + isbn13 + "/rate/",
    data: { "rate": rate },
    dataType: 'json',
    type: 'POST',
    beforeSend: function(xhr, settings) {
      if (!this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", Cookies.get('csrftoken'));
      }
    },
    success: function(response) {
      if (response.rate) {
        updateBookRate(response.rate);
      }
    }
  });
}

$(document).ready(function() {
  $(".reading-link").click(onReadingLinkClick);
  $("#action-read").click(onActionReadClick);
  $("#action-finish").click(onActionFinishClick);
  $("#action-abandon").click(onActionAbandonClick);
  $("#action-remove-book").click(onActionRemoveBookClick);
  $("#book-rate").hover(function(){}, onBookRateUnhover);
  $(".dialog-book-rate-star").hover(onBookRateStarHover, function(){});
  $(".dialog-book-rate-star").click(onBookRateStarClick);
});
