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
        const id = tableBody.getAttribute("data-submission-id");
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

            const row1 = elems.children[6];
            const row2 = elems.children[7];
            if (row2 === undefined) return;
            let difficultyUrl = "https://open.kattis.com/problems";
            let author = "No author";
            let source = "No source";
            if (row1.children[0].innerText.trim() === "Author") {
                author = row1.children[1].innerText.trim();
            }
            if (row1.children[0].innerText.trim() === "Source") {
                source = row1.children[1].innerText.trim();
            }
            if (row2.children[0].innerText.trim() === "Source") {
                source = row2.children[1].innerText.trim();
            }

            const difficultyPromise = findDifficulty(problem, problemUrl, difficultyUrl);
            difficultyPromise.then((result) => {
                const [difficulty, ratio] = result;
                
                const fileTable = document.getElementsByClassName("file_source-content-file")[0];
                const problemId = problemUrl.split("/").pop();
                const submissionName = fileTable.firstElementChild.innerHTML.trim();
                const fileExtension = "." + submissionName.split(".")[1];
                const cm = comments[language];

                const lines = document.getElementsByClassName("ace_line");
                let codeStr = `${cm} ***${problem} Solution***\n`;
                codeStr += `${cm} Difficulty: ${difficulty}\n`;
                codeStr += `${cm} Time Limit: ${tle}, Memory Limit: ${memory}\n`;
                codeStr += `${cm} Acceptance: ${ratio}\n`;
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
                    if (d && d.submission_data) {
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
                        new_data = submission_data;
                    }
                    commit(url, data.access_token, body);
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

async function findDifficulty(problemName, problemUrl, sourceUrl) {
    const parser = new DOMParser();
    let difficulty = null;
    let ratio = null;
    let lower = 0;
    let upper = 34;

    // binary search
    while (!difficulty) {
        let mid = Math.floor((lower + upper) / 2);

        const response = await fetch(sourceUrl + `?page=${mid}`);
        const res = await response.text();
        
        const page = parser.parseFromString(res, "text/html");

        const table_body = page.getElementsByTagName("tbody")[0];
        if (table_body.children.length === 0) {
            difficulty = "1.0";
            ratio = "50%";
        }

        let isSmaller = true;
        for (const problem_row of table_body.children) {
            if (problem_row.firstElementChild.firstElementChild.href === problemUrl) {
                difficulty = problem_row.children[7].firstElementChild.innerHTML.split(" ")[0];
                ratio = problem_row.children[6].innerHTML.trim();
            } else if (problem_row.firstElementChild.firstElementChild.innerText.localeCompare(problemName) === -1) {
                isSmaller = false;
            }
        }

        if (!difficulty) {
            if (isSmaller) {
                upper = mid - 1;
            } else {
                lower = mid + 1;
            }
        }
    }

    return [difficulty, ratio];
}