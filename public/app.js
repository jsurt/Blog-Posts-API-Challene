function postData(searchTerm, callback) {
  const settings = {
    url: '/blog-posts',
    data: {
      q: `${searchTerm} in:name`,
      per_page: 5
    },
    dataType: 'json',
    type: 'POST',
    success: callback
  };

  $.ajax(settings);
}