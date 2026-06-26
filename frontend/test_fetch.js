fetch('https://slng-r1ew.onrender.com/api/constants')
  .then(res => res.json())
  .then(data => {
    data.forEach(d => {
      if (['INNER_COLOR', 'COVER_COLOR'].includes(d.type)) {
        console.log(d.type, d.value, d.description);
      }
    });
  });
