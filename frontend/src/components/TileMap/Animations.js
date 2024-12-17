import anime from 'animejs';
import './Animations.css';
export const addSlashEffect = (token) => {
    const slash = document.createElement('div');
    slash.className = 'slash-effect';
    token.appendChild(slash);

    anime({
        targets: slash,
        scaleX: [0.1, 6, 0.1],  // Increased scaleX
        scaleY: [1, 8, 0.5],    // Increased scaleY
        opacity: [1, 0],
        rotate: [0, 50],        // Increased rotation for more dramatic effect
        duration: 400,          // Increased duration to make the effect more noticeable
        easing: 'easeInOutQuad',
        complete: () => {
            slash.remove();
        }
    });
};
export const createBloodParticles = (token) => {
    const particlesCount = 15;
    const tokenRect = token.getBoundingClientRect(); // Get the token's position

    console.log("Token Rect:", tokenRect); // Debug: Check if token rect is correctly obtained

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'blood-particle';

        // Set particle to be positioned relative to the token
        particle.style.position = 'absolute';
        particle.style.width = '10px'; // Set width for visibility
        particle.style.height = '10px'; // Set height for visibility
        particle.style.backgroundColor = 'red'; // Temporary color for visibility

        // Calculate initial position
        const posX = (tokenRect.left + tokenRect.width / 2) - 5; // Centering the particle
        const posY = (tokenRect.top + tokenRect.height / 2) - 5; // Centering the particle

        particle.style.left = `${posX}px`; // Center the particle horizontally
        particle.style.top = `${posY}px`; // Center the particle vertically

        console.log("Appending particle:", particle); // Debug: Log particle creation
        document.body.appendChild(particle); // Append to body for visibility

        // Define the direction for the slash effect
        const direction = {
            x: (Math.random() * 80 - 80), // Random horizontal direction
            y: (Math.random() * 80 - 80)  // Random vertical direction
        };

        // Animate the particle in a slash effect
        anime({
            targets: particle,
            translateX: direction.x, // Move in the random horizontal direction
            translateY: direction.y, // Move in the random vertical direction
            scale: [1, 0], // Scale effect
            opacity: [1, 0], // Fade out
            duration: 1200,
            easing: 'easeOutQuad',
            complete: () => {
                particle.remove(); // Remove after animation
            }
        });
    }
};


export const createSparkles = (token) => {
    const numberOfSparkles = 20;  // Increased sparkle count
    const tokenRect = token.getBoundingClientRect();

    for (let i = 0; i < numberOfSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const x = (Math.random() - 0.5) * tokenRect.width * 1.2;  // Increased spread of sparkles
        const y = (Math.random() - 0.5) * tokenRect.height * 1.2;

        sparkle.style.position = 'absolute';
        sparkle.style.left = `${tokenRect.left + tokenRect.width / 2 + x}px`;
        sparkle.style.top = `${tokenRect.top + tokenRect.height / 2 + y}px`;
        sparkle.style.opacity = '1';

        document.body.appendChild(sparkle);

        anime({
            targets: sparkle,
            translateY: -30,    // Increased upward movement
            scale: [
                { value: 2, duration: 600, easing: 'easeOutSine' },  // Increased scale size
                { value: 1.5, duration: 600, easing: 'easeOutSine' }
            ],
            duration: 2400,     // Increased duration for slower effect
            easing: 'easeOutSine',
            opacity: { value: 0, duration: 2400 },
            complete: () => {
                sparkle.remove();
            }
        });
    }
};

export const addUnhealEffect = (token, showIcon = true) => {
    if (showIcon) {
        const icon = document.createElement('div');
        icon.className = 'unheal-effect-icon';
        icon.dataset.charId = token.dataset.charId;
        icon.innerHTML = '💔';
        icon.style.position = 'absolute';
        icon.style.zIndex = '10';

        const { left, top } = token.getBoundingClientRect();
        icon.style.left = `${left + token.offsetWidth + 10}px`;  // Adjusted position
        icon.style.top = `${top + 10}px`;

        document.body.appendChild(icon);

        setTimeout(() => {
            icon.classList.add('fade-out');
            setTimeout(() => icon.remove(), 500);
        }, 3000);
    }
};

export const addRadiantSlashEffect = (token) => {
    const slash = document.createElement('div');
    slash.className = 'radiant-slash-effect';
    token.appendChild(slash);

    anime({
        targets: slash,
        scaleX: [0.1, 6, 0.1],  // Increased scaleX
        scaleY: [1, 8, 0.5],    // Increased scaleY
        opacity: [1, 0],
        duration: 400,          // Increased duration
        easing: 'easeInOutQuad',
        complete: () => {
            slash.remove();
        }
    });
};

export const createGoldenSparkles = (token) => {
    const sparklesCount = 25;  // Number of sparkles
    const tokenRect = token.getBoundingClientRect(); // Get the token's position

    console.log("Token Rect:", tokenRect); // Debug: Check if token rect is correctly obtained

    for (let i = 0; i < sparklesCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'golden-sparkle';
        sparkle.style.position = 'absolute'; // Position the sparkle absolutely

        // Calculate the initial position centered around the token
        const posX = (tokenRect.left + tokenRect.width / 2) - 5; // Centering the sparkle
        const posY = (tokenRect.top + tokenRect.height / 2) - 5; // Centering the sparkle

        sparkle.style.left = `${posX}px`; // Set horizontal position
        sparkle.style.top = `${posY}px`;  // Set vertical position

        document.body.appendChild(sparkle); // Append to the body for visibility

        // Define a slight random offset for the sparkle's movement
        const directionX = (Math.random() - 0.5) * 50; // Random horizontal direction
        const directionY = (Math.random() - 0.5) * 50; // Random vertical direction

        // Animate the sparkle
        anime({
            targets: sparkle,
            translateX: directionX, // Move in the random horizontal direction
            translateY: directionY, // Move in the random vertical direction
            scale: [0.5, 1], // Increased sparkle size
            opacity: [1, 0], // Fade out
            duration: 1400, // Increased duration
            easing: 'easeOutExpo',
            complete: () => {
                sparkle.remove(); // Remove after animation
            }
        });
    }
};

export const addSlowEffect = (token, showIcon = true) => {
    if (showIcon) {
        const icon = document.createElement('div');
        icon.className = 'slow-effect-icon';
        icon.dataset.charId = token.dataset.charId;
        icon.innerHTML = '🐢';
        icon.style.position = 'absolute';
        icon.style.zIndex = '10';

        const { left, top } = token.getBoundingClientRect();
        icon.style.left = `${left + token.offsetWidth + 10}px`;  // Adjusted position
        icon.style.top = `${top + 10}px`;

        document.body.appendChild(icon);

        setTimeout(() => {
            icon.classList.add('fade-out');
            setTimeout(() => icon.remove(), 500);
        }, 3000);
    }
};
export const createAcidBubbles = (token) => {
    const bubblesCount = 20;  // Number of bubbles
    const tokenRect = token.getBoundingClientRect(); // Get the token's position

    for (let i = 0; i < bubblesCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'poison-bubble'; // Use a new class for styling
        bubble.style.position = 'absolute';

        // Calculate the initial position centered around the token
        const posX = (tokenRect.left + tokenRect.width / 2) - 10; // Centering the bubble
        const posY = (tokenRect.top + tokenRect.height / 2) - 10; // Centering the bubble

        bubble.style.left = `${posX}px`; // Set horizontal position
        bubble.style.top = `${posY}px`;  // Set vertical position

        document.body.appendChild(bubble); // Append to the body for visibility

        // Define random directions for the bubble's movement
        const directionX = (Math.random() - 0.5) * 50; // Random horizontal direction
        const directionY = (Math.random() - 0.5) * 50; // Random vertical direction

        // Animate the bubble
        anime({
            targets: bubble,
            translateX: directionX, // Slight horizontal movement
            translateY: directionY - 30, // Move upward while having some random vertical spread
            scale: [0.5, 1.5], // Bubble grows larger
            opacity: [1, 0], // Fade out
            duration: 5000, // Increased duration for a smoother effect
            easing: 'easeOutExpo',
            complete: () => {
                bubble.remove(); // Remove after animation
            }
        });

        
        
    }
};