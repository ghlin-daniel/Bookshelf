function onTabClick() {

  $(".tab-content").hide();
  $(".tab-btn").removeClass("active");
  $(this).addClass("active");

  var tabContentId = $(this).attr("data-tab-content-id");
  $(tabContentId).show();

  if ($(this).attr("id") == "tab-btn-my-readings") {
    loadAllReadings();
  }
}

function loadAllReadings() {
  $("#my-readings-list").empty();

  $.ajax({
    url: '/bookshelf/readings/',
    dataType: 'json',
    success: function(response) {
      if (response.readings) {
        updateMyReadingsList(response.readings);
      }
    }
  });
}

function updateMyReadingsList(readings) {
  var statuses = {
    "R": "<span class='oi oi-play-circle'></span>",
    "F": "<span class='oi oi-circle-check'></span>",
    "A": "<span class='oi oi-circle-x'></span>"
  };

  for (var index in readings) {
    var reading = readings[index];
    var title = "<td class='my-readings-list-column'>" + reading.book_title + "</td>";
    var from = "<td class='my-readings-list-column align-middle my-readings-list-column-center'>" + reading.start_date + "</td>";
    var isEnded = reading.end_date != null;
    var to = "<td class='my-readings-list-column align-middle my-readings-list-column-center'>" + (isEnded ? reading.end_date : "") + "</td>";
    var progress = "<td class='my-readings-list-column align-middle my-readings-list-column-center'>" + statuses[reading.progress] + "</td>";
    $("#my-readings-list").append("<tr>" + title + from + to + progress + "</tr>");
  }
}

$(document).ready(function() {
  $(".tab-btn").click(onTabClick);
  $(".tab-btn-default").trigger("click");
});