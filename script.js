const themeButton =
    document.getElementById("themeButton");

themeButton.addEventListener(
    "click",
    function () {
        document.body.classList.toggle("night");

        if (
            document.body.classList.contains("night")
        ) {
            themeButton.textContent = "🌅";
        } else {
            themeButton.textContent = "🌙";
        }
    }
);


const starsContainer =
    document.getElementById("stars");

for (let i = 0; i < 80; i++) {
    const star =
        document.createElement("div");

    star.className = "star";

    star.style.left =
        Math.random() * 100 + "%";

    star.style.top =
        Math.random() * 100 + "%";

    star.style.animationDelay =
        Math.random() * 3 + "s";

    starsContainer.appendChild(star);
}


const addEntryButton =
    document.getElementById("addEntryButton");

const entryForm =
    document.getElementById("entryForm");

const entryMiniTitle =
    document.getElementById("entryMiniTitle");

const entryTitle =
    document.getElementById("entryTitle");

const entryText =
    document.getElementById("entryText");

const saveEntryButton =
    document.getElementById("saveEntryButton");

const cancelEntryButton =
    document.getElementById("cancelEntryButton");

const userEntries =
    document.getElementById("userEntries");


function getEntries() {
    return JSON.parse(
        localStorage.getItem(
            "laviDiaryEntries"
        )
    ) || [];
}


function saveEntries(entries) {
    localStorage.setItem(
        "laviDiaryEntries",
        JSON.stringify(entries)
    );
}


function getNextEntryNumber() {
    const entries =
        getEntries();

    if (entries.length === 0) {
        return 6;
    }

    const numbers =
        entries
            .map(function (entry) {
                return Number(entry.number);
            })
            .filter(function (number) {
                return !isNaN(number);
            });

    if (numbers.length === 0) {
        return 6;
    }

    return Math.max(...numbers) + 1;
}


function createEntryElement(entry) {
    const article =
        document.createElement("article");

    article.className =
        "diary-entry";


    const date =
        document.createElement("p");

    date.className =
        "date";

    date.textContent =
        "Entry No. " +
        entry.number +
        " · " +
        entry.miniTitle;


    const title =
        document.createElement("h3");

    title.textContent =
        entry.title;


    const content =
        document.createElement("p");

    content.textContent =
        entry.text;


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-entry";

    deleteButton.textContent =
        "delete this entry";


    deleteButton.addEventListener(
        "click",
        function () {
            deleteEntry(entry.id);
        }
    );


    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(content);
    article.appendChild(deleteButton);

    return article;
}


function displayEntries() {
    userEntries.innerHTML = "";

    const entries =
        getEntries();

    entries.sort(
        function (a, b) {
            return (
                Number(a.number) -
                Number(b.number)
            );
        }
    );

    entries.forEach(
        function (entry) {
            userEntries.appendChild(
                createEntryElement(entry)
            );
        }
    );
}


function deleteEntry(id) {
    let entries =
        getEntries();

    entries =
        entries.filter(
            function (entry) {
                return entry.id !== id;
            }
        );

    saveEntries(entries);

    displayEntries();
}


addEntryButton.addEventListener(
    "click",
    function () {
        entryForm.classList.add("show");

        entryMiniTitle.focus();
    }
);


cancelEntryButton.addEventListener(
    "click",
    function () {
        entryForm.classList.remove("show");

        entryMiniTitle.value = "";
        entryTitle.value = "";
        entryText.value = "";
    }
);


saveEntryButton.addEventListener(
    "click",
    function () {
        const miniTitle =
            entryMiniTitle.value.trim();

        const title =
            entryTitle.value.trim();

        const text =
            entryText.value.trim();


        if (
            miniTitle === "" ||
            title === "" ||
            text === ""
        ) {
            alert(
                "Please fill in the mini title, title, and contents."
            );

            return;
        }


        const newEntry = {
            id: Date.now(),

            number:
                getNextEntryNumber(),

            miniTitle:
                miniTitle,

            title:
                title,

            text:
                text
        };


        const entries =
            getEntries();

        entries.push(newEntry);

        saveEntries(entries);

        displayEntries();


        entryMiniTitle.value = "";
        entryTitle.value = "";
        entryText.value = "";

        entryForm.classList.remove("show");
    }
);


displayEntries();


const lettersContainer =
    document.getElementById(
        "lettersContainer"
    );

const letterEditor =
    document.getElementById(
        "letterEditor"
    );

const letterText =
    document.getElementById(
        "letterText"
    );

const newLetterButton =
    document.getElementById(
        "newLetterButton"
    );

const saveLetterButton =
    document.getElementById(
        "saveLetterButton"
    );

const cancelLetterButton =
    document.getElementById(
        "cancelLetterButton"
    );


let editingLetterId = null;


function getLetters() {
    return JSON.parse(
        localStorage.getItem(
            "laviLoveLetters"
        )
    ) || [];
}


function saveLetters(letters) {
    localStorage.setItem(
        "laviLoveLetters",
        JSON.stringify(letters)
    );
}


function createLetterElement(
    letter,
    number
) {
    const article =
        document.createElement("div");

    article.className =
        "saved-letter";


    const title =
        document.createElement("h2");

    title.textContent =
        "Letter No. " + number;


    const content =
        document.createElement("div");

    content.className =
        "letter-display";


    const lines =
        letter.text.split(/\r?\n/);


    lines.forEach(
        function (line, index) {
            content.appendChild(
                document.createTextNode(line)
            );

            if (
                index <
                lines.length - 1
            ) {
                content.appendChild(
                    document.createElement("br")
                );
            }
        }
    );


    const actions =
        document.createElement("div");

    actions.className =
        "saved-letter-actions";


    const editButton =
        document.createElement("button");

    editButton.className =
        "edit-letter-button";

    editButton.textContent =
        "Edit Letter";


    editButton.addEventListener(
        "click",
        function () {
            editingLetterId =
                letter.id;

            letterText.value =
                letter.text;

            letterEditor.classList.add(
                "show"
            );

            newLetterButton.style.display =
                "none";

            letterText.focus();
        }
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-letter-button";

    deleteButton.textContent =
        "Delete Letter";


    deleteButton.addEventListener(
        "click",
        function () {
            let letters =
                getLetters();

            letters =
                letters.filter(
                    function (item) {
                        return (
                            item.id !==
                            letter.id
                        );
                    }
                );

            saveLetters(letters);

            displayLetters();
        }
    );


    actions.appendChild(
        editButton
    );

    actions.appendChild(
        deleteButton
    );


    article.appendChild(title);
    article.appendChild(content);
    article.appendChild(actions);

    return article;
}


function displayLetters() {
    lettersContainer.innerHTML = "";

    const letters =
        getLetters();

    letters.forEach(
        function (letter, index) {
            lettersContainer.appendChild(
                createLetterElement(
                    letter,
                    index + 1
                )
            );
        }
    );
}


newLetterButton.addEventListener(
    "click",
    function () {
        editingLetterId = null;

        letterText.value = "";

        letterEditor.classList.add(
            "show"
        );

        newLetterButton.style.display =
            "none";

        letterText.focus();
    }
);


saveLetterButton.addEventListener(
    "click",
    function () {
        const text =
            letterText.value.trim();


        if (text === "") {
            alert(
                "Please write something before saving."
            );

            return;
        }


        const letters =
            getLetters();


        if (
            editingLetterId !== null
        ) {
            const letter =
                letters.find(
                    function (item) {
                        return (
                            item.id ===
                            editingLetterId
                        );
                    }
                );


            if (letter) {
                letter.text =
                    text;
            }

        } else {
            letters.push({
                id: Date.now(),
                text: text
            });
        }


        saveLetters(letters);

        displayLetters();

        letterText.value = "";

        letterEditor.classList.remove(
            "show"
        );

        newLetterButton.style.display =
            "inline-block";

        editingLetterId = null;
    }
);


cancelLetterButton.addEventListener(
    "click",
    function () {
        letterText.value = "";

        letterEditor.classList.remove(
            "show"
        );

        newLetterButton.style.display =
            "inline-block";

        editingLetterId = null;
    }
);


displayLetters();
