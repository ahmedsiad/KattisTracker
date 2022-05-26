const SECRETS = {
    client_id: "5e5df0d6da9ae0a3e442",
    client_secret: "2829e4dec34a55b5a4a2d8d340ecbb2b4e997cbc"
};


const link = window.location.href;

chrome.storage.local.get("sent_github", (data) => {
    if (data && data.sent_github) {
        let idx = link.indexOf("code");
        const code = link.substring(idx + 5).trim();
        
        const url = `https://github.com/login/oauth/access_token?client_id=${SECRETS.client_id}&client_secret=${SECRETS.client_secret}&code=${code}`;

        fetch(url, {
            method: "POST",
            headers: { accept: "application/json" }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            const access_token = data.access_token;
            const sync = new Date();

            chrome.storage.local.set({ access_token: access_token }, () => {
                alert("Your account has been successfully authorized! Kattis Tracker will now track your Kattis solutions.");
            });
            chrome.storage.local.set({ last_sync: sync });
        });

        chrome.storage.local.set({ sent_github: false });
    }
});