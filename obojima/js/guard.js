(function() {
    const activeUser = localStorage.getItem('gh_pages_user');
    const allowedFolder = activeUser;
    const currentPath = window.location.pathname;

    // 1. Is the user even logged in?
    if (!activeUser || !allowedFolder) {
        window.location.href = "/login";
        return;
    }

    // 2. Is the user trying to enter a folder that isn't theirs?
    // This checks if "/PRIVATE/SOMEONE_ELSE/" is in the URL
    if (currentPath.includes('/PRIVATE/') && !currentPath.includes(`/PRIVATE/${allowedFolder}/`)) {
        alert("Access Denied: This isn't your character!");
        window.location.href = "/login";
    }
})();