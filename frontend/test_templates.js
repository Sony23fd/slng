fetch('https://slng-r1ew.onrender.com/api/templates')
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  });
