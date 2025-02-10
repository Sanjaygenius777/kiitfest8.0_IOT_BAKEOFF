document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        alert("Tab switching is not allowed!");
        // You can also redirect or log the event
    }
});