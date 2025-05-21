document.addEventListener('DOMContentLoaded', function() {
    // Подсветка активного пункта меню
    const currentPage = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('#menu a');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Обработка форм добавления новых предметов
    const forms = document.querySelectorAll('form[id^="add-"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input, select, textarea');
            const table = this.closest('section').querySelector('table tbody');
            const newRow = document.createElement('tr');
            
            // Добавляем ячейку с кнопкой удаления
            const deleteCell = document.createElement('td');
            deleteCell.innerHTML = '<button class="delete-btn">❌</button>';
            newRow.appendChild(deleteCell);
            
            // Добавляем ячейку для аренды
            const rentCell = document.createElement('td');
            rentCell.className = 'rent-cell';
            rentCell.innerHTML = `
                <div class="rent-status">Свободен</div>
                <button class="rent-btn">Арендовать</button>
                <div class="rent-form hidden">
                    <input type="text" placeholder="Ваше имя" class="renter-name">
                    <button class="confirm-rent">Подтвердить</button>
                    <button class="cancel-rent">Отмена</button>
                </div>
                <div class="renters-list"></div>
            `;
            newRow.appendChild(rentCell);
            
            inputs.forEach(input => {
                if (input.tagName === 'BUTTON') return;
                
                const cell = document.createElement('td');
                
                if (input.tagName === 'SELECT') {
                    cell.textContent = input.options[input.selectedIndex].text;
                } else if (input.type === 'url') {
                    const link = document.createElement('a');
                    link.href = input.value;
                    link.textContent = 'Перейти';
                    link.target = '_blank';
                    cell.appendChild(link);
                } else if (input.tagName === 'TEXTAREA') {
                    cell.textContent = input.value;
                } else {
                    cell.textContent = input.value;
                }
                
                newRow.appendChild(cell);
            });
            
            table.appendChild(newRow);
            this.reset();
            updateLocalStorage();
        });
    });
    
    // Обработчик удаления строк
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Удалить этот подарок из списка?')) {
                const row = e.target.closest('tr');
                row.classList.add('removing');
                setTimeout(() => {
                    row.remove();
                    updateLocalStorage();
                }, 300);
            }
        }
    });
    
    // Загрузка данных при открытии страницы
    loadRentData();
});

// Обновляем localStorage
function updateLocalStorage() {
    if (typeof(Storage) === "undefined") return;
    
    const rentData = [];
    document.querySelectorAll('tbody tr').forEach(row => {
        const name = row.cells[1].textContent;
        const rentCell = row.querySelector('.rent-cell');
        if (rentCell) {
            const renters = [];
            rentCell.querySelectorAll('.renter').forEach(renter => {
                renters.push(renter.textContent);
            });
            
            rentData.push({
                name: name,
                renters: renters
            });
        }
    });
    
    localStorage.setItem('wishlistRentData', JSON.stringify(rentData));
}

// Загрузка данных из localStorage
function loadRentData() {
    if (typeof(Storage) === "undefined") return;
    
    const savedData = localStorage.getItem('wishlistRentData');
    if (!savedData) return;
    
    const rentData = JSON.parse(savedData);
    const currentItems = Array.from(document.querySelectorAll('tbody tr')).map(row => row.cells[1].textContent);
    
    // Фильтруем данные, удаляя несуществующие предметы
    const updatedData = rentData.filter(item => currentItems.includes(item.name));
    localStorage.setItem('wishlistRentData', JSON.stringify(updatedData));
    
    // Восстанавливаем данные аренды
    document.querySelectorAll('tbody tr').forEach(row => {
        const itemName = row.cells[1].textContent;
        const itemData = updatedData.find(item => item.name === itemName);
        
        if (itemData) {
            const rentCell = row.querySelector('.rent-cell');
            if (rentCell) {
                const rentStatus = rentCell.querySelector('.rent-status');
                const rentersList = rentCell.querySelector('.renters-list');
                
                itemData.renters.forEach(renter => {
                    const renterElement = document.createElement('div');
                    renterElement.className = 'renter';
                    renterElement.textContent = renter;
                    rentersList.appendChild(renterElement);
                });
                
                if (itemData.renters.length > 0) {
                    rentStatus.textContent = itemData.renters.length === 1 ? 'Арендован:' : 'Арендовано:';
                    rentStatus.style.color = '#e74c3c';
                }
            }
        }
    });
}