function clearViews() {
    $("#reading-book-title").empty();
    $("#reading-progress").text("");
    $("#reading-list").empty();
}

function updateReadingList(isbn13, readings) {
    var actionFinish = $("#action-finish");
    var actionRead = $("#action-read");
    var actionAbandon = $("#action-abandon")

    actionFinish.attr("book-isbn13", isbn13)
    actionRead.attr("book-isbn13", isbn13)
    actionAbandon.attr("book-isbn13", isbn13)

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
        "R": "Reading",
        "F": "Finished",
        "A": "Abandoned"
    };

    for (var index in readings) {
        var reading = readings[index];
        var from = "<td><input class='form-control form-control-sm reading-date reading-date-from' type='text' readonly value='" + reading.start_date + "'></td>";
        var isEnded = reading.end_date != null;
        var to = "<td><input class='form-control form-control-sm reading-date reading-date-to' type='text' readonly " + (isEnded ? "" : "hidden ") + "value='" + (isEnded ? reading.end_date : "") + "'></td>";
        var progress = "<td class='align-middle'>" + statuses[reading.progress] + "</td>";
        var btnDelete = "<td><a class='btn btn-danger btn-sm delete-reading' href='#'>Delete</a></td>";
        var btnSave = "<td><a class='btn btn-primary btn-sm save-reading' href='#'>Save</a></td>";
        $("#reading-list").append("<tr reading-id='" + reading.id + "' book-isbn13='" + isbn13 + "'>" + from + " " + to + progress + btnDelete + btnSave + "</tr>");
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

    var row = $(this).closest("tr");
    var readingId = row.attr("reading-id");
    var isbn13 = row.attr("book-isbn13");

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
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

function onSaveClick() {
    var row = $(this).closest("tr");
    var readingId = row.attr("reading-id");
    var isbn13 = row.attr("book-isbn13");
    var inputDateFrom = row.find(".reading-date-from");
    var inputDateTo = row.find(".reading-date-to");
    var dateFrom = inputDateFrom.attr("value");
    var dateTo = inputDateTo.attr("value");

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
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

function onReadingLinkClick() {
    clearViews();

    var isbn13 = $(this).attr("book-isbn13");

    $.ajax({
        url: '/bookshelf/' + isbn13,
        dataType: 'json',
        success: function(response) {
            if (response.book) {
                var book = response.book;
                $("#reading-book-title").text(book.title);
            }
            if (response.readings) {
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

function onActionReadClick() {
    if (!confirm("Are you sure to start reading this book?")) return;

    var isbn13 = $(this).attr("book-isbn13");

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
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

function onActionFinishClick() {
    if (!confirm("Are you sure to finish reading this book?")) return;

    var isbn13 = $(this).attr("book-isbn13");

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
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

function onActionAbandonClick() {
    if (!confirm("Are you sure to give up reading this book?")) return;

    var isbn13 = $(this).attr("book-isbn13");

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
                updateReadingList(isbn13, response.readings);
            }
        }
    });
}

$(document).ready(function() {
    $(".reading-link").click(onReadingLinkClick);
    $("#action-read").click(onActionReadClick);
    $("#action-finish").click(onActionFinishClick);
    $("#action-abandon").click(onActionAbandonClick);
});
