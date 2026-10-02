const SUPABASE_URL =
    "https://mnflfhttasfqoucwfdvp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_e61Uw7D1_ARVP7KgvVo8cw_k21C22OW";

const SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
};

const themeButton =
    document.getElementById("themeButton");

if (themeButton) {
    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("night");

        themeButton.textContent =
            document.body.classList.contains("night")
                ? "🌅"
                : "🌙";
    });
}

const starsContainer =
    document.getElementById("stars");

if (starsContainer) {
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

async function getCloudEntries() {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/diary_entries?select=*&order=number.asc",
            {
                headers: SUPABASE_HEADERS
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not load diary entries."
        );
    }

    return await response.json();
}

async function saveCloudEntry(entry) {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/diary_entries",
            {
                method: "POST",
                headers: {
                    ...SUPABASE_HEADERS,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    number: entry.number,
                    mini_title: entry.miniTitle,
                    title: entry.title,
                    content: entry.text
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not save diary entry."
        );
    }

    return await response.json();
}

async function deleteCloudEntry(id) {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/diary_entries?id=eq." +
            encodeURIComponent(id),
            {
                method: "DELETE",
                headers: SUPABASE_HEADERS
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not delete diary entry."
        );
    }
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
        entry.mini_title;

    const title =
        document.createElement("h3");

    title.textContent =
        entry.title;

    const content =
        document.createElement("p");

    content.textContent =
        entry.content;

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-entry";

    deleteButton.textContent =
        "delete this entry";

    deleteButton.addEventListener(
        "click",
        async function () {
            const confirmed =
                confirm(
                    "Delete this entry?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await deleteCloudEntry(
                    entry.id
                );

                await displayEntries();

            } catch (error) {
                alert(
                    "Something went wrong while deleting the entry."
                );
            }
        }
    );

    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(content);
    article.appendChild(deleteButton);

    return article;
}

async function displayEntries() {
    if (!userEntries) {
        return;
    }

    try {
        const entries =
            await getCloudEntries();

        userEntries.innerHTML = "";

        entries.forEach(
            function (entry) {
                userEntries.appendChild(
                    createEntryElement(entry)
                );
            }
        );

    } catch (error) {
        console.error(error);
    }
}

async function migrateOldEntries() {
    const oldEntries =
        JSON.parse(
            localStorage.getItem(
                "laviDiaryEntries"
            )
        ) || [];

    const alreadyMigrated =
        localStorage.getItem(
            "laviDiaryEntriesMigrated"
        );

    if (
        alreadyMigrated === "true" ||
        oldEntries.length === 0
    ) {
        return;
    }

    const cloudEntries =
        await getCloudEntries();

    for (
        const entry of oldEntries
    ) {
        const alreadyExists =
            cloudEntries.some(
                function (cloudEntry) {
                    return (
                        Number(cloudEntry.number) ===
                        Number(entry.number)
                    );
                }
            );

        if (!alreadyExists) {
            await saveCloudEntry(entry);
        }
    }

    localStorage.setItem(
        "laviDiaryEntriesMigrated",
        "true"
    );
}

if (addEntryButton) {
    addEntryButton.addEventListener(
        "click",
        function () {
            entryForm.classList.add("show");

            if (entryMiniTitle) {
                entryMiniTitle.focus();
            }
        }
    );
}

if (cancelEntryButton) {
    cancelEntryButton.addEventListener(
        "click",
        function () {
            entryMiniTitle.value = "";
            entryTitle.value = "";
            entryText.value = "";

            entryForm.classList.remove(
                "show"
            );
        }
    );
}

if (saveEntryButton) {
    saveEntryButton.addEventListener(
        "click",
        async function () {
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

            saveEntryButton.disabled = true;
            saveEntryButton.textContent =
                "Saving...";

            try {
                const entries =
                    await getCloudEntries();

                const numbers =
                    entries
                        .map(
                            function (entry) {
                                return Number(
                                    entry.number
                                );
                            }
                        )
                        .filter(
                            function (number) {
                                return !isNaN(number);
                            }
                        );

                const nextNumber =
                    numbers.length === 0
                        ? 6
                        : Math.max(
                            5,
                            ...numbers
                        ) + 1;

                await saveCloudEntry({
                    number: nextNumber,
                    miniTitle: miniTitle,
                    title: title,
                    text: text
                });

                entryMiniTitle.value = "";
                entryTitle.value = "";
                entryText.value = "";

                entryForm.classList.remove(
                    "show"
                );

                await displayEntries();

                alert(
                    "Entry No. " +
                    nextNumber +
                    " saved."
                );

            } catch (error) {
                console.error(error);

                alert(
                    "The entry could not be saved. Please try again."
                );

            } finally {
                saveEntryButton.disabled = false;
                saveEntryButton.textContent =
                    "Save";
            }
        }
    );
}

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

async function getCloudLetters() {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/love_letters?select=*&order=created_at.asc",
            {
                headers: SUPABASE_HEADERS
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not load letters."
        );
    }

    return await response.json();
}

async function saveCloudLetter(text) {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/love_letters",
            {
                method: "POST",
                headers: {
                    ...SUPABASE_HEADERS,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    content: text
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not save letter."
        );
    }

    return await response.json();
}

async function updateCloudLetter(
    id,
    text
) {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/love_letters?id=eq." +
            encodeURIComponent(id),
            {
                method: "PATCH",
                headers: {
                    ...SUPABASE_HEADERS,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    content: text
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not update letter."
        );
    }
}

async function deleteCloudLetter(id) {
    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/love_letters?id=eq." +
            encodeURIComponent(id),
            {
                method: "DELETE",
                headers: SUPABASE_HEADERS
            }
        );

    if (!response.ok) {
        throw new Error(
            "Could not delete letter."
        );
    }
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
        "Letter No. " +
        number;

    const content =
        document.createElement("div");

    content.className =
        "letter-display";

    const lines =
        letter.content.split(
            /\r?\n/
        );

    lines.forEach(
        function (line, index) {
            content.appendChild(
                document.createTextNode(
                    line
                )
            );

            if (
                index <
                lines.length - 1
            ) {
                content.appendChild(
                    document.createElement(
                        "br"
                    )
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
                letter.content;

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
        async function () {
            const confirmed =
                confirm(
                    "Delete this letter?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await deleteCloudLetter(
                    letter.id
                );

                await displayLetters();

            } catch (error) {
                alert(
                    "Something went wrong while deleting the letter."
                );
            }
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

async function displayLetters() {
    if (!lettersContainer) {
        return;
    }

    try {
        const letters =
            await getCloudLetters();

        lettersContainer.innerHTML = "";

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

    } catch (error) {
        console.error(error);
    }
}

async function migrateOldLetters() {
    const oldLetters =
        JSON.parse(
            localStorage.getItem(
                "laviLoveLetters"
            )
        ) || [];

    const alreadyMigrated =
        localStorage.getItem(
            "laviLoveLettersMigrated"
        );

    if (
        alreadyMigrated === "true" ||
        oldLetters.length === 0
    ) {
        return;
    }

    const cloudLetters =
        await getCloudLetters();

    for (
        const letter of oldLetters
    ) {
        const alreadyExists =
            cloudLetters.some(
                function (cloudLetter) {
                    return (
                        cloudLetter.content ===
                        letter.text
                    );
                }
            );

        if (!alreadyExists) {
            await saveCloudLetter(
                letter.text
            );
        }
    }

    localStorage.setItem(
        "laviLoveLettersMigrated",
        "true"
    );
}

if (newLetterButton) {
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
}

if (saveLetterButton) {
    saveLetterButton.addEventListener(
        "click",
        async function () {
            const text =
                letterText.value.trim();

            if (text === "") {
                alert(
                    "Please write something before saving."
                );

                return;
            }

            saveLetterButton.disabled =
                true;

            saveLetterButton.textContent =
                "Saving...";

            try {
                if (
                    editingLetterId !== null
                ) {
                    await updateCloudLetter(
                        editingLetterId,
                        text
                    );
                } else {
                    await saveCloudLetter(
                        text
                    );
                }

                letterText.value = "";

                letterEditor.classList.remove(
                    "show"
                );

                newLetterButton.style.display =
                    "inline-block";

                editingLetterId = null;

                await displayLetters();

            } catch (error) {
                console.error(error);

                alert(
                    "The letter could not be saved. Please try again."
                );

            } finally {
                saveLetterButton.disabled =
                    false;

                saveLetterButton.textContent =
                    "Save";
            }
        }
    );
}

if (cancelLetterButton) {
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
}

async function startWebsite() {
    try {
        await migrateOldEntries();
        await migrateOldLetters();

        await displayEntries();
        await displayLetters();

    } catch (error) {
        console.error(
            "Website startup error:",
            error
        );

        await displayEntries();
        await displayLetters();
    }
}

startWebsite();
