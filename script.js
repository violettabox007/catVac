// 1. Загрузка данных
let cats = JSON.parse(localStorage.getItem('cats')) || [];

// 2. Функция отрисовки
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

    cats.forEach((cat, index) => {
        const lastVac = new Date(cat.date);
        const nextVac = new Date(lastVac);     
        nextVac.setFullYear(nextVac.getFullYear() + 1);
        
        const isUrgent = (nextVac - today) < (30 * 24 * 60 * 60 * 1000);
        const color = isUrgent ? '#ff4d4d' : '#2ecc71';

        const catItem = document.createElement('div');
        catItem.className = 'cat-item';
        // Обернули в шаблонную строку аккуратно:
        catItem.innerHTML = `
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <b>${cat.name}</b>
                    <input type="date" value="${cat.date}" 
                           onchange="updateCatDate(${index}, this.value)"
                           style="border: 1px solid #ddd; border-radius: 4px; padding: 2px;">
                </div>
                <div style="color: ${color}; font-size: 0.85em; margin-top: 5px;">
                    Следующая: <b>${nextVac.toLocaleDateString()}</b>
                </div>
            </div>
            <details style="margin-left: 10px; cursor: pointer;">
                <summary style="list-style: none; color: #ccc;">⋮</summary>
                <button onclick="deleteCat(${index})" 
                        style="background: #ff4d4d; color: white; border: none; border-radius: 4px; padding: 5px; margin-top: 5px;">
                    Удалить
                </button>
            </details>
        `;
        list.appendChild(catItem);
    });

    localStorage.setItem('cats', JSON.stringify(cats));
}

// 3. Обновление даты (без удаления кота)
function updateCatDate(index, newDate) {
    cats[index].date = newDate;
    renderCats(); // Перерисует и сразу отсортирует по месяцам
}

// 4. Добавление нового кота
function addCat() {
    const nameInput = document.getElementById('catName');
    const dateInput = document.getElementById('vacDate');

    if (nameInput.value && dateInput.value) {
        cats.push({
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
function deleteCat(index) {
    if (confirm(`Удалить котика ${cats[index].name}?`)) {
        cats.splice(index, 1);
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

function checkVaccinations() {
    const today = new Date();
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