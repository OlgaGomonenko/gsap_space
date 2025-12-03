document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Comets system initialized');
    
    const container = document.getElementById('comets-container');
    if (!container) {
        console.error('❌ comets-container not found!');
        return;
    }
    
    container.innerHTML = '';
    createBackgroundStars();
    
    // Создаём 2 кометы
    createComet('blue', 1);
    setTimeout(() => createComet('pink', 2), 500);
    
    function createComet(type, cometId) {
        const config = type === 'blue' ? {
            headColor: '#00ffff',
            tailColor: '#0080ff',
            headSize: 26,
            speed: 0.14,
            tailLength: 150
        } : {
            headColor: '#ff00ff',
            tailColor: '#ff0080',
            headSize: 24,
            speed: 0.15,
            tailLength: 140
        };
        
        // Траектории
        let startX, startY, endX, endY;
        
        if (cometId === 1) {
            // Синяя комета: слева → справа
            startX = -100;
            startY = container.offsetHeight * 0.25;
            endX = container.offsetWidth + 100;
            endY = container.offsetHeight * 0.75;
        } else {
            // Розовая комета: справа → слева
            startX = container.offsetWidth + 100;
            startY = container.offsetHeight * 0.75;
            endX = -100;
            endY = container.offsetHeight * 0.25;
        }
        
        // 1. СОЗДАЁМ КОНТЕЙНЕР КОМЕТЫ
        const cometElement = document.createElement('div');
        cometElement.id = `comet-${cometId}`;
        cometElement.className = 'comet';
        
        cometElement.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            transform: translate(-50%, -50%);
            z-index: 100;
            width: ${config.headSize + config.tailLength}px;
            height: ${config.headSize * 2.5}px;
            pointer-events: none;
        `;
        
        // 2. СОЗДАЁМ ХВОСТ
        const tail = document.createElement('div');
        tail.className = 'comet-tail';
        
        tail.style.cssText = `
            position: absolute;
            left: 0;
            top: 50%;
            width: ${config.tailLength}px;
            height: ${config.headSize * 1.8}px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                ${config.tailColor}20 20%,
                ${config.tailColor}40 40%,
                ${config.headColor}60 70%,
                ${config.headColor}80 100%);
            clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
            filter: blur(10px) brightness(1.1);
            opacity: 0.8;
            transform: translateY(-50%);
            transform-origin: right center;
            mix-blend-mode: plus-lighter;
            z-index: 1;
        `;
        
        // 3. СОЗДАЁМ ГОЛОВУ
        const head = document.createElement('div');
        head.className = 'comet-head';
        
        head.style.cssText = `
            position: absolute;
            left: ${config.tailLength}px;
            top: 50%;
            width: ${config.headSize}px;
            height: ${config.headSize}px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, 
                rgba(255, 255, 255, 0.9) 0%, 
                ${config.headColor} 50%, 
                ${config.tailColor} 90%);
            box-shadow: 
                0 0 15px ${config.headColor},
                0 0 30px ${config.headColor},
                0 0 45px rgba(255, 255, 255, 0.2);
            filter: blur(1.5px) brightness(1.8);
            transform: translateY(-50%);
            z-index: 10;
        `;
        
        // 4. ОРЕОЛ ВОКРУГ ГОЛОВЫ
        const headGlow = document.createElement('div');
        headGlow.className = 'comet-head-glow';
        
        headGlow.style.cssText = `
            position: absolute;
            left: ${config.tailLength}px;
            top: 50%;
            width: ${config.headSize * 2}px;
            height: ${config.headSize * 2}px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                ${config.headColor}30 0%,
                ${config.tailColor}15 50%,
                transparent 80%);
            filter: blur(8px);
            opacity: 0.7;
            transform: translate(-50%, -50%);
            z-index: 5;
            pointer-events: none;
        `;
        
        // 5. СОБИРАЕМ КОМЕТУ
        cometElement.appendChild(tail);
        cometElement.appendChild(headGlow);
        cometElement.appendChild(head);
        container.appendChild(cometElement);
        
        // 6. АНИМИРУЕМ
        animateComet(cometElement, config, startX, startY, endX, endY, cometId, type);
    }
    
    function animateComet(cometElement, config, startX, startY, endX, endY, cometId, type) {
        const duration = 12 / config.speed;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        cometElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        
        gsap.to(cometElement, {
            x: deltaX,
            y: deltaY,
            duration: duration,
            ease: "power1.out",
            onUpdate: function() {
                const head = cometElement.querySelector('.comet-head');
                const pulse = 0.9 + Math.sin(Date.now() * 0.004) * 0.1;
                head.style.transform = `translateY(-50%) scale(${pulse})`;
                
                const progress = gsap.getProperty(cometElement, "x") / deltaX;
                const brightness = 1.7 + Math.sin(progress * Math.PI * 3) * 0.3;
                head.style.filter = `blur(1.5px) brightness(${brightness})`;
                
                const headGlow = cometElement.querySelector('.comet-head-glow');
                const glowPulse = 0.6 + Math.sin(Date.now() * 0.003) * 0.2;
                headGlow.style.opacity = glowPulse;
                headGlow.style.transform = `translate(-50%, -50%) scale(${1 + pulse * 0.1})`;
                
                const tail = cometElement.querySelector('.comet-tail');
                const flicker = 0.7 + Math.sin(Date.now() * 0.002 + cometId) * 0.15;
                tail.style.opacity = flicker;
                
                const tailBlur = 8 + Math.sin(Date.now() * 0.0015) * 2;
                tail.style.filter = `blur(${tailBlur}px) brightness(1.1)`;
            },
            onComplete: function() {
                gsap.to(cometElement, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 1.5,
                    ease: "power2.in",
                    onComplete: function() {
                        cometElement.remove();
                        setTimeout(() => createComet(type, cometId), 2500 + Math.random() * 2000);
                    }
                });
            }
        });
        
        const tail = cometElement.querySelector('.comet-tail');
        gsap.to(tail, {
            opacity: 0.65,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    
    function createBackgroundStars() {
        const starCount = 40; // НОРМАЛЬНОЕ КОЛИЧЕСТВО
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'background-star';
            
            const size = Math.random() * 1.2 + 0.3;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const opacity = Math.random() * 0.4 + 0.1;
            
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                background-color: #ffffff;
                border-radius: 50%;
                opacity: ${opacity};
                box-shadow: 0 0 ${size * 2}px #ffffff;
                z-index: 1;
                pointer-events: none;
                filter: blur(0.2px);
            `;
            
            container.appendChild(star);
            
            gsap.to(star, {
                opacity: Math.random() * 0.6 + 0.2,
                duration: 2 + Math.random() * 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            container.innerHTML = '';
            createBackgroundStars();
            createComet('blue', 1);
            setTimeout(() => createComet('pink', 2), 500);
        }, 300);
    });
});