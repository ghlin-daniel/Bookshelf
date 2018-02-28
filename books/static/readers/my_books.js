$(document).ready(function() {
    $(".reading-link").click(function() {
        var isbn13 = $(this).attr("book-isbn13");

        $("#reading-book-title").empty();
        $("#reading-list").empty();

        $.ajax({
            url: '/bookshelf/' + isbn13,
            dataType: 'json',
            success: function (response) {
                if (response.book) {
                    var book = response.book;
                    $("#reading-book-title").text(book.title);
                }
                if (response.readings) {
                    var readings = response.readings;
                    for (var index in readings) {
                        var from = "Start: <input id='reading-date' type='text' value='" + readings[index].start_date + "'>";
                        var to = "End: <input id='reading-date' type='text' value='" + readings[index].end_date + "'>";
                        $("#reading-list").append("<tr><td>" + from + " " + to + "</td></tr>");
                    }
                }
            }
        });
    });
});