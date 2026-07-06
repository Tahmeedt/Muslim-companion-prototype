fetch("/api")
    .then(res => res.json())
    .then(data => {
        document.getElementById("status").innerText =
            data.status;

        document.getElementById("time").innerText =
            new Date(data.time).toLocaleString();
    });