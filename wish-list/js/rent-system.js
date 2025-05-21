document.addEventListener('DOMContentLoaded', function() {
    // Инициализация системы аренды при загрузке страницы
    initRentSystem();
});

/**
 * Инициализирует систему аренды, добавляя обработчики событий
 */
function initRentSystem() {
    document.addEventListener('click', function(e) {
        // Обработка клика по кнопке "Арендовать"
        if (e.target.classList.contains('rent-btn')) {
            handleRentButtonClick(e.target);
        }
        
        // Обработка клика по кнопке "Подтвердить аренду"
        if (e.target.classList.contains('confirm-rent')) {
            handleConfirmRent(e.target);
        }
        
        // Обработка клика по кнопке "Отмена аренды"
        if (e.target.classList.contains('cancel-rent')) {
            handleCancelRent(e.target);
        }
        
        // Обработка клика по кнопке удаления арендатора
        if (e.target.classList.contains('remove-renter-btn')) {
            handleRemoveRenter(e.target);
        }
    });
}

/**
 * Обрабатывает нажатие кнопки "Арендовать"
 * @param {HTMLElement} button - Кнопка "Арендовать"
 */
function handleRentButtonClick(button) {
    const rentForm = button.nextElementSibling;
    // Скрываем кнопку и показываем форму
    button.classList.add('hidden');
    rentForm.classList.remove('hidden');
    // Устанавливаем фокус на поле ввода имени
    rentForm.querySelector('.renter-name').focus();
}

/**
 * Обрабатывает подтверждение аренды
 * @param {HTMLElement} button - Кнопка "Подтвердить"
 */
function handleConfirmRent(button) {
    const rentForm = button.closest('.rent-form');
    const nameInput = rentForm.querySelector('.renter-name');
    const renterName = nameInput.value.trim();
    
    // Проверка на пустое имя
    if (!renterName) {
        alert('Пожалуйста, введите ваше имя');
        return;
    }

    const rentCell = rentForm.closest('.rent-cell');
    const rentersList = rentCell.querySelector('.renters-list');
    
    // Проверка на дубликат арендатора
    if (isDuplicateRenter(rentersList, renterName)) {
        alert('Этот человек уже арендовал данный подарок');
        return;
    }

    // Добавляем нового арендатора
    addRenter(rentersList, renterName);
    // Обновляем статус аренды
    updateRentStatus(rentCell);
    // Закрываем форму аренды
    closeRentForm(rentForm, rentCell);
    // Сохраняем изменения
    saveCurrentPageData();
}

/**
 * Обрабатывает отмену аренды
 * @param {HTMLElement} button - Кнопка "Отмена"
 */
function handleCancelRent(button) {
    const rentForm = button.closest('.rent-form');
    const rentBtn = rentForm.previousElementSibling;
    
    // Скрываем форму и показываем кнопку
    rentForm.classList.add('hidden');
    rentBtn.classList.remove('hidden');
    // Очищаем поле ввода
    rentForm.querySelector('.renter-name').value = '';
}

/**
 * Обрабатывает удаление арендатора
 * @param {HTMLElement} button - Кнопка удаления арендатора
 */
function handleRemoveRenter(button) {
    const renterElement = button.closest('.renter');
    const rentCell = renterElement.closest('.rent-cell');
    
    // Удаляем арендатора
    renterElement.remove();
    // Обновляем статус аренды
    updateRentStatus(rentCell);
    // Сохраняем изменения
    saveCurrentPageData();
}

/**
 * Проверяет, есть ли уже такой арендатор
 * @param {HTMLElement} rentersList - Список арендаторов
 * @param {string} renterName - Имя арендатора
 * @returns {boolean} - true если дубликат существует
 */
function isDuplicateRenter(rentersList, renterName) {
    return Array.from(rentersList.children).some(
        item => item.textContent.replace('×', '').trim() === renterName
    );
}

/**
 * Добавляет нового арендатора в список
 * @param {HTMLElement} rentersList - Список арендаторов
 * @param {string} renterName - Имя арендатора
 */
function addRenter(rentersList, renterName) {
    const renterElement = document.createElement('div');
    renterElement.className = 'renter';
    renterElement.innerHTML = `
        ${renterName}
        <button class="remove-renter-btn" title="Удалить">×</button>
    `;
    rentersList.appendChild(renterElement);
}

/**
 * Обновляет статус аренды
 * @param {HTMLElement} rentCell - Ячейка с информацией об аренде
 */
function updateRentStatus(rentCell) {
    const rentStatus = rentCell.querySelector('.rent-status');
    const rentersList = rentCell.querySelector('.renters-list');
    const rentersCount = rentersList.children.length;
    
    if (rentersCount > 0) {
        // Если есть арендаторы
        rentStatus.textContent = rentersCount === 1 ? 'Арендован:' : 'Арендовано:';
        rentStatus.style.color = '#e74c3c';
        rentStatus.classList.remove('available');
        rentStatus.classList.add('rented');
    } else {
        // Если нет арендаторов
        rentStatus.textContent = 'Свободен';
        rentStatus.style.color = '#2ecc71';
        rentStatus.classList.remove('rented');
        rentStatus.classList.add('available');
    }
}

/**
 * Закрывает форму аренды
 * @param {HTMLElement} rentForm - Форма аренды
 * @param {HTMLElement} rentCell - Ячейка с информацией об аренде
 */
function closeRentForm(rentForm, rentCell) {
    const rentBtn = rentCell.querySelector('.rent-btn');
    rentForm.classList.add('hidden');
    rentBtn.classList.remove('hidden');
    rentForm.querySelector('.renter-name').value = '';
}

/**
 * Сохраняет данные текущей страницы
 */
function saveCurrentPageData() {
    if (typeof(Storage) === "undefined") return;
    
    // Создаем событие для сохранения данных
    const event = new CustomEvent('saveData', {
        detail: { source: 'rentSystem' }
    });
    document.dispatchEvent(event);
    
    // Альтернативный способ инициировать сохранение
    if (typeof window.saveWishlistData === 'function') {
        const pageType = window.location.pathname
            .split('/')
            .pop()
            .replace('.html', '');
        window.saveWishlistData(pageType);
    }
}

// Экспорт функций для тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initRentSystem,
        handleRentButtonClick,
        handleConfirmRent,
        handleCancelRent,
        handleRemoveRenter,
        isDuplicateRenter,
        addRenter,
        updateRentStatus,
        closeRentForm,
        saveCurrentPageData
    };
}