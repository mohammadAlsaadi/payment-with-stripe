document.getElementById("myButton").addEventListener("click", function () {
  console.log("Payment submitted!");
  fetch("http://localhost:3000/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 1 },
      ],
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      else {
        return res.json().then((json) => Promise.reject(json));
      }
    })
    .then(({ url }) => {
      window.location.href = url; // Redirect the user to the provided URL
      console.log(url);
    })
    .catch((e) => {
      console.error(e.error);
    });
});
