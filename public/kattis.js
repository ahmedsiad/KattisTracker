const comments = {
    "Python 3": "#",
    "Python 2": "#",
    "C++": "//",
    "C": "//",
    "C#": "//",
    "COBOL": "*>",
    "F#": "///",
    "Go": "//",
    "Haskell": "--",
    "Java": "//",
    "Node.js": "//",
    "SpiderMonkey": "//",
    "Kotlin": "//",
    "Common Lisp": ";",
    "Objective-C": "//",
    "OCaml": "**",
    "Pascal": "//",
    "PHP": "//",
    "Prolog": "%",
    "Ruby": "#",
    "Rust": "//"
};

const intervalId = setInterval(pollStatus, 2000);

setTimeout(() => {
    clearInterval(intervalId);
}, 20000);

function pollStatus() {
    const judgeTable = document.getElementById("judge_table");
    const tableBody = judgeTable.getElementsByTagName("tbody")[0].firstElementChild;
    const statusText = tableBody.children[3].innerText;
    if (statusText.startsWith("Accepted")) {
        const id = tableBody.children[0].innerText;
        const timestamp = tableBody.children[1].innerText;
        const problem = tableBody.children[2].innerText;
        const problemUrl = tableBody.children[2].firstElementChild.href;
        const cpu = tableBody.children[4].innerText;
        const language = tableBody.children[5].innerText;
        
        const timeStr = timestamp.split(" ");
        if (timeStr.length === 1) {
            upload(id, problem, problemUrl, cpu, language);
        }
    }
}


function upload(id, problem, problemUrl, cpu, language) {
    clearInterval(intervalId);
    chrome.storage.local.get(["repo_name", "access_token"], (data) => {

        fetch(problemUrl).then((response) => {
            return response.text();
        }).then((res) => {
            const parser = new DOMParser();
            const page = parser.parseFromString(res, "text/html");
            
            const elems = page.getElementsByClassName("attribute_list-book")[0];
            
            const tle = elems.children[0].lastElementChild.innerHTML.trim();
            const memory = elems.children[1].lastElementChild.innerHTML.trim();
            const difficulty = elems.children[2].lastElementChild.firstElementChild.innerHTML.trim();

            const authorElem = elems.children[3];
            const authorExists = authorElem.children[0].innerText.trim() !== "Source";
            console.log(authorElem.children[0].innerText.trim());
            const author = (authorExists) ? authorElem.children[1].innerText.trim() : "No author";
            const source = (authorExists) ? elems.children[4].children[1].innerText.trim() : authorElem.children[1].innerText.trim();

            const fileTable = document.getElementsByClassName("file_source-content-file")[0];
            const problemId = problemUrl.split("/").pop();
            const submissionName = fileTable.firstElementChild.innerHTML.trim();
            const fileExtension = "." + submissionName.split(".")[1];
            const cm = comments[language];

            const lines = document.getElementsByClassName("ace_line");
            let codeStr = `${cm} ***${problem} Solution***\n`;
            codeStr += `${cm} Difficulty: ${difficulty}\n`;
            codeStr += `${cm} Time Limit: ${tle}, Memory Limit: ${memory}\n`;
            codeStr += `${cm} CPU Time: ${cpu}\n`;
            codeStr += `${cm} Author: ${author}\n`;
            codeStr += `${cm} Source: ${source}\n`;
            codeStr += `${cm} Link: ${problemUrl}\n\n\n`;

            for (let line of lines) {
                codeStr += line.innerText;
            }
            let url = `https://api.github.com/repos/${data.repo_name}/contents/${problemId}/${problemId + fileExtension}`;
            let body = {
                message: `"${problem}", Difficulty: ${difficulty}, comitted via Kattis Tracker`,
                content: btoa(unescape(encodeURIComponent(codeStr)))
            };

            chrome.storage.local.get("submission_data", (d) => {
                let new_data = [];
                if (d.submission_data) {
                    const submission_data = JSON.parse(d.submission_data).data;
                    const same_problems = submission_data.filter((sub) => sub.problem_id === problemId);
                    if (same_problems.length > 0) {
                        if (parseInt(same_problems[0].submission_id) < parseInt(id)) {
                            commit(url, data.access_token, body);
                            same_problems[0].submission_id = id;
                            const obj = { data: submission_data };
                            chrome.storage.local.set({submission_data: JSON.stringify(obj)});
                        }
                        return;
                    }
                    commit(url, data.access_token, body);
                    new_data = submission_data;
                }
                const new_sub = {
                    submission_id: id,
                    problem_id: problemId,
                    problem_name: problem,
                    timestamp: Date.now(),
                    language: language,
                    difficulty: parseFloat(difficulty)
                };
                new_data.push(new_sub);
                const obj = { data: new_data };

                chrome.storage.local.set({submission_data: JSON.stringify(obj)});
            });

        });
    });
}

function commit(url, token, body) {
    fetch(url, {
        method: "GET",
        headers: { Authorization: `token ${token}` }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("File doesn't exist.");
    }).then((result) => {
        body["sha"] = result.sha;
        sendPost(url, token, body);
    }).catch((error) => {
        sendPost(url, token, body);
    });
}

function sendPost(url, token, body) {
    fetch(url, {
        method: "PUT",
        headers: { Authorization: `token ${token}`, accept: "application/vnd.github.v3+json"},
        body: JSON.stringify(body)
    }).then((response) => {
        return response.json();
    }).then((res) => {
        console.log(res);
    });
}

function checkTimestamp(timestamp) {
    const spl = timestamp.split(":");

    const current = Date.now() + 3600 * 2000;
    const time = new Date(current);
    const hoursNow = time.getUTCHours();
    const minsNow = time.getUTCMinutes();
    const secsNow = time.getUTCSeconds();
    const hours = parseInt(spl[0]);
    const mins = parseInt(spl[1]);
    const secs = parseInt(spl[2]);

    const timeNow = hoursNow * 3600 + minsNow * 60 + secsNow;
    const timeBefore = hours * 3600 + mins * 60 + secs;
    console.log(timeNow, timeBefore);
    if (timeNow - 60 < timeBefore) return true;
    return false;
}