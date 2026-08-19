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
    update,
    increment,
    push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// Firebase
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyAcRatG8t0HBhUVjIGYyey6OCAi14iNAos",

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
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        app
    );


const database =
    getDatabase(
        app
    );


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
    document.getElementById(
        "panelUsername"
    );


const playerCount =
    document.getElementById(
        "playerCount"
    );


const playerOnlineCount =
    document.getElementById(
        "playerOnlineCount"
    );


const gmCount =
    document.getElementById(
        "gmCount"
    );


const gmOnlineCount =
    document.getElementById(
        "gmOnlineCount"
    );


const gmWalletBalance =
    document.getElementById(
        "gmWalletBalance"
    );


const gmWalletModalBalance =
    document.getElementById(
        "gmWalletModalBalance"
    );


const compensationCount =
    document.getElementById(
        "compensationCount"
    );


const transactionPreview =
    document.getElementById(
        "transactionPreview"
    );


const allTransactionsList =
    document.getElementById(
        "allTransactionsList"
    );


const playersList =
    document.getElementById(
        "playersList"
    );


const gmList =
    document.getElementById(
        "gmList"
    );


const playerDetailContent =
    document.getElementById(
        "playerDetailContent"
    );


const gmDetailContent =
    document.getElementById(
        "gmDetailContent"
    );


// =====================================================
// Modals
// =====================================================

const transactionsModal =
    document.getElementById(
        "transactionsModal"
    );


const compensationModal =
    document.getElementById(
        "compensationModal"
    );


const gmWalletModal =
    document.getElementById(
        "gmWalletModal"
    );


const playersModal =
    document.getElementById(
        "playersModal"
    );


const playerDetailModal =
    document.getElementById(
        "playerDetailModal"
    );


const gmModal =
    document.getElementById(
        "gmModal"
    );


const gmDetailModal =
    document.getElementById(
        "gmDetailModal"
    );


const announcementModal =
    document.getElementById(
        "announcementModal"
    );


const rewardModal =
    document.getElementById(
        "rewardModal"
    );


const notificationModal =
    document.getElementById(
        "notificationModal"
    );


// =====================================================
// GM WALLET FORM
// =====================================================

const gmWalletForm =
    document.getElementById(
        "gmWalletForm"
    );


const gmWalletAmount =
    document.getElementById(
        "gmWalletAmount"
    );


const gmWalletReason =
    document.getElementById(
        "gmWalletReason"
    );


const gmWalletDepositBtn =
    document.getElementById(
        "gmWalletDepositBtn"
    );


const gmWalletWithdrawBtn =
    document.getElementById(
        "gmWalletWithdrawBtn"
    );


// =====================================================
// Role
// =====================================================

function getUserRole(uid) {

    if (
        ADMIN_UIDS.has(uid)
    ) {

        return "Admin";

    }


    if (
        GM_UIDS.has(uid)
    ) {

        return "GM";

    }


    return "Player";

}


// =====================================================
// Open Modal
// =====================================================

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "show"
    );

}


// =====================================================
// Close Modal
// =====================================================

function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

}


// =====================================================
// Close Buttons
// =====================================================

document
    .getElementById("closeTransactionsBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            transactionsModal
        )
    );


document
    .getElementById("closeCompensationBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            compensationModal
        )
    );


document
    .getElementById("closeGmWalletBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            gmWalletModal
        )
    );


document
    .getElementById("closePlayersBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            playersModal
        )
    );


document
    .getElementById("closePlayerDetailBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            playerDetailModal
        )
    );


document
    .getElementById("closeGmBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            gmModal
        )
    );


document
    .getElementById("closeGmDetailBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            gmDetailModal
        )
    );


document
    .getElementById("closeAnnouncementBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            announcementModal
        )
    );


document
    .getElementById("closeRewardBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            rewardModal
        )
    );


document
    .getElementById("closeNotificationBtn")
    ?.addEventListener(
        "click",
        () => closeModal(
            notificationModal
        )
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

                        closeModal(
                            modal
                        );

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
        new Date(
            timestamp
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const year =
        date.getFullYear();

    const hour =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minute =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

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
// Transaction Element
// =====================================================

function createTransactionElement(
    transaction,
    full = false
) {

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "admin-transaction";


    const left =
        document.createElement(
            "div"
        );

    left.className =
        "transaction-left";


    const title =
        document.createElement(
            "div"
        );

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
        "transfer"
    ) {

        titleText =
            "🎁 GM → Player";

    }


    title.textContent =
        titleText;


    left.appendChild(
        title
    );


    if (
        transaction.actorName
    ) {

        const actor =
            document.createElement(
                "div"
            );

        actor.className =
            "transaction-detail";

        actor.textContent =
            "ผู้ดำเนินการ: " +
            transaction.actorName;

        left.appendChild(
            actor
        );

    }


    if (
        transaction.targetName
    ) {

        const target =
            document.createElement(
                "div"
            );

        target.className =
            "transaction-detail";

        target.textContent =
            "ผู้รับ: " +
            transaction.targetName;

        left.appendChild(
            target
        );

    }


    if (
        transaction.reason
    ) {

        const reason =
            document.createElement(
                "div"
            );

        reason.className =
            "transaction-detail";

        reason.textContent =
            "เหตุผล: " +
            transaction.reason;

        left.appendChild(
            reason
        );

    }


    const date =
        document.createElement(
            "div"
        );

    date.className =
        "transaction-date";

    date.textContent =
        formatDate(
            transaction.timestamp
        );

    left.appendChild(
        date
    );


    const amount =
        document.createElement(
            "div"
        );


    const number =
        Number(
            transaction.amount || 0
        );


    let prefix =
        "+";


    if (
        transaction.type ===
        "debit"
    ) {

        prefix =
            "-";

    }


    amount.className =
        "transaction-amount " +
        (
            prefix === "+"
                ? "credit"
                : "debit"
        );


    amount.textContent =
        prefix +
        number.toLocaleString() +
        " 🪙";


    item.appendChild(
        left
    );

    item.appendChild(
        amount
    );


    return item;

}


// =====================================================
// Load GM Transactions
// =====================================================

async function loadGmTransactions() {

    const user =
        auth.currentUser;


    if (!user) {
        return [];
    }


    if (
        !ADMIN_UIDS.has(
            user.uid
        )
    ) {

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
                    ([id, transaction]) => {

                        return {
                            id,
                            ...transaction
                        };

                    }
                );


        transactions.sort(
            (a, b) =>
                Number(
                    b.timestamp || 0
                ) -
                Number(
                    a.timestamp || 0
                )
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


    transactionPreview.innerHTML =
        "";


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
            document.createElement(
                "div"
            );

        empty.className =
            "admin-transaction-empty";

        empty.textContent =
            "ยังไม่มีรายการ Transaction";

        transactionPreview.appendChild(
            empty
        );

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
        "";


    const transactions =
        await loadGmTransactions();


    transactions.forEach(
        transaction => {

            allTransactionsList.appendChild(
                createTransactionElement(
                    transaction,
                    true
                )
            );

        }
    );


    if (
        transactions.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "admin-empty";

        empty.textContent =
            "ยังไม่มีรายการ Transaction";

        allTransactionsList.appendChild(
            empty
        );

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


        if (
            !snapshot.exists()
        ) {

            return {};

        }


        const data =
            snapshot.val();


        Object.entries(
            data
        ).forEach(
            ([uid, member]) => {

                if (
                    member &&
                    member.role === "gm" &&
                    member.status === "active"
                ) {

                    GM_UIDS.add(
                        uid
                    );

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
// Online Users
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


        if (
            snapshot.exists()
        ) {

            const onlineUsers =
                snapshot.val();


            Object.entries(
                onlineUsers
            ).forEach(
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
                        ADMIN_UIDS.has(
                            uid
                        )
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


        if (
            snapshot.exists()
        ) {

            return Number(
                snapshot.val()
            ) || 0;

        }


        return 0;

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
// Dashboard Player / GM Count
// =====================================================

async function loadDashboardCounts() {

    try {

        const totalUsers =
            await loadUserCounter();


        const gmMembers =
            await loadGmMembers();


        let totalGms = 0;


        Object.entries(
            gmMembers
        ).forEach(
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

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "gmWallet"
                )
            );


        let coins = 0;


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            coins =
                Number(
                    data.coins || 0
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

    }
    catch (error) {

        console.error(
            "LOAD GM WALLET ERROR:",
            error
        );

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
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "user-list-item";


    const main =
        document.createElement(
            "div"
        );

    main.className =
        "user-main";


    const name =
        document.createElement(
            "div"
        );

    name.className =
        "user-name";


    name.textContent =
        data.displayName ||
        data.username ||
        "ไม่ทราบชื่อ";


    const id =
        document.createElement(
            "div"
        );

    id.className =
        "user-id";


    id.textContent =
        "UID: " +
        uid;


    main.appendChild(
        name
    );

    main.appendChild(
        id
    );


    const right =
        document.createElement(
            "div"
        );

    right.className =
        "user-right";


    const online =
        document.createElement(
            "div"
        );


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


    right.appendChild(
        online
    );


    button.appendChild(
        main
    );

    button.appendChild(
        right
    );


    button.addEventListener(
        "click",
        () => {

            if (
                type === "gm"
            ) {

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


        if (
            !snapshot.exists()
        ) {

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
            Object.entries(
                users
            )
            .filter(
                ([uid, data]) => {

                    if (
                        ADMIN_UIDS.has(
                            uid
                        )
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


        playersList.innerHTML =
            "";


        const list =
            document.createElement(
                "div"
            );


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


        playersList.appendChild(
            list
        );


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


        if (
            !snapshot.exists()
        ) {

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
            Object.entries(
                users
            )
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


        gmList.innerHTML =
            "";


        const list =
            document.createElement(
                "div"
            );


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


        gmList.appendChild(
            list
        );


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
// Detail Helper
// =====================================================

function addDetailRow(
    container,
    label,
    value
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "detail-row";


    const labelElement =
        document.createElement(
            "div"
        );

    labelElement.className =
        "detail-label";

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "div"
        );

    valueElement.className =
        "detail-value";

    valueElement.textContent =
        value ?? "-";


    row.appendChild(
        labelElement
    );

    row.appendChild(
        valueElement
    );


    container.appendChild(
        row
    );

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


    playerDetailContent.innerHTML =
        "";


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "detail-card";


    addDetailRow(
        card,
        "Display Name",
        data.displayName ||
        "-"
    );


    addDetailRow(
        card,
        "Username",
        data.username ||
        "-"
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
        Number(
            data.coins || 0
        ).toLocaleString() +
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


    playerDetailContent.appendChild(
        card
    );


    openModal(
        playerDetailModal
    );

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


    gmDetailContent.innerHTML =
        "";


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "detail-card";


    addDetailRow(
        card,
        "Display Name",
        data.displayName ||
        "-"
    );


    addDetailRow(
        card,
        "Username",
        data.username ||
        "-"
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
        Number(
            data.coins || 0
        ).toLocaleString() +
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


    gmDetailContent.appendChild(
        card
    );


    openModal(
        gmDetailModal
    );

}


// =====================================================
// Players Card
// =====================================================

document
    .getElementById("playersCard")
    ?.addEventListener(
        "click",
        async () => {

            openModal(
                playersModal
            );


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

            openModal(
                gmModal
            );


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

            openModal(
                gmWalletModal
            );

        }
    );


// =====================================================
// Compensation Card
// =====================================================

document
    .getElementById("compensationCard")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                compensationModal
            );

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

            await renderAllTransactions();

            openModal(
                transactionsModal
            );

        }
    );


// =====================================================
// Announcement
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
// Reward
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
// Notifications
// =====================================================

document
    .getElementById("notificationBtn")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                notificationModal
            );

        }
    );


// =====================================================
// GM WALLET - ADD / REMOVE COINS
// =====================================================

async function changeGmWallet(
    type
) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "กรุณา Login ก่อน"
        );

        return;

    }


    if (
        !ADMIN_UIDS.has(
            user.uid
        )
    ) {

        alert(
            "คุณไม่มีสิทธิ์ Admin"
        );

        return;

    }


    const amount =
        Number(
            gmWalletAmount?.value
        );


    if (
        !Number.isInteger(
            amount
        ) ||
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


    if (button) {

        button.disabled =
            true;

        button.textContent =
            type === "credit"
                ? "กำลังเติม..."
                : "กำลังลบ...";

    }


    try {

        // =================================================
        // อ่านยอดปัจจุบัน
        // =================================================

        const walletSnapshot =
            await get(
                ref(
                    database,
                    "gmWallet"
                )
            );


        let currentCoins = 0;


        if (
            walletSnapshot.exists()
        ) {

            const walletData =
                walletSnapshot.val();


            currentCoins =
                Number(
                    walletData.coins || 0
                );

        }


        // =================================================
        // ตรวจสอบก่อนลบ
        // =================================================

        if (
            type === "debit" &&
            amount > currentCoins
        ) {

            alert(
                "เหรียญใน GM Wallet ไม่เพียงพอ\n\n" +
                "ยอดปัจจุบัน: " +
                currentCoins.toLocaleString() +
                " 🪙"
            );

            return;

        }


        // =================================================
        // คำนวณยอดใหม่
        // =================================================

        const newCoins =
            type === "credit"
                ? currentCoins + amount
                : currentCoins - amount;


        // =================================================
        // Transaction ID
        // =================================================

        const transactionRef =
            push(
                ref(
                    database,
                    "gmWallet/transactions"
                )
            );


        const transactionId =
            transactionRef.key;


        const updates = {};


        // =================================================
        // อัปเดตยอด GM Wallet
        // =================================================

        updates[
            "gmWallet/coins"
        ] =
            newCoins;


        // =================================================
        // บันทึก Transaction
        // =================================================

        updates[
            "gmWallet/transactions/" +
            transactionId
        ] = {

            type:
                type,

            amount:
                amount,

            reason:
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

        };


        // =================================================
        // เขียน Firebase
        // =================================================

        await update(
            ref(database),
            updates
        );


        // =================================================
        // Refresh
        // =================================================

        await loadGmWalletDetails();


        await renderTransactionPreview();


        // =================================================
        // ล้างช่อง
        // =================================================

        if (gmWalletAmount) {

            gmWalletAmount.value =
                "";

        }


        if (gmWalletReason) {

            gmWalletReason.value =
                "";

        }


        // =================================================
        // Success
        // =================================================

        if (
            type === "credit"
        ) {

            alert(
                "เติมเหรียญสำเร็จ\n\n+" +
                amount.toLocaleString() +
                " 🪙"
            );

        }
        else {

            alert(
                "ลบเหรียญสำเร็จ\n\n-" +
                amount.toLocaleString() +
                " 🪙"
            );

        }

    }
    catch (error) {

        console.error(
            "GM WALLET CHANGE ERROR:",
            error
        );


        alert(
            (
                type === "credit"
                    ? "เติมเหรียญไม่สำเร็จ"
                    : "ลบเหรียญไม่สำเร็จ"
            ) +
            "\n\n" +
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
// GM WALLET - ADD BUTTON
// =====================================================

gmWalletDepositBtn
    ?.addEventListener(
        "click",
        async () => {

            await changeGmWallet(
                "credit"
            );

        }
    );


// =====================================================
// GM WALLET - REMOVE BUTTON
// =====================================================

gmWalletWithdrawBtn
    ?.addEventListener(
        "click",
        async () => {

            await changeGmWallet(
                "debit"
            );

        }
    );


// =====================================================
// Announcement
// =====================================================

document
    .getElementById("announcementForm")
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            alert(
                "ระบบประกาศจะเชื่อมต่อ Firebase ในขั้นตอนถัดไป"
            );

        }
    );


// =====================================================
// Reward
// =====================================================

document
    .getElementById("rewardForm")
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            alert(
                "ระบบมอบรางวัลจะเชื่อมต่อ Firebase ในขั้นตอนถัดไป"
            );

        }
    );


// =====================================================
// Load Dashboard
// =====================================================

async function loadDashboard(user) {

    if (!user) {
        return;
    }


    if (
        !ADMIN_UIDS.has(
            user.uid
        )
    ) {

        return;

    }


    await loadDashboardCounts();


    await loadGmWalletDetails();


    if (compensationCount) {

        compensationCount.textContent =
            "0";

    }


    await renderTransactionPreview();

}


// =====================================================
// ADMIN AUTH CHECK
// =====================================================
//
// สำคัญ:
// ตั้ง Firebase Auth Persistence เป็น LOCAL
// เพื่อให้ Session ที่ Login จาก index.html
// สามารถถูกกู้คืนเมื่อเปิด admin.html
//
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

                await loadDashboard(
                    user
                );

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