const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * SePay Webhook - Xử lý thanh toán tự động
 * URL: https://us-central1-nuoidev.cloudfunctions.net/sepayWebhook
 * 
 * SePay sẽ gửi POST request khi có tiền vào tài khoản
 * Format: { gateway, transactionDate, accountNumber, code, content, transferType, 
 *           transferAmount, accumulated, subAccount, referenceCode, description }
 */
exports.sepayWebhook = functions.https.onRequest(async (req, res) => {
    // Chỉ chấp nhận POST
    if (req.method !== "POST") {
        console.log("Method not allowed:", req.method);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const data = req.body;
        console.log("📥 SePay webhook received:", JSON.stringify(data));

        // Lấy thông tin từ SePay
        const {
            transferAmount,  // Số tiền chuyển (VND)
            content,         // Nội dung chuyển khoản
            code,            // Mã thanh toán được SePay nhận diện
            transactionDate, // Thời gian giao dịch
            referenceCode,   // Mã tham chiếu
            accountNumber,   // Số tài khoản nhận
        } = data;

        // Kiểm tra có mã thanh toán không
        if (!code || !code.startsWith("NUOIDEV")) {
            console.log("❌ Invalid payment code:", code);
            return res.status(200).json({
                success: false,
                message: "Invalid payment code"
            });
        }

        // Trích xuất thông tin từ code
        // Format: NUOIDEV{timestamp} hoặc NUOIDEV{userId}_{timestamp}
        const paymentCode = code;

        // Tính số coins (1,000 VND = 1 coin)
        const amount = parseInt(transferAmount) || 0;
        const coins = Math.floor(amount / 1000);

        if (coins <= 0) {
            console.log("❌ Invalid amount:", amount);
            return res.status(200).json({
                success: false,
                message: "Invalid amount"
            });
        }

        // Tìm pending transaction trong Firestore
        const pendingRef = db.collection("pendingTransactions");
        const pendingQuery = await pendingRef
            .where("paymentCode", "==", paymentCode)
            .where("status", "==", "pending")
            .limit(1)
            .get();

        let userId = null;
        let transactionDoc = null;

        if (!pendingQuery.empty) {
            // Tìm thấy pending transaction
            transactionDoc = pendingQuery.docs[0];
            userId = transactionDoc.data().userId;
            console.log("✅ Found pending transaction for user:", userId);
        } else {
            // Không tìm thấy pending - có thể là donation anonymous
            console.log("⚠️ No pending transaction found for code:", paymentCode);

            // Vẫn ghi nhận donation vào dev status
            await db.collection("donations").add({
                paymentCode,
                amount,
                coins,
                content,
                transactionDate,
                referenceCode,
                accountNumber,
                anonymous: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Cập nhật tổng coins của dev
            await updateDevStatus(coins);

            return res.status(200).json({
                success: true,
                message: "Anonymous donation recorded",
                coins
            });
        }

        // Cập nhật pending transaction thành completed
        await transactionDoc.ref.update({
            status: "completed",
            actualAmount: amount,
            actualCoins: coins,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            sepayData: data,
        });

        // Cộng coins cho user
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
            coins: admin.firestore.FieldValue.increment(coins),
            totalDonated: admin.firestore.FieldValue.increment(amount),
            lastDonation: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Ghi lại transaction history
        await db.collection("transactions").add({
            userId,
            type: "topup",
            paymentCode,
            amount,
            coins,
            content,
            transactionDate,
            referenceCode,
            status: "completed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Cập nhật dev status
        await updateDevStatus(coins);

        console.log(`✅ SUCCESS: User ${userId} credited ${coins} coins from ${amount} VND`);

        return res.status(200).json({
            success: true,
            message: "Payment processed",
            userId,
            coins,
            amount
        });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Cập nhật trạng thái tổng của dev
 */
async function updateDevStatus(coins) {
    const devStatusRef = db.collection("devStatus").doc("current");
    const devStatus = await devStatusRef.get();

    if (devStatus.exists) {
        await devStatusRef.update({
            totalCoins: admin.firestore.FieldValue.increment(coins),
            totalDonations: admin.firestore.FieldValue.increment(1),
            lastDonation: admin.firestore.FieldValue.serverTimestamp(),
        });
    } else {
        // Tạo mới nếu chưa có
        await devStatusRef.set({
            totalCoins: coins,
            totalDonations: 1,
            mood: "hungry",
            lastDonation: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
}

/**
 * API để tạo pending transaction khi user bấm nạp
 */
exports.createPendingTransaction = functions.https.onCall(async (data, context) => {
    // Kiểm tra auth
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { coins, vnd, paymentCode } = data;
    const userId = context.auth.uid;

    // Tạo pending transaction
    const pendingRef = await db.collection("pendingTransactions").add({
        userId,
        coins,
        vnd,
        paymentCode,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 60 * 1000) // Hết hạn sau 30 phút
        ),
    });

    console.log(`📝 Created pending transaction: ${pendingRef.id} for user ${userId}`);

    return {
        success: true,
        transactionId: pendingRef.id,
        paymentCode
    };
});

/**
 * API để kiểm tra trạng thái thanh toán
 */
exports.checkPaymentStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { paymentCode } = data;
    const userId = context.auth.uid;

    // Tìm transaction
    const pendingRef = db.collection("pendingTransactions");
    const query = await pendingRef
        .where("paymentCode", "==", paymentCode)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (query.empty) {
        return { status: "not_found" };
    }

    const transaction = query.docs[0].data();

    return {
        status: transaction.status,
        coins: transaction.actualCoins || transaction.coins,
        completedAt: transaction.completedAt?.toDate() || null
    };
});
