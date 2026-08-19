// =====================================================
// GAME FRIENDS
// ADMIN PANEL
// admin.js
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update,
    push,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// Firebase
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAcRatG8t0HBhUVjIGYyey6OCAi14iNAos",

    authDomain:
        "game-friends-58035.firebaseapp.com",

    databaseURL:
        "https://game-friends-58035-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "game-friends-58035",

    storageBucket:
        "game-friends-58035.firebasestorage.app",

    messagingSenderId:
        "9895204528",

    appId:
        "1:9895204528:web:d0b0c23b401417c90acd75"

};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const database =
    getDatabase(app);


// =====================================================
// ADMIN UID
// =====================================================

const ADMIN_UIDS =
    new Set([

        "bxCzpVvfq7gKIKDHUlki3R0Lbyp1",

        "c59sCpa0siW5TBlkTG4oo5NYk6n1"

    ]);


const GM_UIDS =
    new Set();


// =====================================================
// Elements
// =====================================================

const panelUsername =
    document.getElementById("panelUsername");

const playerCount =
    document.getElementById("playerCount");

const playerOnlineCount =
    document.getElementById("playerOnlineCount");

const gmCount =
    document.getElementById("gmCount");

const gmOnlineCount =
    document.getElementById("gmOnlineCount");

const gmWalletBalance =
    document.getElementById("gmWalletBalance");

const gmWalletModalBalance =
    document.getElementById("gmWalletModalBalance");

const compensationCount =
    document.getElementById("compensationCount");

const transactionPreview =
    document.getElementById("transactionPreview");

const allTransactionsList =
    document.getElementById("allTransactionsList");

const playersList =
    document.getElementById("playersList");

const gmList =
    document.getElementById("gmList");

const playerDetailContent =
    document.getElementById("playerDetailContent");

const gmDetailContent =
    document.getElementById("gmDetailContent");


// =====================================================
// Modals
// =====================================================

const transactionsModal =
    document.getElementById("transactionsModal");

const compensationModal =
    document.getElementById("compensationModal");

const gmWalletModal =
    document.getElementById("gmWalletModal");

const playersModal =
    document.getElementById("playersModal");

const playerDetailModal =
    document.getElementById("playerDetailModal");

const gmModal =
    document.getElementById("gmModal");

const gmDetailModal =
    document.getElementById("gmDetailModal");

const announcementModal =
    document.getElementById("announcementModal");

const rewardModal =
    document.getElementById("rewardModal");

const notificationModal =
    document.getElementById("notificationModal");


// =====================================================
// GM WALLET
// =====================================================

const gmWalletForm =
    document.getElementById("gmWalletForm");

const gmWalletAmount =
    document.getElementById("gmWalletAmount");

const gmWalletReason =
    document.getElementById("gmWalletReason");

const gmWalletDepositBtn =
    document.getElementById("gmWalletDepositBtn");

const gmWalletWithdrawBtn =
    document.getElementById("gmWalletWithdrawBtn");


// =====================================================
// Reward
// =====================================================

const rewardForm =
    document.getElementById("rewardForm");

const rewardTarget =
    document.getElementById("rewardTarget");

const rewardAmount =
    document.getElementById("rewardAmount");

const rewardReason =
    document.getElementById("rewardReason");


// =====================================================
// Announcement
// =====================================================

const announcementForm =
    document.getElementById("announcementForm");

const announcementTitle =
    document.getElementById("announcementTitle");

const announcementMessage =
    document.getElementById("announcementMessage");


// =====================================================
// Notification
// =====================================================

const notificationList =
    document.getElementById("notificationList");


// =====================================================
// Role
// =====================================================

function getUserRole(uid) {

    if (ADMIN_UIDS.has(uid)) {
        return "Admin";
    }

    if (GM_UIDS.has(uid)) {
        return "GM";
    }

    return "Player";
}


// =====================================================
// Admin Check
// =====================================================

function isCurrentAdmin() {

    const user =
        auth.currentUser;

    return !!(
        user &&
        ADMIN_UIDS.has(user.uid)
    );
}


// =====================================================
// Open Modal
// =====================================================

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("show");
}


// =====================================================
// Close Modal
// =====================================================

function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
}


// =====================================================
// Close Buttons
// =====================================================

document
    .getElementById("closeTransactionsBtn")
    ?.addEventListener(
        "click",
        () => closeModal(transactionsModal)
    );


document
    .getElementById("closeCompensationBtn")
    ?.addEventListener(
        "click",
        () => closeModal(compensationModal)
    );


document
    .getElementById("closeGmWalletBtn")
    ?.addEventListener(
        "click",
        () => closeModal(gmWalletModal)
    );


document
    .getElementById("closePlayersBtn")
    ?.addEventListener(
        "click",
        () => closeModal(playersModal)
    );


document
    .getElementById("closePlayerDetailBtn")
    ?.addEventListener(
        "click",
        () => closeModal(playerDetailModal)
    );


document
    .getElementById("closeGmBtn")
    ?.addEventListener(
        "click",
        () => closeModal(gmModal)
    );


document
    .getElementById("closeGmDetailBtn")
    ?.addEventListener(
        "click",
        () => closeModal(gmDetailModal)
    );


document
    .getElementById("closeAnnouncementBtn")
    ?.addEventListener(
        "click",
        () => closeModal(announcementModal)
    );


document
    .getElementById("closeRewardBtn")
    ?.addEventListener(
        "click",
        () => closeModal(rewardModal)
    );


document
    .getElementById("closeNotificationBtn")
    ?.addEventListener(
        "click",
        () => closeModal(notificationModal)
    );


// =====================================================
// Close Admin
// =====================================================

document
    .getElementById("closeAdminBtn")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );


// =====================================================
// Close Modal Outside
// =====================================================

document
    .querySelectorAll(".admin-modal")
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(modal);

                    }

                }
            );

        }
    );


// =====================================================
// Format Date
// =====================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }

    const date =
        new Date(Number(timestamp));

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return (
        day +
        "/" +
        month +
        "/" +
        year +
        " " +
        hour +
        ":" +
        minute
    );
}


// =====================================================
// Safe Number
// =====================================================

function safeNumber(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return 0;
    }

    return number;
}


// =====================================================
// Transaction Element
// =====================================================

function createTransactionElement(
    transaction
) {

    const item =
        document.createElement("div");

    item.className =
        "admin-transaction";


    const left =
        document.createElement("div");

    left.className =
        "transaction-left";


    const title =
        document.createElement("div");

    title.className =
        "transaction-title";


    let titleText =
        "📋 Transaction";


    if (
        transaction.type ===
        "credit"
    ) {

        titleText =
            "🪙 เติม GM Wallet";

    }
    else if (
        transaction.type ===
        "debit"
    ) {

        titleText =
            "➖ ลบจาก GM Wallet";

    }
    else if (
        transaction.type ===
        "reward"
    ) {

        titleText =
            "🎁 Admin → Player";

    }
    else if (
        transaction.type ===
        "admin_to_gm"
    ) {

        titleText =
            "🎁 Admin → GM";

    }
    else if (
        transaction.type ===
        "admin_reward"
    ) {

        titleText =
            "👑 Admin → Admin";

    }
    else if (
        transaction.type ===
        "compensation"
    ) {

        titleText =
            "🎁 Compensation";

    }
    else if (
        transaction.type ===
        "transfer"
    ) {

        titleText =
            "🎁 GM → Player";

    }


    title.textContent =
        titleText;

    left.appendChild(title);


    if (
        transaction.actorName
    ) {

        const actor =
            document.createElement("div");

        actor.className =
            "transaction-detail";

        actor.textContent =
            "ผู้ดำเนินการ: " +
            transaction.actorName;

        left.appendChild(actor);

    }


    if (
        transaction.targetName
    ) {

        const target =
            document.createElement("div");

        target.className =
            "transaction-detail";

        target.textContent =
            "ผู้รับ: " +
            transaction.targetName;

        left.appendChild(target);

    }


    if (
        transaction.reason
    ) {

        const reason =
            document.createElement("div");

        reason.className =
            "transaction-detail";

        reason.textContent =
            "เหตุผล: " +
            transaction.reason;

        left.appendChild(reason);

    }


    const date =
        document.createElement("div");

    date.className =
        "transaction-date";

    date.textContent =
        formatDate(
            transaction.timestamp
        );

    left.appendChild(date);


    const amount =
        document.createElement("div");

    const number =
        safeNumber(
            transaction.amount
        );


    const negative =
        transaction.type === "debit" ||
        transaction.type === "reward" ||
        transaction.type === "admin_to_gm" ||
        transaction.type === "compensation";


    const prefix =
        negative
            ? "-"
            : "+";


    amount.className =
        "transaction-amount " +
        (
            negative
                ? "debit"
                : "credit"
        );


    amount.textContent =
        prefix +
        number.toLocaleString() +
        " 🪙";


    item.appendChild(left);

    item.appendChild(amount);

    return item;
}


// =====================================================
// Load GM Transactions
// =====================================================

async function loadGmTransactions() {

    if (!isCurrentAdmin()) {
        return [];
    }

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "gmWallet/transactions"
                )
            );


        if (!snapshot.exists()) {
            return [];
        }


        const data =
            snapshot.val();


        const transactions =
            Object.entries(data)
                .map(
                    ([id, transaction]) => ({
                        id,
                        ...transaction
                    })
                );


        transactions.sort(
            (a, b) =>
                safeNumber(b.timestamp) -
                safeNumber(a.timestamp)
        );


        return transactions;

    }
    catch (error) {

        console.error(
            "LOAD GM TRANSACTIONS ERROR:",
            error
        );

        return [];
    }
}


// =====================================================
// Render Transaction Preview
// =====================================================

async function renderTransactionPreview() {

    if (!transactionPreview) {
        return;
    }


    transactionPreview.innerHTML = "";


    const transactions =
        await loadGmTransactions();


    transactions
        .slice(0, 2)
        .forEach(
            transaction => {

                transactionPreview.appendChild(
                    createTransactionElement(
                        transaction
                    )
                );

            }
        );


    if (
        transactions.length === 0
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "admin-transaction-empty";

        empty.textContent =
            "ยังไม่มีรายการ Transaction";

        transactionPreview.appendChild(empty);

    }
}


// =====================================================
// Render All Transactions
// =====================================================

async function renderAllTransactions() {

    if (!allTransactionsList) {
        return;
    }


    allTransactionsList.innerHTML =
        `
        <div class="admin-empty">
            กำลังโหลด Transaction...
        </div>
        `;


    const transactions =
        await loadGmTransactions();


    allTransactionsList.innerHTML = "";


    transactions.forEach(
        transaction => {

            allTransactionsList.appendChild(
                createTransactionElement(
                    transaction
                )
            );

        }
    );


    if (
        transactions.length === 0
    ) {

        allTransactionsList.innerHTML =
            `
            <div class="admin-empty">
                ยังไม่มีรายการ Transaction
            </div>
            `;

    }
}


// =====================================================
// Load GM Members
// =====================================================

async function loadGmMembers() {

    GM_UIDS.clear();


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "gmMembers"
                )
            );


        if (!snapshot.exists()) {
            return {};
        }


        const data =
            snapshot.val();


        Object.entries(data)
            .forEach(
                ([uid, member]) => {

                    if (
                        member &&
                        member.role === "gm" &&
                        member.status === "active"
                    ) {

                        GM_UIDS.add(uid);

                    }

                }
            );


        return data;

    }
    catch (error) {

        console.error(
            "LOAD GM MEMBERS ERROR:",
            error
        );

        return {};
    }
}


// =====================================================
// Online Counts
// =====================================================

async function loadOnlineCounts() {

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "onlineUsers"
                )
            );


        let playersOnline = 0;

        let gmsOnline = 0;


        if (snapshot.exists()) {

            const onlineUsers =
                snapshot.val();


            Object.entries(onlineUsers)
                .forEach(
                    ([uid, data]) => {

                        if (!data) {
                            return;
                        }


                        if (
                            data.online === false
                        ) {
                            return;
                        }


                        if (
                            ADMIN_UIDS.has(uid)
                        ) {
                            return;
                        }


                        if (
                            GM_UIDS.has(uid) ||
                            data.role === "gm"
                        ) {

                            gmsOnline++;

                        }
                        else {

                            playersOnline++;

                        }

                    }
                );

        }


        if (playerOnlineCount) {

            playerOnlineCount.textContent =
                "Online " +
                playersOnline;

        }


        if (gmOnlineCount) {

            gmOnlineCount.textContent =
                "Online " +
                gmsOnline;

        }

    }
    catch (error) {

        console.error(
            "LOAD ONLINE COUNTS ERROR:",
            error
        );


        if (playerOnlineCount) {
            playerOnlineCount.textContent =
                "Online —";
        }

        if (gmOnlineCount) {
            gmOnlineCount.textContent =
                "Online —";
        }
    }
}


// =====================================================
// Load User Counter
// =====================================================

async function loadUserCounter() {

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "system/userCounter"
                )
            );


        if (!snapshot.exists()) {
            return 0;
        }


        return safeNumber(
            snapshot.val()
        );

    }
    catch (error) {

        console.error(
            "LOAD USER COUNTER ERROR:",
            error
        );

        return 0;
    }
}


// =====================================================
// Dashboard Counts
// =====================================================

async function loadDashboardCounts() {

    try {

        const totalUsers =
            await loadUserCounter();


        const gmMembers =
            await loadGmMembers();


        let totalGms = 0;


        Object.entries(gmMembers)
            .forEach(
                ([uid, data]) => {

                    if (
                        data &&
                        data.role === "gm" &&
                        data.status === "active"
                    ) {

                        totalGms++;

                    }

                }
            );


        const playerTotal =
            Math.max(
                0,
                totalUsers -
                ADMIN_UIDS.size -
                totalGms
            );


        if (playerCount) {
            playerCount.textContent =
                playerTotal;
        }


        if (gmCount) {
            gmCount.textContent =
                totalGms;
        }


        await loadOnlineCounts();

    }
    catch (error) {

        console.error(
            "LOAD DASHBOARD COUNTS ERROR:",
            error
        );
    }
}


// =====================================================
// Load GM Wallet
// =====================================================

async function loadGmWalletDetails() {

    if (!isCurrentAdmin()) {
        return 0;
    }


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "gmWallet"
                )
            );


        let coins = 0;


        if (snapshot.exists()) {

            const data =
                snapshot.val();

            coins =
                safeNumber(
                    data.coins
                );

        }


        if (gmWalletBalance) {

            gmWalletBalance.textContent =
                coins.toLocaleString();

        }


        if (gmWalletModalBalance) {

            gmWalletModalBalance.textContent =
                coins.toLocaleString() +
                " 🪙";

        }


        return coins;

    }
    catch (error) {

        console.error(
            "LOAD GM WALLET ERROR:",
            error
        );

        return 0;
    }
}


// =====================================================
// Create User List Item
// =====================================================

function createUserListItem(
    uid,
    data,
    type
) {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "user-list-item";


    const main =
        document.createElement("div");

    main.className =
        "user-main";


    const name =
        document.createElement("div");

    name.className =
        "user-name";

    name.textContent =
        data.displayName ||
        data.username ||
        "ไม่ทราบชื่อ";


    const id =
        document.createElement("div");

    id.className =
        "user-id";

    id.textContent =
        "UID: " +
        uid;


    main.appendChild(name);

    main.appendChild(id);


    const right =
        document.createElement("div");

    right.className =
        "user-right";


    const online =
        document.createElement("div");


    const isOnline =
        data.online === true;


    online.className =
        isOnline
            ? "user-online"
            : "user-offline";


    online.textContent =
        isOnline
            ? "Online"
            : "Offline";


    right.appendChild(online);


    button.appendChild(main);

    button.appendChild(right);


    button.addEventListener(
        "click",
        () => {

            if (type === "gm") {

                openGmDetails(
                    uid,
                    data
                );

            }
            else {

                openPlayerDetails(
                    uid,
                    data
                );

            }

        }
    );


    return button;
}


// =====================================================
// Load ALL Players
// =====================================================

async function loadAllPlayers() {

    if (!playersList) {
        return;
    }


    playersList.innerHTML =
        `
        <div class="admin-empty">
            กำลังโหลดรายชื่อผู้เล่น...
        </div>
        `;


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "users"
                )
            );


        if (!snapshot.exists()) {

            playersList.innerHTML =
                `
                <div class="admin-empty">
                    ไม่พบผู้เล่น
                </div>
                `;

            return;
        }


        const users =
            snapshot.val();


        const entries =
            Object.entries(users)
                .filter(
                    ([uid, data]) => {

                        if (
                            ADMIN_UIDS.has(uid)
                        ) {
                            return false;
                        }

                        if (
                            data &&
                            data.role === "gm"
                        ) {
                            return false;
                        }

                        return true;
                    }
                );


        entries.sort(
            (a, b) => {

                const nameA =
                    String(
                        a[1]?.displayName ||
                        a[1]?.username ||
                        ""
                    ).toLowerCase();


                const nameB =
                    String(
                        b[1]?.displayName ||
                        b[1]?.username ||
                        ""
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );
            }
        );


        playersList.innerHTML = "";


        const list =
            document.createElement("div");

        list.className =
            "user-list";


        entries.forEach(
            ([uid, data]) => {

                list.appendChild(
                    createUserListItem(
                        uid,
                        data || {},
                        "player"
                    )
                );

            }
        );


        playersList.appendChild(list);


        if (
            entries.length === 0
        ) {

            playersList.innerHTML =
                `
                <div class="admin-empty">
                    ไม่พบผู้เล่น
                </div>
                `;

        }

    }
    catch (error) {

        console.error(
            "LOAD ALL PLAYERS ERROR:",
            error
        );


        playersList.innerHTML =
            `
            <div class="admin-empty">
                โหลดรายชื่อผู้เล่นไม่สำเร็จ
            </div>
            `;
    }
}


// =====================================================
// Load ALL GM
// =====================================================

async function loadAllGm() {

    if (!gmList) {
        return;
    }


    gmList.innerHTML =
        `
        <div class="admin-empty">
            กำลังโหลดรายชื่อ GM...
        </div>
        `;


    try {

        await loadGmMembers();


        const snapshot =
            await get(
                ref(
                    database,
                    "users"
                )
            );


        if (!snapshot.exists()) {

            gmList.innerHTML =
                `
                <div class="admin-empty">
                    ไม่พบ GM
                </div>
                `;

            return;
        }


        const users =
            snapshot.val();


        const entries =
            Object.entries(users)
                .filter(
                    ([uid]) =>
                        GM_UIDS.has(uid)
                );


        entries.sort(
            (a, b) => {

                const nameA =
                    String(
                        a[1]?.displayName ||
                        a[1]?.username ||
                        ""
                    ).toLowerCase();


                const nameB =
                    String(
                        b[1]?.displayName ||
                        b[1]?.username ||
                        ""
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );
            }
        );


        gmList.innerHTML = "";


        const list =
            document.createElement("div");

        list.className =
            "user-list";


        entries.forEach(
            ([uid, data]) => {

                list.appendChild(
                    createUserListItem(
                        uid,
                        data || {},
                        "gm"
                    )
                );

            }
        );


        gmList.appendChild(list);


        if (
            entries.length === 0
        ) {

            gmList.innerHTML =
                `
                <div class="admin-empty">
                    ไม่พบ GM
                </div>
                `;

        }

    }
    catch (error) {

        console.error(
            "LOAD ALL GM ERROR:",
            error
        );


        gmList.innerHTML =
            `
            <div class="admin-empty">
                โหลดรายชื่อ GM ไม่สำเร็จ
            </div>
            `;
    }
}


// =====================================================
// Detail Row
// =====================================================

function addDetailRow(
    container,
    label,
    value
) {

    const row =
        document.createElement("div");

    row.className =
        "detail-row";


    const labelElement =
        document.createElement("div");

    labelElement.className =
        "detail-label";

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement("div");

    valueElement.className =
        "detail-value";

    valueElement.textContent =
        value ?? "-";


    row.appendChild(labelElement);

    row.appendChild(valueElement);

    container.appendChild(row);
}


// =====================================================
// Player Details
// =====================================================

function openPlayerDetails(
    uid,
    data
) {

    if (!playerDetailContent) {
        return;
    }


    playerDetailContent.innerHTML = "";


    const card =
        document.createElement("div");

    card.className =
        "detail-card";


    addDetailRow(
        card,
        "Display Name",
        data.displayName || "-"
    );


    addDetailRow(
        card,
        "Username",
        data.username || "-"
    );


    addDetailRow(
        card,
        "Friend ID",
        data.friendId ||
        data.memberId ||
        "-"
    );


    addDetailRow(
        card,
        "UID",
        uid
    );


    addDetailRow(
        card,
        "Coins",
        safeNumber(data.coins)
            .toLocaleString() +
        " 🪙"
    );


    addDetailRow(
        card,
        "สถานะ",
        data.online === true
            ? "Online"
            : "Offline"
    );


    addDetailRow(
        card,
        "วันที่สมัคร",
        formatDate(
            data.createdAt ||
            data.joinDate
        )
    );


    playerDetailContent.appendChild(card);

    openModal(playerDetailModal);
}


// =====================================================
// GM Details
// =====================================================

function openGmDetails(
    uid,
    data
) {

    if (!gmDetailContent) {
        return;
    }


    gmDetailContent.innerHTML = "";


    const card =
        document.createElement("div");

    card.className =
        "detail-card";


    addDetailRow(
        card,
        "Display Name",
        data.displayName || "-"
    );


    addDetailRow(
        card,
        "Username",
        data.username || "-"
    );


    addDetailRow(
        card,
        "Friend ID",
        data.friendId ||
        data.memberId ||
        "-"
    );


    addDetailRow(
        card,
        "UID",
        uid
    );


    addDetailRow(
        card,
        "Coins",
        safeNumber(data.coins)
            .toLocaleString() +
        " 🪙"
    );


    addDetailRow(
        card,
        "สถานะ",
        data.online === true
            ? "Online"
            : "Offline"
    );


    addDetailRow(
        card,
        "Role",
        "GM"
    );


    addDetailRow(
        card,
        "วันที่สมัคร",
        formatDate(
            data.createdAt ||
            data.joinDate
        )
    );


    gmDetailContent.appendChild(card);

    openModal(gmDetailModal);
}


// =====================================================
// Find User
// =====================================================

async function findUser(
    target
) {

    const search =
        String(
            target || ""
        ).trim()
        .toLowerCase();


    if (!search) {
        return null;
    }


    const usersSnapshot =
        await get(
            ref(
                database,
                "users"
            )
        );


    if (!usersSnapshot.exists()) {
        return null;
    }


    const users =
        usersSnapshot.val();


    for (
        const [uid, user] of
        Object.entries(users)
    ) {

        if (!user) {
            continue;
        }


        if (
            uid.toLowerCase() === search
        ) {

            return {
                uid,
                data: user
            };

        }


        if (
            String(
                user.username || ""
            ).toLowerCase() === search
        ) {

            return {
                uid,
                data: user
            };

        }


        if (
            String(
                user.displayName || ""
            ).toLowerCase() === search
        ) {

            return {
                uid,
                data: user
            };

        }


        if (
            String(
                user.friendId ||
                user.memberId ||
                ""
            ).toLowerCase() === search
        ) {

            return {
                uid,
                data: user
            };

        }

    }


    return null;
}


// =====================================================
// Set Button Loading
// =====================================================

function setButtonLoading(
    button,
    loading,
    normalText,
    loadingText
) {

    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? loadingText
            : normalText;
}


// =====================================================
// Change GM Wallet
// =====================================================

async function changeGmWallet(
    type
) {

    const user =
        auth.currentUser;


    if (
        !user ||
        !ADMIN_UIDS.has(user.uid)
    ) {

        alert(
            "คุณไม่มีสิทธิ์ Admin"
        );

        return;
    }


    const amount =
        safeNumber(
            gmWalletAmount?.value
        );


    if (
        !Number.isInteger(amount) ||
        amount <= 0
    ) {

        alert(
            "กรุณาระบุจำนวนเหรียญเป็นจำนวนเต็มมากกว่า 0"
        );

        return;
    }


    const reason =
        gmWalletReason?.value
            ?.trim();


    if (!reason) {

        alert(
            "กรุณาระบุเหตุผล"
        );

        return;
    }


    const button =
        type === "credit"
            ? gmWalletDepositBtn
            : gmWalletWithdrawBtn;


    setButtonLoading(
        button,
        true,
        type === "credit"
            ? "🪙 เติม"
            : "🪙 ลบ",
        type === "credit"
            ? "กำลังเติม..."
            : "กำลังลบ..."
    );


    try {

        const walletRef =
            ref(
                database,
                "gmWallet/coins"
            );


        const result =
            await runTransaction(
                walletRef,
                currentValue => {

                    const current =
                        safeNumber(
                            currentValue
                        );


                    if (
                        type === "debit"
                    ) {

                        if (
                            amount > current
                        ) {

                            return current;

                        }


                        return (
                            current -
                            amount
                        );

                    }


                    return (
                        current +
                        amount
                    );

                }
            );


        if (
            !result.committed
        ) {

            throw new Error(
                "ไม่สามารถเปลี่ยนยอด GM Wallet ได้"
            );

        }


        const newBalance =
            safeNumber(
                result.snapshot.val()
            );


        if (
            type === "debit" &&
            newBalance < 0
        ) {

            throw new Error(
                "GM Wallet มีเหรียญไม่เพียงพอ"
            );

        }


        const transactionRef =
            push(
                ref(
                    database,
                    "gmWallet/transactions"
                )
            );


        await set(
            transactionRef,
            {

                type,

                amount,

                reason,

                actorUid:
                    user.uid,

                actorName:
                    panelUsername?.textContent ||
                    "Admin",

                targetUid:
                    null,

                targetName:
                    null,

                timestamp:
                    Date.now()

            }
        );


        await loadGmWalletDetails();

        await renderTransactionPreview();


        if (gmWalletAmount) {
            gmWalletAmount.value = "";
        }


        if (gmWalletReason) {
            gmWalletReason.value = "";
        }


        alert(
            type === "credit"
                ? "เติมเหรียญสำเร็จ\n\n+" +
                  amount.toLocaleString() +
                  " 🪙"
                : "ลบเหรียญสำเร็จ\n\n-" +
                  amount.toLocaleString() +
                  " 🪙"
        );

    }
    catch (error) {

        console.error(
            "GM WALLET CHANGE ERROR:",
            error
        );


        alert(
            "ดำเนินการไม่สำเร็จ\n\n" +
            (
                error?.message ||
                "เกิดข้อผิดพลาด"
            )
        );

    }
    finally {

        if (gmWalletDepositBtn) {

            gmWalletDepositBtn.disabled =
                false;

            gmWalletDepositBtn.textContent =
                "🪙 เติม";

        }


        if (gmWalletWithdrawBtn) {

            gmWalletWithdrawBtn.disabled =
                false;

            gmWalletWithdrawBtn.textContent =
                "🪙 ลบ";

        }

    }
}


// =====================================================
// GM Wallet Buttons
// =====================================================

gmWalletDepositBtn
    ?.addEventListener(
        "click",
        () =>
            changeGmWallet("credit")
    );


gmWalletWithdrawBtn
    ?.addEventListener(
        "click",
        () =>
            changeGmWallet("debit")
    );


// =====================================================
// REWARD
// Admin → Player / GM / Admin
// Admin สามารถมอบให้ตัวเองได้
// GM → Player ใช้ระบบ GM แยก
// =====================================================

async function giveReward() {

    const user =
        auth.currentUser;


    if (
        !user ||
        !ADMIN_UIDS.has(user.uid)
    ) {

        alert(
            "คุณไม่มีสิทธิ์ Admin"
        );

        return;
    }


    const target =
        rewardTarget?.value
            ?.trim();


    const amount =
        safeNumber(
            rewardAmount?.value
        );


    const reason =
        rewardReason?.value
            ?.trim();


    if (!target) {

        alert(
            "กรุณาระบุ Friend ID / Username"
        );

        return;
    }


    if (
        !Number.isInteger(amount) ||
        amount <= 0
    ) {

        alert(
            "จำนวนเหรียญต้องเป็นจำนวนเต็มมากกว่า 0"
        );

        return;
    }


    if (!reason) {

        alert(
            "กรุณาระบุเหตุผล"
        );

        return;
    }


    const submitButton =
        rewardForm?.querySelector(
            "button[type='submit']"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "กำลังมอบเหรียญ...";

    }


    try {

        const found =
            await findUser(target);


        if (!found) {

            throw new Error(
                "ไม่พบผู้ใช้\nกรุณาตรวจสอบ Friend ID / Username / Display Name"
            );

        }


        const targetUid =
            found.uid;


        const targetData =
            found.data || {};


        const targetIsAdmin =
            ADMIN_UIDS.has(
                targetUid
            );


        const targetIsGM =
            GM_UIDS.has(
                targetUid
            ) ||
            targetData.role === "gm";


        console.log(
            "REWARD TARGET:",
            {
                target,
                targetUid,
                targetIsAdmin,
                targetIsGM,
                targetData
            }
        );


        // =================================================
        // ADMIN → ADMIN
        // ไม่หัก GM Wallet
        // =================================================

        if (targetIsAdmin) {

            const targetCoinsRef =
                ref(
                    database,
                    "users/" +
                    targetUid +
                    "/coins"
                );


            const result =
                await runTransaction(
                    targetCoinsRef,
                    currentValue =>
                        safeNumber(
                            currentValue
                        ) + amount
                );


            if (!result.committed) {

                throw new Error(
                    "เพิ่มเหรียญให้ Admin ไม่สำเร็จ"
                );

            }


            const transactionRef =
                push(
                    ref(
                        database,
                        "gmWallet/transactions"
                    )
                );


            await set(
                transactionRef,
                {

                    type:
                        "admin_reward",

                    amount,

                    reason,

                    actorUid:
                        user.uid,

                    actorName:
                        panelUsername?.textContent ||
                        "Admin",

                    targetUid,

                    targetName:
                        targetData.displayName ||
                        targetData.username ||
                        targetData.friendId ||
                        targetUid,

                    timestamp:
                        Date.now()

                }
            );


            const notificationRef =
                push(
                    ref(
                        database,
                        "notifications/" +
                        targetUid
                    )
                );


            await set(
                notificationRef,
                {

                    type:
                        "admin_reward",

                    title:
                        "👑 ได้รับเหรียญจาก Admin",

                    message:
                        "คุณได้รับ " +
                        amount.toLocaleString() +
                        " 🪙 จาก Admin\nเหตุผล: " +
                        reason,

                    amount,

                    reason,

                    read:
                        false,

                    createdAt:
                        Date.now(),

                    fromUid:
                        user.uid,

                    fromName:
                        panelUsername?.textContent ||
                        "Admin"

                }
            );


            await renderTransactionPreview();


            if (rewardTarget) {
                rewardTarget.value = "";
            }

            if (rewardAmount) {
                rewardAmount.value = "";
            }

            if (rewardReason) {
                rewardReason.value = "";
            }


            alert(
                "เพิ่มเหรียญให้ Admin สำเร็จ\n\n" +
                "ผู้รับ: " +
                (
                    targetData.displayName ||
                    targetData.username ||
                    targetData.friendId ||
                    targetUid
                ) +
                "\n+" +
                amount.toLocaleString() +
                " 🪙"
            );


            closeModal(
                rewardModal
            );


            return;
        }


        // =================================================
        // ADMIN → GM / PLAYER
        // ต้องหักจาก GM Wallet
        // =================================================

        const walletRef =
            ref(
                database,
                "gmWallet/coins"
            );


        // =================================================
        // อ่านยอดจริงจาก Firebase ก่อน
        //
        // จุดสำคัญ:
        // ไม่ใช้ค่าในหน้าจอ
        // ไม่ใช้ค่าเก่าในตัวแปร
        // =================================================

        const walletSnapshot =
            await get(
                walletRef
            );


        const walletBefore =
            walletSnapshot.exists()
                ? safeNumber(
                    walletSnapshot.val()
                )
                : 0;


        console.log(
            "GM WALLET BEFORE REWARD:",
            {
                walletBefore,
                amount,
                walletPath:
                    "gmWallet/coins"
            }
        );


        if (
            walletBefore < amount
        ) {

            throw new Error(
                "GM Wallet มีเหรียญไม่เพียงพอ\n\n" +
                "ยอดปัจจุบัน: " +
                walletBefore.toLocaleString() +
                " 🪙\n" +
                "ต้องการ: " +
                amount.toLocaleString() +
                " 🪙"
            );

        }


        // =================================================
        // หัก GM Wallet ด้วย Transaction
        //
        // IMPORTANT:
        // ห้าม return undefined เมื่อเงินไม่พอ
        // เพราะจะทำให้ Transaction ถูกยกเลิกทันที
        //
        // เราจะคืนค่าเดิม แล้วตรวจผลหลัง Transaction
        // =================================================

        const walletResult =
            await runTransaction(
                walletRef,
                currentValue => {

                    const current =
                        safeNumber(
                            currentValue
                        );


                    if (
                        current < amount
                    ) {

                        return current;

                    }


                    return (
                        current -
                        amount
                    );

                }
            );


        if (
            !walletResult.committed
        ) {

            throw new Error(
                "ไม่สามารถตัดเหรียญจาก GM Wallet ได้"
            );

        }


        const walletAfter =
            safeNumber(
                walletResult.snapshot.val()
            );


        const expectedWalletAfter =
            walletBefore -
            amount;


        console.log(
            "GM WALLET AFTER REWARD:",
            {
                walletBefore,
                amount,
                walletAfter,
                expectedWalletAfter
            }
        );


        // =================================================
        // ตรวจว่าหักได้ตามจำนวนจริงหรือไม่
        // =================================================

        if (
            walletAfter !==
            expectedWalletAfter
        ) {

            // =================================================
            // ป้องกันกรณี Transaction เจอข้อมูลเปลี่ยนระหว่างทาง
            // =================================================

            throw new Error(
                "ยอด GM Wallet เปลี่ยนแปลงระหว่างการมอบเหรียญ\n\n" +
                "กรุณาลองใหม่อีกครั้ง"
            );

        }


        // =================================================
        // เพิ่มเหรียญให้ GM / Player
        // =================================================

        const targetCoinsRef =
            ref(
                database,
                "users/" +
                targetUid +
                "/coins"
            );


        let targetCommitted =
            false;


        try {

            const targetResult =
                await runTransaction(
                    targetCoinsRef,
                    currentValue =>
                        safeNumber(
                            currentValue
                        ) + amount
                );


            targetCommitted =
                targetResult.committed;

        }
        catch (targetError) {

            console.error(
                "TARGET COINS TRANSACTION ERROR:",
                targetError
            );

            targetCommitted =
                false;

        }


        // =================================================
        // ถ้าเพิ่มเหรียญให้ผู้รับไม่สำเร็จ
        // คืนเหรียญกลับ GM Wallet
        // =================================================

        if (
            !targetCommitted
        ) {

            try {

                const refundResult =
                    await runTransaction(
                        walletRef,
                        currentValue =>
                            safeNumber(
                                currentValue
                            ) + amount
                    );


                if (
                    !refundResult.committed
                ) {

                    throw new Error(
                        "Refund Transaction ไม่สำเร็จ"
                    );

                }

            }
            catch (refundError) {

                console.error(
                    "GM WALLET REFUND ERROR:",
                    refundError
                );

                throw new Error(
                    "เพิ่มเหรียญให้ผู้รับไม่สำเร็จ และคืนเหรียญกลับ GM Wallet ไม่สำเร็จ\n\n" +
                    "กรุณาตรวจสอบ GM Wallet ทันที"
                );

            }


            throw new Error(
                "เพิ่มเหรียญให้ผู้รับไม่สำเร็จ\n\n" +
                "เหรียญถูกคืนกลับ GM Wallet แล้ว"
            );

        }


        // =================================================
        // Transaction
        // =================================================

        const transactionRef =
            push(
                ref(
                    database,
                    "gmWallet/transactions"
                )
            );


        await set(
            transactionRef,
            {

                type:
                    targetIsGM
                        ? "admin_to_gm"
                        : "reward",

                amount,

                reason,

                actorUid:
                    user.uid,

                actorName:
                    panelUsername?.textContent ||
                    "Admin",

                targetUid,

                targetName:
                    targetData.displayName ||
                    targetData.username ||
                    targetData.friendId ||
                    targetUid,

                timestamp:
                    Date.now()

            }
        );


        // =================================================
        // Notification
        // =================================================

        const notificationRef =
            push(
                ref(
                    database,
                    "notifications/" +
                    targetUid
                )
            );


        await set(
            notificationRef,
            {

                type:
                    "reward",

                title:
                    "🎁 ได้รับเหรียญ",

                message:
                    "คุณได้รับ " +
                    amount.toLocaleString() +
                    " 🪙\nเหตุผล: " +
                    reason,

                amount,

                reason,

                read:
                    false,

                createdAt:
                    Date.now(),

                fromUid:
                    user.uid,

                fromName:
                    panelUsername?.textContent ||
                    "Admin"

            }
        );


        // =================================================
        // Refresh
        // =================================================

        await loadGmWalletDetails();

        await renderTransactionPreview();


        // =================================================
        // Clear Form
        // =================================================

        if (rewardTarget) {
            rewardTarget.value = "";
        }

        if (rewardAmount) {
            rewardAmount.value = "";
        }

        if (rewardReason) {
            rewardReason.value = "";
        }


        // =================================================
        // Success
        // =================================================

        alert(
            "มอบเหรียญสำเร็จ\n\n" +
            "ผู้รับ: " +
            (
                targetData.displayName ||
                targetData.username ||
                targetData.friendId ||
                targetUid
            ) +
            "\n+" +
            amount.toLocaleString() +
            " 🪙" +
            "\n\nGM Wallet เหลือ " +
            walletAfter.toLocaleString() +
            " 🪙"
        );


        closeModal(
            rewardModal
        );

    }
    catch (error) {

        console.error(
            "GIVE REWARD ERROR:",
            error
        );


        alert(
            "มอบเหรียญไม่สำเร็จ\n\n" +
            (
                error?.message ||
                "เกิดข้อผิดพลาด"
            )
        );

    }
    finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "🎁 มอบรางวัล";

        }

    }
}


// =====================================================
// Reward Form
// =====================================================

rewardForm
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await giveReward();

        }
    );


// =====================================================
// ANNOUNCEMENT
// =====================================================

async function createAnnouncement() {

    const user =
        auth.currentUser;


    if (
        !user ||
        !ADMIN_UIDS.has(user.uid)
    ) {

        alert(
            "คุณไม่มีสิทธิ์ Admin"
        );

        return;
    }


    const title =
        announcementTitle?.value
            ?.trim();


    const message =
        announcementMessage?.value
            ?.trim();


    if (!title) {

        alert(
            "กรุณาระบุหัวข้อประกาศ"
        );

        return;
    }


    if (!message) {

        alert(
            "กรุณาระบุข้อความประกาศ"
        );

        return;
    }


    const submitButton =
        announcementForm?.querySelector(
            "button[type='submit']"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "กำลังสร้างประกาศ...";

    }


    try {

        const announcementRef =
            push(
                ref(
                    database,
                    "announcements"
                )
            );


        await set(
            announcementRef,
            {

                title,

                message,

                createdAt:
                    Date.now(),

                createdBy:
                    user.uid,

                createdByName:
                    panelUsername?.textContent ||
                    "Admin",

                active:
                    true

            }
        );


        if (announcementTitle) {
            announcementTitle.value = "";
        }

        if (announcementMessage) {
            announcementMessage.value = "";
        }


        alert(
            "สร้างประกาศสำเร็จ"
        );


        closeModal(announcementModal);

    }
    catch (error) {

        console.error(
            "CREATE ANNOUNCEMENT ERROR:",
            error
        );


        alert(
            "สร้างประกาศไม่สำเร็จ\n\n" +
            (
                error?.message ||
                "เกิดข้อผิดพลาด"
            )
        );

    }
    finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "📢 สร้างประกาศ";

        }

    }
}


// =====================================================
// Announcement Form
// =====================================================

announcementForm
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await createAnnouncement();

        }
    );


// =====================================================
// Load Notifications
// =====================================================

async function loadNotifications() {

    if (!notificationList) {
        return;
    }


    notificationList.innerHTML =
        `
        <div class="admin-empty">
            กำลังโหลด Notifications...
        </div>
        `;


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "notifications"
                )
            );


        notificationList.innerHTML = "";


        if (!snapshot.exists()) {

            notificationList.innerHTML =
                `
                <div class="admin-empty">
                    ยังไม่มี Notifications
                </div>
                `;

            return;
        }


        const all =
            snapshot.val();


        const items = [];


        Object.entries(all)
            .forEach(
                ([uid, userNotifications]) => {

                    if (!userNotifications) {
                        return;
                    }


                    Object.entries(
                        userNotifications
                    )
                    .forEach(
                        ([id, notification]) => {

                            items.push({

                                uid,

                                id,

                                ...notification

                            });

                        }
                    );

                }
            );


        items.sort(
            (a, b) =>
                safeNumber(b.createdAt) -
                safeNumber(a.createdAt)
        );


        items
            .slice(0, 100)
            .forEach(
                notification => {

                    const item =
                        document.createElement("div");

                    item.className =
                        "admin-transaction";


                    const left =
                        document.createElement("div");

                    left.className =
                        "transaction-left";


                    const title =
                        document.createElement("div");

                    title.className =
                        "transaction-title";

                    title.textContent =
                        notification.title ||
                        "🔔 Notification";


                    const message =
                        document.createElement("div");

                    message.className =
                        "transaction-detail";

                    message.textContent =
                        notification.message ||
                        "-";


                    const date =
                        document.createElement("div");

                    date.className =
                        "transaction-date";

                    date.textContent =
                        formatDate(
                            notification.createdAt
                        );


                    left.appendChild(title);

                    left.appendChild(message);

                    left.appendChild(date);


                    item.appendChild(left);


                    notificationList.appendChild(item);

                }
            );


    }
    catch (error) {

        console.error(
            "LOAD NOTIFICATIONS ERROR:",
            error
        );


        notificationList.innerHTML =
            `
            <div class="admin-empty">
                โหลด Notifications ไม่สำเร็จ
            </div>
            `;
    }
}


// =====================================================
// Compensation Count
// =====================================================

async function loadCompensationCount() {

    if (!compensationCount) {
        return;
    }


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "compensations"
                )
            );


        let count = 0;


        if (snapshot.exists()) {

            const data =
                snapshot.val();


            Object.values(data)
                .forEach(
                    compensation => {

                        if (
                            compensation &&
                            compensation.active === true
                        ) {

                            count++;

                        }

                    }
                );

        }


        compensationCount.textContent =
            count;

    }
    catch (error) {

        console.error(
            "LOAD COMPENSATION COUNT ERROR:",
            error
        );

        compensationCount.textContent =
            "—";
    }
}


// =====================================================
// Compensation Modal
// =====================================================

document
    .getElementById("compensationCard")
    ?.addEventListener(
        "click",
        async () => {

            await loadCompensationCount();

            openModal(
                compensationModal
            );

        }
    );


// =====================================================
// Players Card
// =====================================================

document
    .getElementById("playersCard")
    ?.addEventListener(
        "click",
        async () => {

            openModal(playersModal);

            await loadAllPlayers();

        }
    );


// =====================================================
// GM Card
// =====================================================

document
    .getElementById("gmCard")
    ?.addEventListener(
        "click",
        async () => {

            openModal(gmModal);

            await loadAllGm();

        }
    );


// =====================================================
// GM Wallet Card
// =====================================================

document
    .getElementById("gmWalletCard")
    ?.addEventListener(
        "click",
        async () => {

            await loadGmWalletDetails();

            openModal(gmWalletModal);

        }
    );


// =====================================================
// Transactions
// =====================================================

document
    .getElementById("viewAllTransactionsBtn")
    ?.addEventListener(
        "click",
        async () => {

            openModal(
                transactionsModal
            );

            await renderAllTransactions();

        }
    );


// =====================================================
// Announcement Button
// =====================================================

document
    .getElementById("announcementBtn")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                announcementModal
            );

        }
    );


// =====================================================
// Reward Button
// =====================================================

document
    .getElementById("rewardBtn")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                rewardModal
            );

        }
    );


// =====================================================
// Notification Button
// =====================================================

document
    .getElementById("notificationBtn")
    ?.addEventListener(
        "click",
        async () => {

            openModal(
                notificationModal
            );

            await loadNotifications();

        }
    );


// =====================================================
// Load Dashboard
// =====================================================

async function loadDashboard(user) {

    if (
        !user ||
        !ADMIN_UIDS.has(user.uid)
    ) {

        return;
    }


    await loadDashboardCounts();

    await loadGmWalletDetails();

    await loadCompensationCount();

    await renderTransactionPreview();

}


// =====================================================
// ADMIN AUTH CHECK
// =====================================================

async function startAdminAuth() {

    try {

        await setPersistence(
            auth,
            browserLocalPersistence
        );


        console.log(
            "ADMIN AUTH: Persistence = LOCAL"
        );


        onAuthStateChanged(
            auth,
            async user => {

                console.log(
                    "ADMIN AUTH STATE:",
                    user
                        ? user.uid
                        : "ไม่มี Firebase User"
                );


                if (!user) {

                    if (panelUsername) {

                        panelUsername.textContent =
                            "ยังไม่ได้ Login";

                    }

                    return;
                }


                if (
                    !ADMIN_UIDS.has(
                        user.uid
                    )
                ) {

                    if (panelUsername) {

                        panelUsername.textContent =
                            "ไม่มีสิทธิ์ Admin";

                    }


                    console.warn(
                        "ADMIN AUTH: User ไม่ใช่ Admin",
                        user.uid
                    );

                    return;
                }


                // =================================================
                // Load GM Members
                // =================================================

                await loadGmMembers();


                // =================================================
                // Load Admin Profile
                // =================================================

                try {

                    const snapshot =
                        await get(
                            ref(
                                database,
                                "users/" +
                                user.uid
                            )
                        );


                    if (
                        snapshot.exists()
                    ) {

                        const data =
                            snapshot.val();


                        if (panelUsername) {

                            panelUsername.textContent =
                                data.displayName ||
                                data.username ||
                                "Admin";

                        }

                    }
                    else {

                        if (panelUsername) {

                            panelUsername.textContent =
                                "Admin";

                        }

                    }

                }
                catch (error) {

                    console.error(
                        "LOAD ADMIN PROFILE ERROR:",
                        error
                    );


                    if (panelUsername) {

                        panelUsername.textContent =
                            "Admin";

                    }

                }


                // =================================================
                // Dashboard
                // =================================================

                await loadDashboard(user);

            }
        );

    }
    catch (error) {

        console.error(
            "ADMIN AUTH INITIALIZATION ERROR:",
            error
        );


        if (panelUsername) {

            panelUsername.textContent =
                "Auth Error";

        }

    }
}


// =====================================================
// START ADMIN AUTH
// =====================================================

startAdminAuth();