function onActionRemoveBookClick() {
  if (!confirm("Are you sure to remove this book from your bookshelf?")) return;

  var removeUrl = $("#detail-remove-book").attr("remove-url");
  console.log(removeUrl);
  location.href = removeUrl
}

function onActionAddBookClick() {
  if (!confirm("Are you sure to add this book to your bookshelf?")) return;

  var addUrl = $("#detail-add-book").attr("add-url");
  console.log(addUrl);
  location.href = addUrl
}

$(document).ready(function() {
  $("#detail-remove-book").click(onActionRemoveBookClick);
  $("#detail-add-book").click(onActionAddBookClick);
});