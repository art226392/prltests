// Импортируем необходимые модули Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

// Инициализируем Firebase Admin SDK.
// Это позволяет функции работать с другими сервисами Firebase от имени администратора.
admin.initializeApp();

// Создаем и экспортируем HTTP Cloud Function с именем 'submitReview'
exports.submitReview = functions.https.onRequest((req, res) => {
  // Используем CORS middleware, чтобы разрешить запросы с вашего веб-сайта
  cors(req, res, () => {
    // Принимаем только POST-запросы
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Извлекаем рейтинг и текст отзыва из тела запроса
    const { rating, text } = req.body;

    // Простая валидация данных на сервере
    if (!rating || rating < 1 || rating > 5 || typeof text !== "string") {
      return res.status(400).send("Invalid input.");
    }

    // Ограничиваем длину текста отзыва для безопасности
    const sanitizedText = text.substring(0, 500);

    // Добавляем новый документ в коллекцию 'reviews' в Firestore
    return admin
      .firestore()
      .collection("reviews")
      .add({
        rating: rating,
        text: sanitizedText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Добавляем временную метку
        page: "narcissism-test", // Добавляем идентификатор страницы
      })
      .then(() => {
        // В случае успеха отправляем обратно статус 200
        return res
          .status(200)
          .send({ message: "Review submitted successfully!" });
      })
      .catch((error) => {
        // В случае ошибки логируем ее и отправляем статус 500
        console.error("Error writing to Firestore:", error);
        return res.status(500).send("Internal Server Error");
      });
  });
});
