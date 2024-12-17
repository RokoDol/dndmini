import './Effects.css'; // You can add your animations and styles in this file

export const applyEffect = (effect, targetId) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    switch (effect) {
        case 'fireball':
            targetElement.classList.add('fireball-animation');
            break;
        case 'heal':
            targetElement.classList.add('heal-animation');
            break;
        case 'lightning':
            targetElement.classList.add('lightning-animation');
            break;
        default:
            console.warn('Unknown effect:', effect);
    }

    // Remove animation class after the animation ends
    setTimeout(() => {
        targetElement.classList.remove(`${effect}-animation`);
    }, 3000); // Adjust based on the animation duration
};