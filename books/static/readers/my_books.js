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
        var from = "<td>" + reading.start_datetime.split("T")[0] + "</td>";
        var isEnded = reading.end_datetime != null;
        var to = "<td>" + (isEnded ? reading.end_datetime.split("T")[0] : "") + "</td>";
        var progress = "<td>" + statuses[reading.progress] + "</td>";
        var btnDelete = "<a class='btn btn-danger btn-sm delete-reading' reading-id='" + reading.id + "' book-isbn13='" + isbn13 + "' href='#'>Delete</a>";
        $("#reading-list").append("<tr id='reading_" + index + "'>" + from + " " + to + progress + "<td>" + btnDelete + "</tr>");
    }

    $(".delete-reading").click(onDeleteClick);
}

function onDeleteClick() {
    if (!confirm("Are you sure to delete the reading?")) return;

    var readingId = $(this).attr("reading-id");
    var isbn13 = $(this).attr("book-isbn13");

    $.ajax({
        url: '/bookshelf/' + isbn13 + "/" + readingId + "/delete",
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
