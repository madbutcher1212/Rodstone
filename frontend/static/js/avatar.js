// avatar.js - логика аватарок, окно выбора, покупка

// Обновление отображения аватара
function updateAvatar() {
    const img = document.getElementById('avatarImg');
    const placeholder = document.getElementById('avatarPlaceholder');
    const settingsImg = document.getElementById('settingsAvatarImg');
    const avatar = AVATARS[userData.avatar];

    if (avatar?.url) {
        if (img) {
            img.src = avatar.url;
            img.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (settingsImg) settingsImg.src = avatar.url;
    } else {
        const letter = userData.game_login?.charAt(0).toUpperCase() || '👤';
        if (placeholder) {
            placeholder.textContent = letter;
            placeholder.style.display = 'block';
        }
        if (img) img.style.display = 'none';
    }

    const nameEl = document.getElementById('settingsAvatarName');
    if (nameEl) nameEl.textContent = avatar?.name || 'Мужской';
}

// Открыть окно выбора аватара
function openAvatarSelector() {
    selectedAvatar = userData.avatar;
    const grid = document.getElementById('avatarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    Object.keys(AVATARS).forEach(key => {
        const a = AVATARS[key];
        const owned = userData.owned_avatars?.includes(key) || false;
        const selected = selectedAvatar === key;

        const div = document.createElement('div');
        div.className = `avatar-option ${selected ? 'selected' : ''}`;
        div.dataset.key = key;
        div.innerHTML = `
            <img src="${a.url}" class="avatar-option-img">
            <div class="avatar-option-name">${a.name}</div>
            ${!owned ? `<div class="avatar-option-price">${a.price} 🪙</div>` : ''}
        `;
        div.onclick = () => selectAvatarOption(key);
        grid.appendChild(div);
    });

    document.getElementById('avatarOverlay').style.display = 'flex';
}

// Выбрать аватар в окне
function selectAvatarOption(key) {
    selectedAvatar = key;
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.key === key);
    });
}

// Закрыть окно выбора аватара
function closeAvatarSelector() {
    document.getElementById('avatarOverlay').style.display = 'none';
    selectedAvatar = null;
}

// Подтвердить выбор аватара
async function confirmAvatarSelection() {
    if (!selectedAvatar || selectedAvatar === userData.avatar) {
        closeAvatarSelector();
        return;
    }

    const avatar = AVATARS[selectedAvatar];
    const owned = userData.owned_avatars?.includes(selectedAvatar);

    if (!owned) {
        if (userData.gold < avatar.price) {
            showToast('❌ Не хватает монет');
            return;
        }
        const result = await apiRequest('buy_avatar', { 
            avatar: selectedAvatar, 
            price: avatar.price 
        });
        if (result.success) {
            if (result.state) Object.assign(userData, result.state);
            updateAvatar();
            showToast('✅ Аватар куплен!');
        } else {
            showToast(`❌ ${result.error || 'Ошибка'}`);
        }
    } else {
        const result = await apiRequest('select_avatar', { avatar: selectedAvatar });
        if (result.success) {
            if (result.state) Object.assign(userData, result.state);
            updateAvatar();
            showToast('✅ Аватар выбран!');
        } else {
            showToast(`❌ ${result.error || 'Ошибка'}`);
        }
    }

    closeAvatarSelector();
}
