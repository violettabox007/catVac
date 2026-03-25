// 1. Загрузка данных

let cats = JSON.parse(localStorage.getItem('cats')) || [];
console.log("Загруженные кошки:", cats);

// 2. Функция удаления

function deleteCat (index) {

    console.log("Удаляем кошку под номером:", index);

    cats.splice(index, 1); // Метод splice удаляет 1 элемент по указанному индексу, Index - это позиция элемента в массиве - начинается с 0. Функция означает - Найди элемент под номером index и удали ровно 1 штуку

    localStorage.setItem('cats', JSON.stringify(cats)); // Перезаписываем обновленный список в память браузера

    renderCats();
}

// 3. Функция отрисовки
function renderCats() {
    const list = document.getElementById('catList');
    if (!list) return; // Проверка, что список вообще есть в HTML
    list.innerHTML = ''; // Очищаем список перед перерисовкой

    // Берем текущую дату, чтобы сравнивать
    const today = new Date();

    cats.forEach((cat, index) => {
    const lastVac = new Date (cat.date);  // Превращаем дату вакцинации (строку) в объект даты JS
   
    // Считаем дату следующей прививки (добавляем 1 год)
    const nextVac = new Date (lastVac);     
    nextVac.setFullYear(nextVac.getFullYear() +1);
    
    // Проверяем: если до следующей прививки осталось меньше 30 дней или она прошла
    const isUrgent = (nextVac - today) < (30 * 24 * 60 * 60 * 1000);
    const color = isUrgent ? '#ff4d4d' : '#333'; // Красный, если пора
    
    
        list.innerHTML += `
        <div class="cat-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
        <span>${index + 1}. <b>${cat.name}</b> — 📅 ${cat.date}</span>

          <div style="color: ${color}; font-size: 0.8em; margin-top: 4px;">
             <b>${nextVac.toLocaleDateString()} </b>
                
                
            </div>
          </div>
          <button onclick="deleteCat(${index})" style="background:none; border:none; cursor:pointer; font-size: 16px;">❌</button>
          </div>
        `;
    });
}


// 4. Функция добавления
function addCat() {
    const nameInput = document.getElementById('catName');
    const dateInput = document.getElementById('vacDate');

    if (nameInput.value && dateInput.value) {
        const newCat = {
            name: nameInput.value, 
            date: dateInput.value
        };

        cats.push(newCat); // Добавляем в массив
        localStorage.setItem('cats', JSON.stringify(cats)); // Сохраняем

        console.log("Добавлена кошка:", newCat);

        nameInput.value = ''; // Очищаем поля
        dateInput.value = '';

        renderCats(); // Обновляем экран

    } else {
        alert("Заполни имя и дату!");
    }

}

// Запускаем отрисовку при открытии
renderCats();


// Уведомления 1. Функция, которая спрашивает разрешение у пользователя

function askPermission() {
    
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Ура! Уведомления включены.");
            checkVaccinations(); // Сразу проверяем, не пора ли кому на прививку
            document.getElementById('notifyBtn').style.display = 'none'; // Прячем кнопку уведомлений
        }
    });
}

// 2. Функция, которая проверяет даты и шлет уведомление
function checkVaccinations() {
    const today = new Date();

    cats.forEach(cat => {
        const lastVac = new Date(cat.date);
        const nextVac = new Date(lastVac);
        nextVac.setFullYear(nextVac.getFullYear() +1);

        // Если до прививки меньше 7 дней — шлем пуш!
        const diffDays = (nextVac - today) / (1000 * 60 * 60 * 24);
        if (diffDays > 0 && diffDays <= 7) {
            new Notification("Пора вакцинировать!", {
                body: `У кошки ${cat.name} скоро вакцинация: ${nextVac.toLocaleDateString()}`,
                icon: "https://cdn-icons-png.flaticon.com" // Просто иконка шприца
            });
        }
    });
}


// 3. Запускаем проверку при каждом открытии приложения
if (Notification.permission === "granded") {
    checkVaccinations();
}