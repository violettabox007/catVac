// 1. Создаем базу данных прямо в памяти телефона (IndexedDB)
const db = new Dexie("CatVaccinesDB");

//: Настраиваем таблицу "cats", где главным ключом для поиска будет id
db.version(1).stores ({
    cats: 'id, name, date'
});


// 2. Функция отрисовки
// НОВОЕ: Добавили async, так как функция будет ждать ответа от базы данных
async function renderCats() {
    const list = document.getElementById('catList');
    if(!list) return;
    list.innerHTML = '';

    // НОВОЕ: await говорит подождать, пока база данных достанет всех котиков и превратит их в массив
    let cats = await db.cats.toArray();
}

function renderCats() {
    const list = document.getElementById('catList');
    if (!list) return; 
    list.innerHTML = ''; 

    // СОРТИРОВКА: по месяцам (от января до декабря)
    cats.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate();
    });

    const today = new Date();

    cats.forEach((cat) => {
        const lastVac = new Date(cat.date);
        const nextVac = new Date(lastVac);     
        nextVac.setFullYear(nextVac.getFullYear() + 1);
        
        const isUrgent = (nextVac - today) < (30 * 24 * 60 * 60 * 1000);
        const color = isUrgent ? '#ff4d4d' : '#2ecc71';

        const catItem = document.createElement('div');
        catItem.className = 'cat-item';
        
        // ВМЕСТО index МЫ ПЕРЕДАЕМ cat.id
        catItem.innerHTML = `
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <b>${cat.name}</b>
                    <input type="date" value="${cat.date}" 
                           onchange="updateCatDate('${cat.id}', this.value)"
                           style="border: 1px solid #ddd; border-radius: 4px; padding: 2px;">
                </div>
                <div style="color: ${color}; font-size: 0.85em; margin-top: 5px;">
                    Следующая: <b>${nextVac.toLocaleDateString()}</b>
                </div>
            </div>
            <details style="margin-left: 10px; cursor: pointer;">
                <summary style="list-style: none; color: #ccc;">⋮</summary>
                <button onclick="deleteCat('${cat.id}')" 
                        style="background: #ff4d4d; color: white; border: none; border-radius: 4px; padding: 5px; margin-top: 5px;">
                    Удалить
                </button>
            </details>
        `;
        list.appendChild(catItem);
    });

   
}

// 3. Обновление даты (без удаления кота)
async function updateCatDate (id, newDate) {
    await db.cats.update (id, {date: newDate});
    renderCats();
}



// 4. Добавление нового кота
async function addCat () {
    const nameInput = document.getElementById('catName');
    const dateInput = document.getElementById ('vacDate');



    if (nameInput.value && dateInput.value) {
        await db.cats.add({
            id: Date.now().toString(), // Генерируем уникальный ID для каждого кота
            name: nameInput.value, 
            date: dateInput.value
        });
        nameInput.value = ''; 
        dateInput.value = '';
        renderCats();
    } else {
        alert("Заполни имя и дату!");
    }
}

// 5. Удаление (с подтверждением)
// НОВОЕ: Добавили async, так как функция будет удалять данные из базы
async function deleteCat(id) {
    const cat = await db.cats.get(id);
    if (cat && confirm(`Удалить котика ${cat.name}?`)) {
        cats = cats.filter(c => c.id !== id); // Оставляем всех, кроме кота с этим id
        await db.cats.delete(id);
        renderCats();
    }
}

// 6. Уведомления
function askPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Уведомления включены!");
            checkVaccinations();
        }
    });
}

// НОВОЕ: Добавили async, так как функция читает список котиков из базы
    async function checkVaccinations() {
    const today = new Date();

    const cats = await db.cats.toArray();

    cats.forEach(cat => {
        const lastVac = new Date(cat.date);
        const nextVac = new Date(lastVac);
        nextVac.setFullYear(nextVac.getFullYear() + 1);
        const diffDays = (nextVac - today) / (1000 * 60 * 60 * 24);
        if (diffDays > 0 && diffDays <= 7) {
            new Notification("Пора вакцинировать!", {
                body: `У кошки ${cat.name} скоро вакцинация: ${nextVac.toLocaleDateString()}`
            });
        }
    });
}

// Запуск при старте
renderCats();
if (Notification.permission === "granted") {
    checkVaccinations();
}
