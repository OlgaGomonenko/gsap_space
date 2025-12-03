document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('particles-container');
    
    // Проверка существования контейнера
    if (!container) {
        console.error('❌ particles-container not found!');
        return;
    }
    
    console.log('⭐ Interactive stars initialized');
    
    const particleCount = 300; // Количество частиц
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let scale = 1; // Для масштабирования колесом мыши

    // 1. Создаём частицы
    function createParticles() {
        // Очищаем контейнер
        container.innerHTML = '';
        particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            container.appendChild(particle);

            // Начальная случайная позиция
            const startX = Math.random() * container.offsetWidth;
            const startY = Math.random() * container.offsetHeight;

            // Случайный цвет из сине-фиолетовой гаммы
            const hue = 240 + Math.random() * 60; // От синего до фиолетового
            particle.style.backgroundColor = `hsl(${hue}, 100%, 60%)`;
            particle.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 60%), 0 0 20px hsl(${hue}, 100%, 60%)`;

            // Сохраняем объект частицы с данными
            particles.push({
                el: particle,
                x: startX,
                y: startY,
                size: Math.random() * 8 + 4, // Случайный размер
                speedX: (Math.random() - 0.5) * 0.8, // Случайная скорость
                speedY: (Math.random() - 0.5) * 0.8,
                hue: hue,
                // Целевые позиции для плавного движения к сетке
                targetX: startX,
                targetY: startY
            });

            // Устанавливаем начальную позицию
            gsap.set(particle, {
                x: startX,
                y: startY,
                width: particles[i].size,
                height: particles[i].size
            });
        }
    }

    // 2. Анимация движения частиц (плавное перемещение к целевым точкам сетки)
    function animateParticles() {
        particles.forEach(p => {
            // Плавное движение к целевой позиции
            p.x += (p.targetX - p.x) * 0.05;
            p.y += (p.targetY - p.y) * 0.05;

            // Обновляем позицию с помощью GSAP для максимальной производительности
            gsap.set(p.el, {
                x: p.x,
                y: p.y,
                scale: scale // Применяем масштаб
            });
        });

        requestAnimationFrame(animateParticles);
    }

    // 3. Создаём сетку целевых позиций (частицы стремятся к этим точкам)
    function createGrid() {
        const cols = 20;
        const rows = 15;
        const cellWidth = container.offsetWidth / cols;
        const cellHeight = container.offsetHeight / rows;
        let gridPoints = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                gridPoints.push({
                    x: c * cellWidth + cellWidth / 2,
                    y: r * cellHeight + cellHeight / 2
                });
            }
        }

        // Случайно назначаем каждой частице точку сетки
        particles.forEach(p => {
            const point = gridPoints[Math.floor(Math.random() * gridPoints.length)];
            p.targetX = point.x;
            p.targetY = point.y;
        });
    }

    // 4. Взаимодействие с мышью
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        // При наведении: частицы разбегаются и светятся
        particles.forEach(p => {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150; // Радиус влияния курсора

            if (distance < maxDistance) {
                // Отталкивание
                const force = (maxDistance - distance) / maxDistance;
                const angle = Math.atan2(dy, dx);
                const pushStrength = 15;

                p.targetX = p.x + Math.cos(angle) * force * pushStrength;
                p.targetY = p.y + Math.sin(angle) * force * pushStrength;

                // Эффект свечения
                gsap.to(p.el, {
                    duration: 0.3,
                    scale: 1.8,
                    boxShadow: `0 0 20px hsl(${p.hue}, 100%, 70%), 0 0 40px hsl(${p.hue}, 100%, 70%)`,
                    opacity: 1
                });
            } else {
                // Возвращаем к сетке
                p.targetX = p.x + (p.targetX - p.x) * 0.05;
                p.targetY = p.y + (p.targetX - p.x) * 0.05;

                // Убираем свечение
                gsap.to(p.el, {
                    duration: 0.5,
                    scale: 1,
                    boxShadow: `0 0 10px hsl(${p.hue}, 100%, 60%), 0 0 20px hsl(${p.hue}, 100%, 60%)`,
                    opacity: 0.7
                });
            }
        });
    });

    // 5. Масштабирование колесом мыши
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.001;
        // Ограничиваем масштаб
        scale = Math.min(Math.max(0.5, scale), 3);
    });

    // 6. Перетаскивание всей сцены (дополнительный интерактив)
    let isDragging = false;
    let startX, startY, startTranslateX = 0, startTranslateY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Сдвигаем все частицы
        particles.forEach(p => {
            p.targetX += dx * 0.1;
            p.targetY += dy * 0.1;
        });

        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'default';
    });

    // 7. Реакция на изменение размера окна
    window.addEventListener('resize', () => {
        createGrid();
    });

    // Запуск всего
    createParticles();
    createGrid();
    animateParticles();

    // Добавляем небольшую начальную анимацию для привлечения внимания
    gsap.from('.title, .subtitle', {
        duration: 1.5,
        y: 50,
        opacity: 0,
        stagger: 0.3,
        ease: "power3.out"
    });

    // Связываем анимацию частиц и комет
    // При клике на заголовок добавляем эффект взрыва частиц
    document.querySelector('.title').addEventListener('click', () => {
        // Эффект "взрыва" частиц при клике на заголовок
        particles.forEach(p => {
            // Сохраняем текущую целевую позицию
            const originalTargetX = p.targetX;
            const originalTargetY = p.targetY;
            
            // Взрыв - разлетаемся в случайные стороны
            p.targetX = p.x + (Math.random() - 0.5) * 200;
            p.targetY = p.y + (Math.random() - 0.5) * 200;
            
            // Через секунду возвращаемся на место
            setTimeout(() => {
                p.targetX = originalTargetX;
                p.targetY = originalTargetY;
            }, 1000);
        });
    });
});